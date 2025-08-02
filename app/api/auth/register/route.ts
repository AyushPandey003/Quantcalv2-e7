import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';
import { createAuthResponse, createErrorResponse } from '@/lib/auth/middleware';

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
