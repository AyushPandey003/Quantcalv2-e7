import { db } from '@/lib/db/db';
import { 
  users, 
  userPreferences, 
  userActivityLogs,
  type User,
  type UserPreferences,
  type NewUserPreferences
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface UserProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  profileImage?: string;
}

export interface UserSettingsData {
  // Display Settings
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  chartHeight: number;
  colorScheme: 'default' | 'colorblind' | 'monochrome' | 'vibrant';
  showGrid: boolean;
  showVolume: boolean;

  // Accessibility Settings
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNav: boolean;
  focusIndicators: boolean;

  // Notification Settings
  priceAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundAlerts: boolean;
  alertFrequency: 'immediate' | '5min' | '15min' | '1hour' | 'daily';

  // Data Settings
  dataRetention: '30days' | '90days' | '6months' | '1year' | 'forever';
  autoSync: boolean;
  exportFormat: 'json' | 'csv' | 'xlsx';
  apiAccess: boolean;

  // Trading Settings
  confirmOrders: boolean;
  defaultLeverage: number;
  riskWarnings: boolean;
  paperTrading: boolean;

  // Privacy Settings
  shareData: boolean;
  analytics: boolean;
  cookies: boolean;
  twoFactor: boolean;
}

export interface ProfileUpdateResult {
  success: boolean;
  message: string;
  user?: User;
  preferences?: UserPreferences;
}

export class UserProfileService {
  // Get user profile by ID
  static async getUserProfile(userId: string): Promise<ProfileUpdateResult> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const [preferences] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1);

      return {
        success: true,
        message: 'User profile retrieved successfully',
        user,
        preferences: preferences || null,
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      return {
        success: false,
        message: 'Failed to retrieve user profile',
      };
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, profileData: UserProfileData): Promise<ProfileUpdateResult> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Update user profile
      const updatedUser = await db
        .update(users)
        .set({
          ...profileData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      // Log activity
      await this.logActivity(userId, 'profile_updated', {
        updatedFields: Object.keys(profileData),
      });

      return {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser[0],
      };
    } catch (error) {
      console.error('Update user profile error:', error);
      return {
        success: false,
        message: 'Failed to update profile',
      };
    }
  }

  // Update user settings
  static async updateUserSettings(userId: string, settingsData: UserSettingsData): Promise<ProfileUpdateResult> {
    try {
      // Check if user exists
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Check if preferences exist
      const [existingPreferences] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1);

      const preferencesData: NewUserPreferences = {
        userId,
        theme: settingsData.theme,
        notifications: {
          email: settingsData.emailNotifications,
          push: settingsData.pushNotifications,
          priceAlerts: settingsData.priceAlerts,
          soundAlerts: settingsData.soundAlerts,
          alertFrequency: settingsData.alertFrequency,
        },
        tradingPreferences: {
          confirmOrders: settingsData.confirmOrders,
          defaultLeverage: settingsData.defaultLeverage,
          riskWarnings: settingsData.riskWarnings,
          paperTrading: settingsData.paperTrading,
          showGrid: settingsData.showGrid,
          showVolume: settingsData.showVolume,
          fontSize: settingsData.fontSize,
          chartHeight: settingsData.chartHeight,
          colorScheme: settingsData.colorScheme,
        },
        accessibilitySettings: {
          highContrast: settingsData.highContrast,
          reducedMotion: settingsData.reducedMotion,
          screenReader: settingsData.screenReader,
          keyboardNav: settingsData.keyboardNav,
          focusIndicators: settingsData.focusIndicators,
        },
        privacySettings: {
          shareData: settingsData.shareData,
          analytics: settingsData.analytics,
          cookies: settingsData.cookies,
          twoFactor: settingsData.twoFactor,
        },
        dataSettings: {
          dataRetention: settingsData.dataRetention,
          autoSync: settingsData.autoSync,
          exportFormat: settingsData.exportFormat,
          apiAccess: settingsData.apiAccess,
        },
        updatedAt: new Date(),
      };

      let updatedPreferences: UserPreferences;

      if (existingPreferences) {
        // Update existing preferences
        const result = await db
          .update(userPreferences)
          .set(preferencesData)
          .where(eq(userPreferences.userId, userId))
          .returning();
        updatedPreferences = result[0];
      } else {
        // Create new preferences
        const result = await db
          .insert(userPreferences)
          .values(preferencesData)
          .returning();
        updatedPreferences = result[0];
      }

      // Log activity
      await this.logActivity(userId, 'settings_updated', {
        updatedSettings: Object.keys(settingsData),
      });

      return {
        success: true,
        message: 'Settings updated successfully',
        preferences: updatedPreferences,
      };
    } catch (error) {
      console.error('Update user settings error:', error);
      return {
        success: false,
        message: 'Failed to update settings',
      };
    }
  }

  // Change user password
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<ProfileUpdateResult> {
    try {
      const { PasswordUtils } = await import('./password');

      // Get user with current password hash
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await PasswordUtils.verifyPassword(
        currentPassword,
        user.passwordHash
      );

      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect',
        };
      }

      // Hash new password
      const newPasswordHash = await PasswordUtils.hashPassword(newPassword);

      // Update password
      const updatedUser = await db
        .update(users)
        .set({
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      // Log activity
      await this.logActivity(userId, 'password_changed');

      return {
        success: true,
        message: 'Password changed successfully',
        user: updatedUser[0],
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Failed to change password',
      };
    }
  }

  // Export user data
  static async exportUserData(userId: string): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const [preferences] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1);

      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        preferences: preferences || null,
        exportDate: new Date().toISOString(),
      };

      return {
        success: true,
        data: exportData,
        message: 'Data exported successfully',
      };
    } catch (error) {
      console.error('Export user data error:', error);
      return {
        success: false,
        message: 'Failed to export user data',
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
} 