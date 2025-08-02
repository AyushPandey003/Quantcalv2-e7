import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { createAuthResponse, createErrorResponse } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return createErrorResponse(400, 'Refresh token is required');
    }

    const result = await AuthService.refreshToken(refreshToken);

    if (!result.success) {
      return createErrorResponse(401, result.message);
    }

    return createAuthResponse(200, result.message, {
      user: result.user,
      tokens: result.tokens,
    });
  } catch (error) {
    console.error('Token refresh API error:', error);
    return createErrorResponse(500, 'Internal server error');
  }
}
