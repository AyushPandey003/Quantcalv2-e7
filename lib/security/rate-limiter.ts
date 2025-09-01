import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limit configurations
const RATE_LIMITS = {
  // Login attempts per IP
  LOGIN_ATTEMPTS: {
    window: '5 m', // 5 minutes
    max: 5, // 5 attempts per 5 minutes
  },
  // Login attempts per email
  LOGIN_EMAIL: {
    window: '15 m', // 15 minutes
    max: 3, // 3 attempts per 15 minutes
  },
  // Registration attempts per IP
  REGISTER_ATTEMPTS: {
    window: '10 m', // 10 minutes
    max: 3, // 3 attempts per 10 minutes
  },
  // Password reset requests per email
  PASSWORD_RESET: {
    window: '1 h', // 1 hour
    max: 3, // 3 attempts per hour
  },
  // General API requests per IP
  API_REQUESTS: {
    window: '1 m', // 1 minute
    max: 60, // 60 requests per minute
  },
  // reCAPTCHA verification failures per IP
  RECAPTCHA_FAILURES: {
    window: '10 m', // 10 minutes
    max: 5, // 5 failures per 10 minutes
  },
  // Price alert creations per user
  PRICE_ALERT_CREATE: {
    window: '1 m', // per minute burst control
    max: 20,
  },
  // Trading account creations per user
  TRADING_ACCOUNT_CREATE: {
    window: '1 h', // per hour
    max: 5,
  },
} as const;

// Create rate limiters
const rateLimiters = {
  loginAttempts: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.LOGIN_ATTEMPTS.max, RATE_LIMITS.LOGIN_ATTEMPTS.window),
    analytics: true,
    prefix: 'login_attempts',
  }),
  loginEmail: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.LOGIN_EMAIL.max, RATE_LIMITS.LOGIN_EMAIL.window),
    analytics: true,
    prefix: 'login_email',
  }),
  registerAttempts: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.REGISTER_ATTEMPTS.max, RATE_LIMITS.REGISTER_ATTEMPTS.window),
    analytics: true,
    prefix: 'register_attempts',
  }),
  passwordReset: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.PASSWORD_RESET.max, RATE_LIMITS.PASSWORD_RESET.window),
    analytics: true,
    prefix: 'password_reset',
  }),
  apiRequests: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.API_REQUESTS.max, RATE_LIMITS.API_REQUESTS.window),
    analytics: true,
    prefix: 'api_requests',
  }),
  recaptchaFailures: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.RECAPTCHA_FAILURES.max, RATE_LIMITS.RECAPTCHA_FAILURES.window),
    analytics: true,
    prefix: 'recaptcha_failures',
  }),
  priceAlertCreate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.PRICE_ALERT_CREATE.max, RATE_LIMITS.PRICE_ALERT_CREATE.window),
    analytics: true,
    prefix: 'price_alert_create',
  }),
  tradingAccountCreate: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMITS.TRADING_ACCOUNT_CREATE.max, RATE_LIMITS.TRADING_ACCOUNT_CREATE.window),
    analytics: true,
    prefix: 'trading_account_create',
  }),
};

// IP blocking configuration
const IP_BLOCK_CONFIG = {
  // Block IP after this many failed attempts
  FAILED_ATTEMPTS_THRESHOLD: 10,
  // Block duration in seconds
  BLOCK_DURATION: 24 * 60 * 60, // 24 hours
  // Permanent block after this many temporary blocks
  PERMANENT_BLOCK_THRESHOLD: 3,
} as const;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  blocked: boolean;
  blockReason?: string;
}

export interface IPBlockInfo {
  isBlocked: boolean;
  blockType: 'temporary' | 'permanent' | null;
  blockExpiry?: number;
  failedAttempts: number;
  blockCount: number;
}

export class RateLimiterService {
  /**
   * Check if an IP is blocked
   */
  static async checkIPBlock(ip: string): Promise<IPBlockInfo> {
    const blockKey = `ip_block:${ip}`;
    const failedKey = `ip_failed:${ip}`;
    const blockCountKey = `ip_block_count:${ip}`;

    const [blockData, failedAttempts, blockCount] = await Promise.all([
      redis.get(blockKey),
      redis.get(failedKey),
      redis.get(blockCountKey),
    ]);

    const failed = (failedAttempts as number) || 0;
    const blockCountNum = (blockCount as number) || 0;

    if (blockData) {
      const blockInfo = blockData as { type: 'temporary' | 'permanent'; expiry?: number };
      
      if (blockInfo.type === 'permanent') {
        return {
          isBlocked: true,
          blockType: 'permanent',
          failedAttempts: failed,
          blockCount: blockCountNum,
        };
      }

      if (blockInfo.expiry && Date.now() < blockInfo.expiry) {
        return {
          isBlocked: true,
          blockType: 'temporary',
          blockExpiry: blockInfo.expiry,
          failedAttempts: failed,
          blockCount: blockCountNum,
        };
      }

      // Block expired, remove it
      await redis.del(blockKey);
    }

    return {
      isBlocked: false,
      blockType: null,
      failedAttempts: failed,
      blockCount: blockCountNum,
    };
  }

  /**
   * Check rate limit for price alert creations per user
   */
  static async checkPriceAlertCreationRate(userId: string): Promise<RateLimitResult> {
    const result = await rateLimiters.priceAlertCreate.limit(userId);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      blocked: false,
    };
  }

  /**
   * Check rate limit for trading account creations per user
   */
  static async checkTradingAccountCreationRate(userId: string): Promise<RateLimitResult> {
    const result = await rateLimiters.tradingAccountCreate.limit(userId);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      blocked: false,
    };
  }

  /**
   * Block an IP address
   */
  static async blockIP(ip: string, reason: string, duration?: number): Promise<void> {
    const blockKey = `ip_block:${ip}`;
    const blockCountKey = `ip_block_count:${ip}`;

    const blockCount = ((await redis.get(blockCountKey)) as number) || 0;
    const newBlockCount = blockCount + 1;

    // Check if this should be a permanent block
    const isPermanent = newBlockCount >= IP_BLOCK_CONFIG.PERMANENT_BLOCK_THRESHOLD;

    const blockData = {
      type: isPermanent ? 'permanent' as const : 'temporary' as const,
      reason,
      timestamp: Date.now(),
      ...(isPermanent ? {} : { expiry: Date.now() + (duration || IP_BLOCK_CONFIG.BLOCK_DURATION) * 1000 }),
    };

    await Promise.all([
      redis.set(blockKey, blockData),
      redis.set(blockCountKey, newBlockCount),
    ]);

    console.log(`🚫 IP ${ip} blocked: ${reason} (${isPermanent ? 'permanent' : 'temporary'})`);
  }

  /**
   * Increment failed attempts for an IP
   */
  static async incrementFailedAttempts(ip: string): Promise<void> {
    const failedKey = `ip_failed:${ip}`;
    const failedAttempts = ((await redis.get(failedKey)) as number) || 0;
    const newFailedAttempts = failedAttempts + 1;

    await redis.set(failedKey, newFailedAttempts, { ex: 24 * 60 * 60 }); // Expire after 24 hours

    // Check if IP should be blocked
    if (newFailedAttempts >= IP_BLOCK_CONFIG.FAILED_ATTEMPTS_THRESHOLD) {
      await this.blockIP(ip, `Too many failed attempts: ${newFailedAttempts}`);
    }
  }

  /**
   * Reset failed attempts for an IP (on successful login)
   */
  static async resetFailedAttempts(ip: string): Promise<void> {
    const failedKey = `ip_failed:${ip}`;
    await redis.del(failedKey);
  }

  /**
   * Check rate limit for login attempts
   */
  static async checkLoginRateLimit(ip: string, email: string): Promise<RateLimitResult> {
    // First check if IP is blocked
    const ipBlockInfo = await this.checkIPBlock(ip);
    if (ipBlockInfo.isBlocked) {
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: ipBlockInfo.blockExpiry || 0,
        blocked: true,
        blockReason: ipBlockInfo.blockType === 'permanent' 
          ? 'IP permanently blocked due to repeated violations' 
          : `IP temporarily blocked until ${new Date(ipBlockInfo.blockExpiry!).toISOString()}`,
      };
    }

    // Check rate limits
    const [ipResult, emailResult] = await Promise.all([
      rateLimiters.loginAttempts.limit(ip),
      rateLimiters.loginEmail.limit(email.toLowerCase()),
    ]);

    const isLimited = !ipResult.success || !emailResult.success;
    const reset = Math.max(ipResult.reset, emailResult.reset);

    return {
      success: !isLimited,
      limit: Math.min(ipResult.limit, emailResult.limit),
      remaining: Math.min(ipResult.remaining, emailResult.remaining),
      reset,
      blocked: false,
    };
  }

  /**
   * Check rate limit for registration attempts
   */
  static async checkRegisterRateLimit(ip: string): Promise<RateLimitResult> {
    const ipBlockInfo = await this.checkIPBlock(ip);
    if (ipBlockInfo.isBlocked) {
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: ipBlockInfo.blockExpiry || 0,
        blocked: true,
        blockReason: ipBlockInfo.blockType === 'permanent' 
          ? 'IP permanently blocked due to repeated violations' 
          : `IP temporarily blocked until ${new Date(ipBlockInfo.blockExpiry!).toISOString()}`,
      };
    }

    const result = await rateLimiters.registerAttempts.limit(ip);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      blocked: false,
    };
  }

  /**
   * Check rate limit for password reset requests
   */
  static async checkPasswordResetRateLimit(email: string): Promise<RateLimitResult> {
    const result = await rateLimiters.passwordReset.limit(email.toLowerCase());

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      blocked: false,
    };
  }

  /**
   * Check rate limit for API requests
   */
  static async checkAPIRateLimit(ip: string): Promise<RateLimitResult> {
    const ipBlockInfo = await this.checkIPBlock(ip);
    if (ipBlockInfo.isBlocked) {
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: ipBlockInfo.blockExpiry || 0,
        blocked: true,
        blockReason: ipBlockInfo.blockType === 'permanent' 
          ? 'IP permanently blocked due to repeated violations' 
          : `IP temporarily blocked until ${new Date(ipBlockInfo.blockExpiry!).toISOString()}`,
      };
    }

    const result = await rateLimiters.apiRequests.limit(ip);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      blocked: false,
    };
  }

  /**
   * Check rate limit for reCAPTCHA failures
   */
  static async checkRecaptchaFailureRateLimit(ip: string): Promise<RateLimitResult> {
    const result = await rateLimiters.recaptchaFailures.limit(ip);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      blocked: false,
    };
  }

  /**
   * Get client IP from request headers
   */
  static getClientIP(headers: Headers): string {
    // Check for forwarded headers (common with proxies)
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    // Check for real IP header
    const realIP = headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    // Check for client IP header
    const clientIP = headers.get('x-client-ip');
    if (clientIP) {
      return clientIP;
    }

    // Fallback to connection remote address (if available)
    return '127.0.0.1'; // Default fallback
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(
    ip: string, 
    event: string, 
    details: Record<string, any> = {}
  ): Promise<void> {
    const logKey = `security_log:${Date.now()}`;
    const logData = {
      ip,
      event,
      timestamp: new Date().toISOString(),
      details,
    };

    await redis.set(logKey, logData, { ex: 7 * 24 * 60 * 60 }); // Keep logs for 7 days
  }
}
