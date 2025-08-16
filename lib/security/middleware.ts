import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterService } from './rate-limiter';
import { RecaptchaService } from './recaptcha';

export interface SecurityMiddlewareConfig {
  enableRateLimit?: boolean;
  enableIPBlock?: boolean;
  enableRecaptcha?: boolean;
  recaptchaAction?: string;
  rateLimitType?: 'login' | 'register' | 'api' | 'password_reset';
  bypassPaths?: string[];
}

export class SecurityMiddleware {
  private static config: SecurityMiddlewareConfig = {
    enableRateLimit: true,
    enableIPBlock: true,
    enableRecaptcha: false,
    bypassPaths: ['/api/health', '/api/test'],
  };

  static configure(config: Partial<SecurityMiddlewareConfig>) {
    this.config = { ...this.config, ...config };
  }

  static async handle(
    request: NextRequest,
    config?: Partial<SecurityMiddlewareConfig>
  ): Promise<NextResponse | null> {
    const finalConfig = { ...this.config, ...config };
    const url = new URL(request.url);
    const path = url.pathname;

    // Check if path should be bypassed
    if (finalConfig.bypassPaths?.some(bypassPath => path.startsWith(bypassPath))) {
      return null;
    }

    const clientIP = RateLimiterService.getClientIP(request.headers);

    // 1. IP Blocking Check
    if (finalConfig.enableIPBlock) {
      const ipBlockInfo = await RateLimiterService.checkIPBlock(clientIP);
      if (ipBlockInfo.isBlocked) {
        await RateLimiterService.logSecurityEvent(clientIP, 'blocked_request', {
          path,
          blockType: ipBlockInfo.blockType,
          blockExpiry: ipBlockInfo.blockExpiry,
        });

        return NextResponse.json(
          {
            error: 'Access denied',
            message: ipBlockInfo.blockType === 'permanent'
              ? 'Your IP address has been permanently blocked due to repeated violations.'
              : `Your IP address is temporarily blocked until ${new Date(ipBlockInfo.blockExpiry!).toISOString()}`,
            code: 'IP_BLOCKED',
          },
          { status: 403 }
        );
      }
    }

    // 2. Rate Limiting Check
    if (finalConfig.enableRateLimit && finalConfig.rateLimitType) {
      let rateLimitResult;

      switch (finalConfig.rateLimitType) {
        case 'login':
          const email = await this.extractEmailFromRequest(request);
          rateLimitResult = await RateLimiterService.checkLoginRateLimit(clientIP, email || 'unknown');
          break;
        case 'register':
          rateLimitResult = await RateLimiterService.checkRegisterRateLimit(clientIP);
          break;
        case 'password_reset':
          const resetEmail = await this.extractEmailFromRequest(request);
          rateLimitResult = await RateLimiterService.checkPasswordResetRateLimit(resetEmail || 'unknown');
          break;
        case 'api':
        default:
          rateLimitResult = await RateLimiterService.checkAPIRateLimit(clientIP);
          break;
      }

      if (!rateLimitResult.success) {
        await RateLimiterService.logSecurityEvent(clientIP, 'rate_limit_exceeded', {
          path,
          rateLimitType: finalConfig.rateLimitType,
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        });

        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: rateLimitResult.blocked
              ? rateLimitResult.blockReason
              : `Too many requests. Please try again in ${Math.ceil((rateLimitResult.reset - Date.now()) / 1000)} seconds.`,
            code: 'RATE_LIMIT_EXCEEDED',
            reset: rateLimitResult.reset,
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': rateLimitResult.limit.toString(),
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.reset.toString(),
              'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
            }
          }
        );
      }
    }

    // 3. reCAPTCHA Verification
    if (finalConfig.enableRecaptcha) {
      const recaptchaToken = request.headers.get('x-recaptcha-token') || 
                           (await request.formData()).get('recaptchaToken') as string;

      if (!recaptchaToken) {
        await RateLimiterService.logSecurityEvent(clientIP, 'recaptcha_missing', {
          path,
          action: finalConfig.recaptchaAction,
        });

        return NextResponse.json(
          {
            error: 'reCAPTCHA required',
            message: 'Please complete the reCAPTCHA verification.',
            code: 'RECAPTCHA_MISSING',
          },
          { status: 400 }
        );
      }

      const recaptchaResult = await RecaptchaService.verifyToken(
        recaptchaToken,
        clientIP
      );

      if (!recaptchaResult.success) {
        // Increment reCAPTCHA failure count
        await RateLimiterService.incrementFailedAttempts(clientIP);
        
        await RateLimiterService.logSecurityEvent(clientIP, 'recaptcha_failed', {
          path,
          action: finalConfig.recaptchaAction,
          error: recaptchaResult.error,
          score: recaptchaResult.score,
        });

        return NextResponse.json(
          {
            error: 'reCAPTCHA verification failed',
            message: recaptchaResult.error || 'Please complete the reCAPTCHA verification again.',
            code: 'RECAPTCHA_FAILED',
          },
          { status: 400 }
        );
      }

      // Log successful reCAPTCHA verification
      await RateLimiterService.logSecurityEvent(clientIP, 'recaptcha_success', {
        path,
        action: finalConfig.recaptchaAction,
        score: recaptchaResult.score,
      });
    }

    return null; // Continue with the request
  }

  private static async extractEmailFromRequest(request: NextRequest): Promise<string | null> {
    try {
      // Try to get email from form data
      const formData = await request.formData();
      const email = formData.get('email') as string;
      if (email) return email;

      // Try to get email from JSON body
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const body = await request.json();
        return body.email || null;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create a middleware function for specific routes
   */
  static createMiddleware(config: SecurityMiddlewareConfig) {
    return async (request: NextRequest) => {
      return await this.handle(request, config);
    };
  }

  /**
   * Log security event
   */
  static async logEvent(
    request: NextRequest,
    event: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    const clientIP = RateLimiterService.getClientIP(request.headers);
    await RateLimiterService.logSecurityEvent(clientIP, event, details);
  }
}

// Pre-configured middleware functions
export const loginSecurityMiddleware = SecurityMiddleware.createMiddleware({
  enableRateLimit: true,
  enableIPBlock: true,
  enableRecaptcha: true,
  recaptchaAction: 'login',
  rateLimitType: 'login',
});

export const registerSecurityMiddleware = SecurityMiddleware.createMiddleware({
  enableRateLimit: true,
  enableIPBlock: true,
  enableRecaptcha: true,
  recaptchaAction: 'register',
  rateLimitType: 'register',
});

export const apiSecurityMiddleware = SecurityMiddleware.createMiddleware({
  enableRateLimit: true,
  enableIPBlock: true,
  enableRecaptcha: false,
  rateLimitType: 'api',
});

export const passwordResetSecurityMiddleware = SecurityMiddleware.createMiddleware({
  enableRateLimit: true,
  enableIPBlock: true,
  enableRecaptcha: true,
  recaptchaAction: 'password_reset',
  rateLimitType: 'password_reset',
});
