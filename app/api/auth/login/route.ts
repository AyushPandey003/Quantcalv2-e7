import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { createAuthResponse, createErrorResponse } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return createErrorResponse(400, 'Email and password are required');
    }

    // Get client info
    const deviceInfo = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     undefined;

    const result = await AuthService.login({
      email,
      password,
      deviceInfo,
      ipAddress,
    });

    if (!result.success) {
      return createErrorResponse(401, result.message);
    }

    return createAuthResponse(200, result.message, {
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    console.error('Login API error:', error);
    return createErrorResponse(500, 'Internal server error');
  }
}
