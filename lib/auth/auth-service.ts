import { db } from '@/lib/db/db';
import { 
  users, 
  userSessions, 
  emailVerificationTokens, 
  passwordResetTokens,
  userPreferences,
  userActivityLogs,
  type User,
  type NewUser,
  type UserSession,
  type NewUserSession
} from '@/lib/db/schema';
import { JWTAuth, generateSecureToken, isTokenExpired } from './jwt';
import { PasswordUtils } from './password';
import { eq, and } from 'drizzle-orm';

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface LoginData {
  email: string;
  password: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: Omit<User, 'passwordHash'>;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export class AuthService {
  // Register a new user
  static async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Test database connection first
      try {
        await db.execute('SELECT 1 as test');
      } catch (dbError) {
        console.error('Database connection test failed:', dbError);
        return {
          success: false,
          message: 'Database connection failed. Please try again later.',
        };
      }

      // Validate password strength
      const passwordValidation = PasswordUtils.validatePasswordStrength(data.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.errors.join(', '),
        };
      }

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email.toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        return {
          success: false,
          message: 'User with this email already exists',
        };
      }

      // Check username if provided
      if (data.username) {
        const existingUsername = await db
          .select()
          .from(users)
          .where(eq(users.username, data.username))
          .limit(1);

        if (existingUsername.length > 0) {
          return {
            success: false,
            message: 'Username is already taken',
          };
        }
      }

      // Hash password
      const passwordHash = await PasswordUtils.hashPassword(data.password);

      // Create user
      const newUser: NewUser = {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        isEmailVerified: false,
        isActive: true,
        role: 'user',
      };

      console.log('Attempting to create user:', { ...newUser, passwordHash: '[HIDDEN]' });

      const [createdUser] = await db.insert(users).values(newUser).returning();
      console.log('User created successfully:', createdUser.id);

      // Create default user preferences
      await db.insert(userPreferences).values({
        userId: createdUser.id,
      });

      // Generate email verification token
      const verificationToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await db.insert(emailVerificationTokens).values({
        token: verificationToken,
        userId: createdUser.id,
        expiresAt,
      });

      // Log activity
      await this.logActivity(createdUser.id, 'user_registered', {
        email: createdUser.email,
      });

      // Remove password hash from response
      const { passwordHash: _, ...userWithoutPassword } = createdUser;

      return {
        success: true,
        message: 'User registered successfully. Please check your email for verification.',
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          return {
            success: false,
            message: 'User with this email or username already exists.',
          };
        }
        if (error.message.includes('database')) {
          return {
            success: false,
            message: 'Database connection error. Please try again.',
          };
        }
        if (error.message.includes('schema')) {
          return {
            success: false,
            message: 'Invalid data format. Please check your input.',
          };
        }
        if (error.message.includes('relation') || error.message.includes('table')) {
          return {
            success: false,
            message: 'Database schema error. Tables may not exist.',
          };
        }
      }
      
      return {
        success: false,
        message: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Login user
  static async login(data: LoginData): Promise<AuthResult> {
    try {
      console.log('Login attempt for email:', data.email);
      
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email.toLowerCase()))
        .limit(1);

      if (!user) {
        console.log('User not found for email:', data.email);
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      console.log('User found:', { id: user.id, email: user.email, isActive: user.isActive });

      // Check if user is active
      if (!user.isActive) {
        console.log('User account is deactivated:', user.id);
        return {
          success: false,
          message: 'Account is deactivated. Please contact support.',
        };
      }

      // Verify password
      console.log('Verifying password for user:', user.id);
      const isPasswordValid = await PasswordUtils.verifyPassword(data.password, user.passwordHash);
      console.log('Password verification result:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('Invalid password for user:', user.id);
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Generate JWT tokens
      console.log('Generating JWT tokens for user:', user.id);
      const tokenPair = await JWTAuth.generateTokenPair(user.id, user.email, user.role || 'user');
      console.log('JWT tokens generated successfully');

      // Save refresh token to database
      const sessionData: NewUserSession = {
        userId: user.id,
        refreshToken: tokenPair.refreshToken,
        deviceInfo: data.deviceInfo,
        ipAddress: data.ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      console.log('Saving session to database for user:', user.id);
      await db.insert(userSessions).values(sessionData);
      console.log('Session saved successfully');

      // Log activity
      console.log('Logging login activity for user:', user.id);
      await this.logActivity(user.id, 'user_login', {
        ipAddress: data.ipAddress,
        deviceInfo: data.deviceInfo,
      });

      // Remove password hash from response
      const { passwordHash: _, ...userWithoutPassword } = user;

      console.log('Login successful for user:', user.id);
      return {
        success: true,
        message: 'Login successful',
        user: userWithoutPassword,
        tokens: {
          accessToken: tokenPair.accessToken,
          refreshToken: tokenPair.refreshToken,
          expiresIn: tokenPair.expiresIn,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('JWT')) {
          return {
            success: false,
            message: 'Token generation failed. Please try again.',
          };
        }
        if (error.message.includes('session') || error.message.includes('user_sessions')) {
          return {
            success: false,
            message: 'Session creation failed. Please try again.',
          };
        }
        if (error.message.includes('database')) {
          return {
            success: false,
            message: 'Database error during login. Please try again.',
          };
        }
      }
      
      return {
        success: false,
        message: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Refresh access token
  static async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // Verify refresh token
      const decoded = await JWTAuth.verifyRefreshToken(refreshToken);
      if (!decoded) {
        return {
          success: false,
          message: 'Invalid refresh token',
        };
      }

      // Find session in database
      const [session] = await db
        .select()
        .from(userSessions)
        .where(
          and(
            eq(userSessions.refreshToken, refreshToken),
            eq(userSessions.isActive, true)
          )
        )
        .limit(1);

      if (!session) {
        return {
          success: false,
          message: 'Session not found or expired',
        };
      }

      // Check if session is expired
      if (isTokenExpired(session.expiresAt)) {
        // Deactivate expired session
        await db
          .update(userSessions)
          .set({ isActive: false })
          .where(eq(userSessions.id, session.id));

        return {
          success: false,
          message: 'Session expired',
        };
      }

      // Get user details
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'User not found or deactivated',
        };
      }

      // Generate new token pair
      const tokenPair = await JWTAuth.generateTokenPair(user.id, user.email, user.role || 'user');

      // Update session with new refresh token
      await db
        .update(userSessions)
        .set({
          refreshToken: tokenPair.refreshToken,
          lastUsedAt: new Date(),
        })
        .where(eq(userSessions.id, session.id));

      // Remove password hash from response
      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        success: true,
        message: 'Token refreshed successfully',
        user: userWithoutPassword,
        tokens: {
          accessToken: tokenPair.accessToken,
          refreshToken: tokenPair.refreshToken,
          expiresIn: tokenPair.expiresIn,
        },
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Token refresh failed',
      };
    }
  }

  // Logout user (invalidate session)
  static async logout(refreshToken: string): Promise<{ success: boolean; message: string }> {
    try {
      await db
        .update(userSessions)
        .set({ isActive: false })
        .where(eq(userSessions.refreshToken, refreshToken));

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed',
      };
    }
  }

  // Verify email
  static async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const [verificationToken] = await db
        .select()
        .from(emailVerificationTokens)
        .where(eq(emailVerificationTokens.token, token))
        .limit(1);

      if (!verificationToken) {
        return {
          success: false,
          message: 'Invalid verification token',
        };
      }

      if (isTokenExpired(verificationToken.expiresAt)) {
        return {
          success: false,
          message: 'Verification token has expired',
        };
      }

      // Update user email verification status
      await db
        .update(users)
        .set({ isEmailVerified: true })
        .where(eq(users.id, verificationToken.userId));

      // Delete verification token
      await db
        .delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.id, verificationToken.id));

      // Log activity
      await this.logActivity(verificationToken.userId, 'email_verified');

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

  // Request password reset
  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (!user) {
        // Return success even if user not found for security
        return {
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.',
        };
      }

      // Generate reset token
      const resetToken = generateSecureToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResetTokens).values({
        token: resetToken,
        userId: user.id,
        expiresAt,
      });

      // Log activity
      await this.logActivity(user.id, 'password_reset_requested');

      // Attempt to send email if Gmail credentials configured
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
        const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
        const { sendPasswordResetEmail } = await import('./gmail-mailer');
        const mailResult = await sendPasswordResetEmail(user.email, resetLink);
        if (!mailResult.success) {
          console.warn('Password reset email failed to send');
        }
      } catch (mailError) {
        console.warn('Gmail not configured or send failed:', mailError);
      }

      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        message: 'Password reset request failed',
      };
    }
  }

  // Reset password
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate password strength
      const passwordValidation = PasswordUtils.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.errors.join(', '),
        };
      }

      const [resetToken] = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, token))
        .limit(1);

      if (!resetToken) {
        return {
          success: false,
          message: 'Invalid reset token',
        };
      }

      if (isTokenExpired(resetToken.expiresAt)) {
        return {
          success: false,
          message: 'Reset token has expired',
        };
      }

      // Hash new password
      const passwordHash = await PasswordUtils.hashPassword(newPassword);

      // Update user password
      await db
        .update(users)
        .set({ passwordHash })
        .where(eq(users.id, resetToken.userId));

      // Delete reset token
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, resetToken.id));

      // Invalidate all user sessions
      await db
        .update(userSessions)
        .set({ isActive: false })
        .where(eq(userSessions.userId, resetToken.userId));

      // Log activity
      await this.logActivity(resetToken.userId, 'password_reset_completed');

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'Password reset failed',
      };
    }
  }

  // Log user activity
  private static async logActivity(
    userId: string,
    action: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await db.insert(userActivityLogs).values({
        userId,
        action,
        details,
        ipAddress,
        userAgent,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<AuthResult> {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const { passwordHash, ...userWithoutPassword } = user[0];

      return {
        success: true,
        message: 'User found',
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error('Get user by ID error:', error);
      return {
        success: false,
        message: 'Failed to get user',
      };
    }
  }

  // Change user password
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get user with current password hash
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await PasswordUtils.verifyPassword(
        currentPassword,
        user[0].passwordHash
      );

      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect',
        };
      }

      // Validate new password strength
      const passwordValidation = PasswordUtils.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.errors.join(', '),
        };
      }

      // Hash new password
      const newPasswordHash = await PasswordUtils.hashPassword(newPassword);

      // Update password
      await db
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Invalidate all user sessions (force re-login)
      await db
        .update(userSessions)
        .set({ isActive: false })
        .where(eq(userSessions.userId, userId));

      await this.logActivity(userId, 'password_changed');

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Failed to change password',
      };
    }
  }
}
