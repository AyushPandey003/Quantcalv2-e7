'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { AuthService, type RegisterData, type LoginData } from '@/lib/auth/auth-service';
import { JWTAuth } from '@/lib/auth/jwt';
import { db } from '@/lib/db/db';
import { userSessions, userActivityLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Server action response type
export interface ActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[] | undefined>;
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  try {
    // Parse and validate form data
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      username: formData.get('username') as string,
    };

    const validatedData = registerSchema.parse(rawData);

    // Register user
    const result = await AuthService.register(validatedData);

    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    // If registration successful but email verification required
    if (!result.tokens) {
      return {
        success: true,
        message: result.message,
      };
    }

    // Set auth cookies
    await setAuthCookies(result.tokens.accessToken, result.tokens.refreshToken);

    return {
      success: true,
      message: 'Registration successful',
      data: result.user,
    };
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation failed',
        errors: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      message: 'Registration failed. Please try again.',
    };
  }
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  try {
    // Parse and validate form data
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validatedData = loginSchema.parse(rawData);

    // Get device info and IP from headers (in a real app, you'd get these from request)
    const loginData: LoginData = {
      ...validatedData,
      deviceInfo: 'Web Browser', // You can enhance this
      ipAddress: '127.0.0.1', // You'd get real IP from request
    };

    // Authenticate user
    const result = await AuthService.login(loginData);

    if (!result.success || !result.tokens) {
      return {
        success: false,
        message: result.message,
      };
    }

    // Set auth cookies
    await setAuthCookies(result.tokens.accessToken, result.tokens.refreshToken);

    return {
      success: true,
      message: 'Login successful',
      data: result.user,
    };
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation failed',
        errors: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      message: 'Login failed. Please check your credentials.',
    };
  }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (refreshToken) {
      // Verify and invalidate session
      const payload = await JWTAuth.verifyRefreshToken(refreshToken);
      // Use type assertion if sessionId is expected in the payload
      const sessionId = (payload as any).sessionId;
      if (sessionId) {
        await db.update(userSessions)
          .set({ isActive: false })
          .where(eq(userSessions.id, sessionId));
      }
    }

    // Clear auth cookies
    await clearAuthCookies();

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    console.error('Logout error:', error);
    
    // Clear cookies anyway
    await clearAuthCookies();
    
    return {
      success: false,
      message: 'Logout failed, but cookies cleared',
    };
  }
}

export async function refreshTokenAction(): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return {
        success: false,
        message: 'No refresh token found',
      };
    }

    const result = await AuthService.refreshToken(refreshToken);

    if (!result.success || !result.tokens) {
      // Clear invalid cookies
      await clearAuthCookies();
      return {
        success: false,
        message: result.message,
      };
    }

    // Set new auth cookies
    await setAuthCookies(result.tokens.accessToken, result.tokens.refreshToken);

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: result.user,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Clear cookies on error
    await clearAuthCookies();
    
    return {
      success: false,
      message: 'Token refresh failed',
    };
  }
}

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
    };

    const validatedData = changePasswordSchema.parse(rawData);

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: 'Not authenticated',
      };
    }

    const result = await AuthService.changePassword(
      user.id,
      validatedData.currentPassword,
      validatedData.newPassword
    );

    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    // Log password change activity
    await db.insert(userActivityLogs).values({
      userId: user.id,
      action: 'password_changed',
      details: { timestamp: new Date().toISOString() },
      ipAddress: '127.0.0.1', // You'd get real IP from request
    });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  } catch (error) {
    console.error('Change password error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation failed',
        errors: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      message: 'Failed to change password',
    };
  }
}

export async function verifyEmailAction(token: string): Promise<ActionResult> {
  try {
    const result = await AuthService.verifyEmail(token);

    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    console.error('Email verification error:', error);
    
    return {
      success: false,
      message: 'Email verification failed',
    };
  }
}

export async function requestPasswordResetAction(formData: FormData): Promise<ActionResult> {
  try {
    const email = formData.get('email') as string;

    if (!email) {
      return {
        success: false,
        message: 'Email is required',
      };
    }

    const result = await AuthService.requestPasswordReset(email);

    // Always return success for security (don't reveal if email exists)
    return {
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    
    return {
      success: false,
      message: 'Failed to process password reset request',
    };
  }
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const token = formData.get('token') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!token || !newPassword) {
      return {
        success: false,
        message: 'Token and new password are required',
      };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters',
      };
    }

    const result = await AuthService.resetPassword(token, newPassword);

    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: true,
      message: 'Password reset successfully',
    };
  } catch (error) {
    console.error('Password reset error:', error);
    
    return {
      success: false,
      message: 'Failed to reset password',
    };
  }
}

// Helper functions
async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  console.log('🍪 Setting auth cookies...');
  console.log('🔑 Access token length:', accessToken.length);
  console.log('🔄 Refresh token length:', refreshToken.length);
  
  // Set access token cookie (persistent, 1 day)
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 1 day
    path: '/',
  });

  // Set refresh token cookie (persistent, 30 days)
  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });
  
  console.log('✅ Auth cookies set successfully');
}

async function clearAuthCookies() {
  const cookieStore = await cookies();
  
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return null;
    }

    const payload = await JWTAuth.verifyAccessToken(accessToken);
    if (!payload) {
      return null;
    }

    const result = await AuthService.getUserById(payload.sub);
    return result.success ? result.user : null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}
