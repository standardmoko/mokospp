import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    getTodayDateString,
    STORAGE_KEYS,
    STORAGE_VERSION,
    StorageResult,
    USAGE_LIMITS,
    UsageTracking
} from '@/types/storage';

/**
 * Usage Tracking Service
 * Manages daily analysis limits and usage statistics
 */
export class UsageTrackingService {
  /**
   * Get current usage tracking data
   */
  static async getUsageTracking(): Promise<StorageResult<UsageTracking>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USAGE_TRACKING);
      
      if (!data) {
        // Create initial usage tracking
        return await this.createUsageTracking();
      }

      const usageTracking: UsageTracking = JSON.parse(data);
      
      // Check if we need to reset daily usage
      const today = getTodayDateString();
      if (usageTracking.currentDaily.date !== today) {
        return await this.resetDailyUsage(usageTracking);
      }

      // Check version compatibility
      if (usageTracking.version !== STORAGE_VERSION) {
        console.warn('Usage tracking version mismatch, migrating data');
        const migrated = await this.migrateUsageTracking(usageTracking);
        return { success: true, data: migrated };
      }

      return { success: true, data: usageTracking };
    } catch (error) {
      console.error('Failed to get usage tracking:', error);
      return {
        success: false,
        error: 'Failed to load usage tracking data',
      };
    }
  }

  /**
   * Create initial usage tracking data
   */
  static async createUsageTracking(): Promise<StorageResult<UsageTracking>> {
    try {
      const now = Date.now();
      const today = getTodayDateString();
      
      const usageTracking: UsageTracking = {
        currentDaily: {
          date: today,
          analysisCount: 0,
          resetAt: now,
        },
        totalAnalyses: 0,
        totalDesignsSaved: 0,
        firstUsageAt: now,
        lastUsageAt: now,
        version: STORAGE_VERSION,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USAGE_TRACKING,
        JSON.stringify(usageTracking)
      );

      return { success: true, data: usageTracking };
    } catch (error) {
      console.error('Failed to create usage tracking:', error);
      return {
        success: false,
        error: 'Failed to create usage tracking data',
      };
    }
  }

  /**
   * Check if user can perform analysis (within daily limit)
   */
  static async canPerformAnalysis(): Promise<StorageResult<boolean>> {
    try {
      const usageResult = await this.getUsageTracking();
      
      if (!usageResult.success || !usageResult.data) {
        // If we can't get usage data, allow analysis but log warning
        console.warn('Could not verify usage limits, allowing analysis');
        return { success: true, data: true };
      }

      const canAnalyze = usageResult.data.currentDaily.analysisCount < USAGE_LIMITS.DAILY_ANALYSES;
      
      return { 
        success: true, 
        data: canAnalyze,
      };
    } catch (error) {
      console.error('Failed to check analysis permission:', error);
      return {
        success: false,
        error: 'Failed to verify usage limits',
      };
    }
  }

  /**
   * Record an analysis usage
   */
  static async recordAnalysisUsage(): Promise<StorageResult<UsageTracking>> {
    try {
      const usageResult = await this.getUsageTracking();
      
      if (!usageResult.success || !usageResult.data) {
        console.error('Could not get usage tracking for recording');
        return {
          success: false,
          error: 'Failed to record analysis usage',
        };
      }

      const usage = usageResult.data;
      const now = Date.now();

      // Check if we're within daily limit
      if (usage.currentDaily.analysisCount >= USAGE_LIMITS.DAILY_ANALYSES) {
        return {
          success: false,
          error: `Daily analysis limit of ${USAGE_LIMITS.DAILY_ANALYSES} reached`,
        };
      }

      // Update usage counters
      const updatedUsage: UsageTracking = {
        ...usage,
        currentDaily: {
          ...usage.currentDaily,
          analysisCount: usage.currentDaily.analysisCount + 1,
          lastAnalysisAt: now,
        },
        totalAnalyses: usage.totalAnalyses + 1,
        lastUsageAt: now,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USAGE_TRACKING,
        JSON.stringify(updatedUsage)
      );

      return { success: true, data: updatedUsage };
    } catch (error) {
      console.error('Failed to record analysis usage:', error);
      return {
        success: false,
        error: 'Failed to record analysis usage',
      };
    }
  }

  /**
   * Record a design save usage
   */
  static async recordDesignSave(): Promise<StorageResult<UsageTracking>> {
    try {
      const usageResult = await this.getUsageTracking();
      
      if (!usageResult.success || !usageResult.data) {
        console.error('Could not get usage tracking for recording design save');
        return {
          success: false,
          error: 'Failed to record design save',
        };
      }

      const usage = usageResult.data;
      const now = Date.now();

      const updatedUsage: UsageTracking = {
        ...usage,
        totalDesignsSaved: usage.totalDesignsSaved + 1,
        lastUsageAt: now,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USAGE_TRACKING,
        JSON.stringify(updatedUsage)
      );

      return { success: true, data: updatedUsage };
    } catch (error) {
      console.error('Failed to record design save:', error);
      return {
        success: false,
        error: 'Failed to record design save',
      };
    }
  }

  /**
   * Get remaining analyses for today
   */
  static async getRemainingAnalyses(): Promise<StorageResult<number>> {
    try {
      const usageResult = await this.getUsageTracking();
      
      if (!usageResult.success || !usageResult.data) {
        return { success: true, data: USAGE_LIMITS.DAILY_ANALYSES };
      }

      const remaining = Math.max(
        0, 
        USAGE_LIMITS.DAILY_ANALYSES - usageResult.data.currentDaily.analysisCount
      );

      return { success: true, data: remaining };
    } catch (error) {
      console.error('Failed to get remaining analyses:', error);
      return {
        success: false,
        error: 'Failed to calculate remaining analyses',
      };
    }
  }

  /**
   * Get usage statistics
   */
  static async getUsageStats(): Promise<StorageResult<{
    totalAnalyses: number;
    totalDesignsSaved: number;
    todayAnalyses: number;
    remainingToday: number;
    dailyLimit: number;
    daysSinceFirstUse: number;
  }>> {
    try {
      const usageResult = await this.getUsageTracking();
      
      if (!usageResult.success || !usageResult.data) {
        return {
          success: true,
          data: {
            totalAnalyses: 0,
            totalDesignsSaved: 0,
            todayAnalyses: 0,
            remainingToday: USAGE_LIMITS.DAILY_ANALYSES,
            dailyLimit: USAGE_LIMITS.DAILY_ANALYSES,
            daysSinceFirstUse: 0,
          },
        };
      }

      const usage = usageResult.data;
      const daysSinceFirstUse = Math.floor(
        (Date.now() - usage.firstUsageAt) / (1000 * 60 * 60 * 24)
      );

      return {
        success: true,
        data: {
          totalAnalyses: usage.totalAnalyses,
          totalDesignsSaved: usage.totalDesignsSaved,
          todayAnalyses: usage.currentDaily.analysisCount,
          remainingToday: Math.max(0, USAGE_LIMITS.DAILY_ANALYSES - usage.currentDaily.analysisCount),
          dailyLimit: USAGE_LIMITS.DAILY_ANALYSES,
          daysSinceFirstUse,
        },
      };
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return {
        success: false,
        error: 'Failed to calculate usage statistics',
      };
    }
  }

  /**
   * Reset daily usage for a new day
   */
  private static async resetDailyUsage(
    currentUsage: UsageTracking
  ): Promise<StorageResult<UsageTracking>> {
    try {
      const now = Date.now();
      const today = getTodayDateString();

      const updatedUsage: UsageTracking = {
        ...currentUsage,
        currentDaily: {
          date: today,
          analysisCount: 0,
          resetAt: now,
        },
        lastUsageAt: now,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USAGE_TRACKING,
        JSON.stringify(updatedUsage)
      );

      console.log('Daily usage reset for new day:', today);
      return { success: true, data: updatedUsage };
    } catch (error) {
      console.error('Failed to reset daily usage:', error);
      return {
        success: false,
        error: 'Failed to reset daily usage',
      };
    }
  }

  /**
   * Migrate usage tracking to current version
   */
  private static async migrateUsageTracking(
    oldUsage: UsageTracking
  ): Promise<UsageTracking> {
    const migrated: UsageTracking = {
      ...oldUsage,
      version: STORAGE_VERSION,
    };

    await AsyncStorage.setItem(
      STORAGE_KEYS.USAGE_TRACKING,
      JSON.stringify(migrated)
    );

    return migrated;
  }

  /**
   * Clear usage tracking data (for testing/reset)
   */
  static async clearUsageTracking(): Promise<StorageResult<boolean>> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USAGE_TRACKING);
      return { success: true, data: true };
    } catch (error) {
      console.error('Failed to clear usage tracking:', error);
      return {
        success: false,
        error: 'Failed to clear usage tracking data',
      };
    }
  }
}
