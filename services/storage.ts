import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    AppData,
    createInstallationId,
    createUserPreferencesId,
    DEFAULT_APP_DATA,
    DEFAULT_USER_PREFERENCES,
    SavedDesign,
    STORAGE_KEYS,
    STORAGE_VERSION,
    StorageResult,
    StorageStats,
    UsageTracking,
    UserPreferences
} from '@/types/storage';

/**
 * Core Storage Service
 * Provides centralized data management using AsyncStorage
 */
export class StorageService {
  /**
   * Initialize storage with default data if needed
   */
  static async initialize(): Promise<StorageResult<boolean>> {
    try {
      // Initialize user preferences if not exists
      const userPrefs = await this.getUserPreferences();
      if (!userPrefs.success) {
        await this.createUserPreferences();
      }

      // Initialize app data if not exists
      const appData = await this.getAppData();
      if (!appData.success) {
        await this.createAppData();
      }

      return { success: true, data: true };
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      return {
        success: false,
        error: 'Failed to initialize storage system',
      };
    }
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(): Promise<StorageResult<UserPreferences>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      
      if (!data) {
        return { success: false, error: 'User preferences not found' };
      }

      const preferences: UserPreferences = JSON.parse(data);
      
      // Check version compatibility
      if (preferences.version !== STORAGE_VERSION) {
        console.warn('User preferences version mismatch, migrating data');
        const migrated = await this.migrateUserPreferences(preferences);
        return { success: true, data: migrated };
      }

      return { success: true, data: preferences };
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return {
        success: false,
        error: 'Failed to load user preferences',
      };
    }
  }

  /**
   * Create initial user preferences
   */
  static async createUserPreferences(): Promise<StorageResult<UserPreferences>> {
    try {
      const now = Date.now();
      const preferences: UserPreferences = {
        ...DEFAULT_USER_PREFERENCES,
        id: createUserPreferencesId(),
        createdAt: now,
        updatedAt: now,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(preferences)
      );

      return { success: true, data: preferences };
    } catch (error) {
      console.error('Failed to create user preferences:', error);
      return {
        success: false,
        error: 'Failed to create user preferences',
      };
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(
    updates: Partial<Omit<UserPreferences, 'id' | 'createdAt' | 'updatedAt' | 'version'>>
  ): Promise<StorageResult<UserPreferences>> {
    try {
      const current = await this.getUserPreferences();
      
      if (!current.success || !current.data) {
        // Create new preferences if none exist
        return await this.createUserPreferences();
      }

      const updated: UserPreferences = {
        ...current.data,
        ...updates,
        updatedAt: Date.now(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(updated)
      );

      return { success: true, data: updated };
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      return {
        success: false,
        error: 'Failed to update user preferences',
      };
    }
  }

  /**
   * Get app data
   */
  static async getAppData(): Promise<StorageResult<AppData>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.APP_DATA);
      
      if (!data) {
        return { success: false, error: 'App data not found' };
      }

      const appData: AppData = JSON.parse(data);
      
      // Check version compatibility
      if (appData.version !== STORAGE_VERSION) {
        console.warn('App data version mismatch, migrating data');
        const migrated = await this.migrateAppData(appData);
        return { success: true, data: migrated };
      }

      return { success: true, data: appData };
    } catch (error) {
      console.error('Failed to get app data:', error);
      return {
        success: false,
        error: 'Failed to load app data',
      };
    }
  }

  /**
   * Create initial app data
   */
  static async createAppData(): Promise<StorageResult<AppData>> {
    try {
      const now = Date.now();
      const appData: AppData = {
        ...DEFAULT_APP_DATA,
        installationId: createInstallationId(),
        createdAt: now,
        updatedAt: now,
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.APP_DATA,
        JSON.stringify(appData)
      );

      return { success: true, data: appData };
    } catch (error) {
      console.error('Failed to create app data:', error);
      return {
        success: false,
        error: 'Failed to create app data',
      };
    }
  }

  /**
   * Update app data
   */
  static async updateAppData(
    updates: Partial<Omit<AppData, 'installationId' | 'createdAt' | 'updatedAt' | 'version'>>
  ): Promise<StorageResult<AppData>> {
    try {
      const current = await this.getAppData();
      
      if (!current.success || !current.data) {
        // Create new app data if none exists
        return await this.createAppData();
      }

      const updated: AppData = {
        ...current.data,
        ...updates,
        updatedAt: Date.now(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.APP_DATA,
        JSON.stringify(updated)
      );

      return { success: true, data: updated };
    } catch (error) {
      console.error('Failed to update app data:', error);
      return {
        success: false,
        error: 'Failed to update app data',
      };
    }
  }

  /**
   * Get all storage keys
   */
  static async getAllKeys(): Promise<StorageResult<string[]>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const homeHarmonyKeys = keys.filter(key => 
        key.startsWith('@home_harmony_')
      );
      
      return { success: true, data: homeHarmonyKeys };
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return {
        success: false,
        error: 'Failed to retrieve storage keys',
      };
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<StorageResult<StorageStats>> {
    try {
      const [savedDesigns, usageTracking, appData] = await Promise.all([
        this.getAllSavedDesigns(),
        this.getUsageTracking(),
        this.getAppData(),
      ]);

      const totalDesigns = savedDesigns.success ? savedDesigns.data!.length : 0;
      const favoriteDesigns = savedDesigns.success 
        ? savedDesigns.data!.filter(d => d.isFavorite).length 
        : 0;
      
      const totalAnalyses = usageTracking.success 
        ? usageTracking.data!.totalAnalyses 
        : 0;
      
      const remainingAnalysesToday = usageTracking.success 
        ? Math.max(0, 5 - usageTracking.data!.currentDaily.analysisCount)
        : 5;

      // Estimate storage size (rough calculation)
      const keys = await this.getAllKeys();
      let storageSize = 0;
      
      if (keys.success && keys.data) {
        const values = await AsyncStorage.multiGet(keys.data);
        storageSize = values.reduce((total, [, value]) => {
          return total + (value ? value.length : 0);
        }, 0);
      }

      const stats: StorageStats = {
        totalDesigns,
        favoriteDesigns,
        totalAnalyses,
        remainingAnalysesToday,
        storageSize,
        lastBackup: appData.success ? appData.data!.lastBackupAt : undefined,
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        success: false,
        error: 'Failed to calculate storage statistics',
      };
    }
  }

  /**
   * Clear all app data (for reset/logout)
   */
  static async clearAllData(): Promise<StorageResult<boolean>> {
    try {
      const keys = await this.getAllKeys();
      
      if (keys.success && keys.data) {
        await AsyncStorage.multiRemove(keys.data);
      }

      return { success: true, data: true };
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return {
        success: false,
        error: 'Failed to clear app data',
      };
    }
  }

  /**
   * Migrate user preferences to current version
   */
  private static async migrateUserPreferences(
    oldPreferences: UserPreferences
  ): Promise<UserPreferences> {
    const migrated: UserPreferences = {
      ...oldPreferences,
      version: STORAGE_VERSION,
      updatedAt: Date.now(),
    };

    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PREFERENCES,
      JSON.stringify(migrated)
    );

    return migrated;
  }

  /**
   * Migrate app data to current version
   */
  private static async migrateAppData(oldAppData: AppData): Promise<AppData> {
    const migrated: AppData = {
      ...oldAppData,
      version: STORAGE_VERSION,
      updatedAt: Date.now(),
    };

    await AsyncStorage.setItem(
      STORAGE_KEYS.APP_DATA,
      JSON.stringify(migrated)
    );

    return migrated;
  }

  // Placeholder methods for design storage (will be implemented in design service)
  private static async getAllSavedDesigns(): Promise<StorageResult<SavedDesign[]>> {
    return { success: true, data: [] };
  }

  // Placeholder method for usage tracking (will be implemented in usage service)
  private static async getUsageTracking(): Promise<StorageResult<UsageTracking>> {
    return { 
      success: true, 
      data: {
        currentDaily: {
          date: new Date().toISOString().split('T')[0],
          analysisCount: 0,
          resetAt: Date.now(),
        },
        totalAnalyses: 0,
        totalDesignsSaved: 0,
        firstUsageAt: Date.now(),
        lastUsageAt: Date.now(),
        version: STORAGE_VERSION,
      }
    };
  }
}
