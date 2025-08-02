import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { createAuthResponse, createErrorResponse } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return createErrorResponse(400, 'Verification token is required');
    }

    const result = await AuthService.verifyEmail(token);

    if (!result.success) {
      return createErrorResponse(400, result.message);
    }

    return createAuthResponse(200, result.message);
  } catch (error) {
    console.error('Email verification API error:', error);
    return createErrorResponse(500, 'Internal server error');
  }
}
