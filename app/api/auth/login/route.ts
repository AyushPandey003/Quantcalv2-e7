import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { createAuthResponse, createErrorResponse } from '@/lib/auth/middleware';
import { RateLimiterService } from '@/lib/security/rate-limiter';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return createErrorResponse(400, 'Email and password are required');
    }

    // Rate limit (combined IP + email) using existing service
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    const rate = await RateLimiterService.checkLoginRateLimit(ipAddress, email);
    if (!rate.success) {
      return NextResponse.json(
        {
          success: false,
            message: rate.blocked
              ? rate.blockReason
              : `Too many login attempts. Try again in ${Math.ceil((rate.reset - Date.now()) / 1000)} seconds.`,
          code: 'RATE_LIMIT_EXCEEDED',
          reset: rate.reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rate.limit.toString(),
            'X-RateLimit-Remaining': rate.remaining.toString(),
            'X-RateLimit-Reset': rate.reset.toString(),
            'Retry-After': Math.ceil((rate.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Get client info
    const deviceInfo = request.headers.get('user-agent') || undefined;
    // ipAddress already determined above

    const result = await AuthService.login({
      email,
      password,
      deviceInfo,
      ipAddress,
    });

    if (!result.success) {
      // Increment failed attempts for IP to support potential blocking
      await RateLimiterService.incrementFailedAttempts(ipAddress);
      return createErrorResponse(401, result.message);
    }

    // Successful login resets failed attempt counter
    await RateLimiterService.resetFailedAttempts(ipAddress);

    return createAuthResponse(200, result.message, {
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    console.error('Login API error:', error);
    return createErrorResponse(500, 'Internal server error');
  }
}
