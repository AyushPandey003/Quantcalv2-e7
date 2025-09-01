import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { createAuthResponse, createErrorResponse } from '@/lib/auth/middleware';
import { RateLimiterService } from '@/lib/security/rate-limiter';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
  const body = await request.json();
  const { email, password, firstName, lastName, username } = body;

    // Validate required fields
    if (!email || !password) {
      return createErrorResponse(400, 'Email and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse(400, 'Invalid email format');
    }

    // Rate limit registration attempts per IP
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    const regRate = await RateLimiterService.checkRegisterRateLimit(ipAddress);
    if (!regRate.success) {
      return NextResponse.json(
        {
          success: false,
          message: regRate.blocked
            ? regRate.blockReason
            : `Too many registration attempts. Try again in ${Math.ceil((regRate.reset - Date.now()) / 1000)} seconds.`,
          code: 'RATE_LIMIT_EXCEEDED',
          reset: regRate.reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': regRate.limit.toString(),
            'X-RateLimit-Remaining': regRate.remaining.toString(),
            'X-RateLimit-Reset': regRate.reset.toString(),
            'Retry-After': Math.ceil((regRate.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const result = await AuthService.register({
      email,
      password,
      firstName,
      lastName,
      username,
    });

    if (!result.success) {
      return createErrorResponse(400, result.message);
    }

    return createAuthResponse(201, result.message, {
      user: result.user,
    });
  } catch (error) {
    console.error('Registration API error:', error);
    return createErrorResponse(500, 'Internal server error');
  }
}
