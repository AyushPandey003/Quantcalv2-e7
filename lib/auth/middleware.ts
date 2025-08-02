import { NextRequest, NextResponse } from 'next/server';
import { JWTAuth, type JWTPayload } from './jwt';
import { db } from '@/lib/db/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload & {
    id: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
  };
}

// Middleware function to authenticate JWT tokens
export async function authenticateToken(request: NextRequest): Promise<{
  success: boolean;
  user?: AuthenticatedRequest['user'];
  error?: string;
}> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = JWTAuth.extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        success: false,
        error: 'No token provided',
      };
    }

    // Verify JWT token
    const decoded = await JWTAuth.verifyAccessToken(token);
    if (!decoded) {
      return {
        success: false,
        error: 'Invalid or expired token',
      };
    }

    // Get user from database to ensure they still exist and are active
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        isEmailVerified: users.isEmailVerified,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: 'Account is deactivated',
      };
    }

    return {
      success: true,
      user: {
        ...decoded,
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        isEmailVerified: user.isEmailVerified || false,
      },
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed',
    };
  }
}

// Middleware function to check for specific roles
export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest): Promise<{
    success: boolean;
    user?: AuthenticatedRequest['user'];
    error?: string;
  }> => {
    const authResult = await authenticateToken(request);
    
    if (!authResult.success || !authResult.user) {
      return authResult;
    }

    if (!allowedRoles.includes(authResult.user.role)) {
      return {
        success: false,
        error: 'Insufficient permissions',
      };
    }

    return authResult;
  };
}

// Middleware function to require email verification
export async function requireEmailVerification(request: NextRequest): Promise<{
  success: boolean;
  user?: AuthenticatedRequest['user'];
  error?: string;
}> {
  const authResult = await authenticateToken(request);
  
  if (!authResult.success || !authResult.user) {
    return authResult;
  }

  if (!authResult.user.isEmailVerified) {
    return {
      success: false,
      error: 'Email verification required',
    };
  }

  return authResult;
}

// Helper function to create authenticated API response
export function createAuthResponse(
  status: number,
  message: string,
  data?: any
): NextResponse {
  return NextResponse.json(
    {
      success: status >= 200 && status < 300,
      message,
      data,
    },
    { status }
  );
}

// Helper function to create error response
export function createErrorResponse(
  status: number,
  message: string,
  error?: string
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      error,
    },
    { status }
  );
}
