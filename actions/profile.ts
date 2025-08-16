'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { UserProfileService, type UserProfileData, type UserSettingsData } from '@/lib/auth/user-profile-service';
import { JWTAuth } from '@/lib/auth/jwt';
import { db } from '@/lib/db/db';
import { userActivityLogs } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

// Validation schemas
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid website URL').optional(),
  twitter: z.string().optional(),
  profileImage: z.string().optional(),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const settingsSchema = z.object({
  // Display Settings
  theme: z.enum(['light', 'dark', 'system']),
  fontSize: z.number().min(12).max(20),
  chartHeight: z.number().min(200).max(800),
  colorScheme: z.enum(['default', 'colorblind', 'monochrome', 'vibrant']),
  showGrid: z.boolean(),
  showVolume: z.boolean(),

  // Accessibility Settings
  highContrast: z.boolean(),
  reducedMotion: z.boolean(),
  screenReader: z.boolean(),
  keyboardNav: z.boolean(),
  focusIndicators: z.boolean(),

  // Notification Settings
  priceAlerts: z.boolean(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  soundAlerts: z.boolean(),
  alertFrequency: z.enum(['immediate', '5min', '15min', '1hour', 'daily']),

  // Data Settings
  dataRetention: z.enum(['30days', '90days', '6months', '1year', 'forever']),
  autoSync: z.boolean(),
  exportFormat: z.enum(['json', 'csv', 'xlsx']),
  apiAccess: z.boolean(),

  // Trading Settings
  confirmOrders: z.boolean(),
  defaultLeverage: z.number().min(1).max(125),
  riskWarnings: z.boolean(),
  paperTrading: z.boolean(),

  // Privacy Settings
  shareData: z.boolean(),
  analytics: z.boolean(),
  cookies: z.boolean(),
  twoFactor: z.boolean(),
});

// Server action response type
export interface ProfileActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[] | undefined>;
}

// Get current user from JWT token
async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return null;
    }

    const payload = await JWTAuth.verifyAccessToken(accessToken);
  // Access token stores user id in standard 'sub' claim
  return (payload as any)?.userId || (payload as any)?.sub || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

// Get user profile
export async function getUserProfileAction(): Promise<ProfileActionResult> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return {
        success: false,
        message: 'Not authenticated',
      };
    }

    const result = await UserProfileService.getUserProfile(userId);

    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    return {
      success: true,
      message: result.message,
      data: {
        user: result.user,
        preferences: result.preferences,
      },
    };
  } catch (error) {
    console.error('Get user profile action error:', error);
    return {
      success: false,
      message: 'Failed to retrieve user profile',
    };
  }
}

// Update user profile
export async function updateUserProfileAction(formData: FormData): Promise<ProfileActionResult> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return {
        success: false,
        message: 'Not authenticated',
      };
    }

    // Parse form data
    const rawData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      username: formData.get('username') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      bio: formData.get('bio') as string,
      location: formData.get('location') as string,
      website: formData.get('website') as string,
      twitter: formData.get('twitter') as string,
      profileImage: formData.get('profileImage') as string,
    };

    // Validate data
    const validatedData = profileSchema.parse(rawData);

    // Convert date string to Date object if provided
    const profileData: UserProfileData = {
      ...validatedData,
      dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : undefined,
    };

    const result = await UserProfileService.updateUserProfile(userId, profileData);

    return {
      success: result.success,
      message: result.message,
      data: result.user,
    };
  } catch (error) {
    console.error('Update user profile action error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation failed',
        errors: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      message: 'Failed to update profile',
    };
  }
}

// Update user settings
export async function updateUserSettingsAction(settingsData: UserSettingsData): Promise<ProfileActionResult> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return {
        success: false,
        message: 'Not authenticated',
      };
    }

    // Validate settings data
    const validatedData = settingsSchema.parse(settingsData);

    const result = await UserProfileService.updateUserSettings(userId, validatedData);

    return {
      success: result.success,
      message: result.message,
      data: result.preferences,
    };
  } catch (error) {
    console.error('Update user settings action error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation failed',
        errors: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      message: 'Failed to update settings',
    };
  }
}

// Change password
export async function changePasswordAction(formData: FormData): Promise<ProfileActionResult> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return {
        success: false,
        message: 'Not authenticated',
      };
    }

    const rawData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
    };

    const validatedData = passwordChangeSchema.parse(rawData);

    const result = await UserProfileService.changePassword(
      userId,
      validatedData.currentPassword,
      validatedData.newPassword
    );

    return {
      success: result.success,
      message: result.message,
      data: result.user,
    };
  } catch (error) {
    console.error('Change password action error:', error);
    
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

// Export user data
export async function exportUserDataAction(): Promise<ProfileActionResult> {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return {
        success: false,
        message: 'Not authenticated',
      };
    }

    const result = await UserProfileService.exportUserData(userId);

    return {
      success: result.success,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error('Export user data action error:', error);
    return {
      success: false,
      message: 'Failed to export user data',
    };
  }
} 

// Get recent user activity logs
export async function getRecentActivityAction(limit: number = 10): Promise<ProfileActionResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: 'Not authenticated' };
    }

    const logs = await db.select()
      .from(userActivityLogs)
      .where(eq(userActivityLogs.userId, userId))
      .orderBy(desc(userActivityLogs.createdAt))
      .limit(limit);

    return {
      success: true,
      message: 'Activity fetched',
      data: logs,
    };
  } catch (error) {
    console.error('Get recent activity error:', error);
    return { success: false, message: 'Failed to fetch activity' };
  }
}