import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

import {
    STORAGE_VERSION,
    StorageBackup,
    StorageResult
} from '@/types/storage';
import { DesignStorageService } from './design-storage';
import { StorageService } from './storage';
import { UsageTrackingService } from './usage-tracking';

/**
 * Backup and Recovery Service
 * Handles data backup, restoration, and recovery mechanisms
 */
export class BackupRecoveryService {
  private static readonly BACKUP_DIRECTORY_NAME = 'backups';
  private static readonly MAX_BACKUP_FILES = 5;

  /**
   * Get backups directory
   */
  private static getBackupsDirectory(): Directory {
    return new Directory(Paths.document, this.BACKUP_DIRECTORY_NAME);
  }

  /**
   * Initialize backup directory
   */
  static async initializeBackupDirectory(): Promise<void> {
    try {
      const backupsDir = this.getBackupsDirectory();
      if (!backupsDir.exists) {
        backupsDir.create();
      }
    } catch (error) {
      console.error('Failed to initialize backup directory:', error);
      throw new Error('Unable to create backup directory');
    }
  }

  /**
   * Create a complete backup of all app data
   */
  static async createBackup(): Promise<StorageResult<string>> {
    try {
      await this.initializeBackupDirectory();

      // Gather all data
      const [userPreferences, savedDesigns, usageTracking, appData] = await Promise.all([
        StorageService.getUserPreferences(),
        DesignStorageService.getAllSavedDesigns(),
        UsageTrackingService.getUsageTracking(),
        StorageService.getAppData(),
      ]);

      const backup: StorageBackup = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        userPreferences: userPreferences.success ? userPreferences.data : undefined,
        savedDesigns: savedDesigns.success ? savedDesigns.data! : [],
        usageTracking: usageTracking.success ? usageTracking.data! : {
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
        },
        appData: appData.success ? appData.data! : {
          hasCompletedOnboarding: false,
          installationId: `install_${Date.now()}`,
          version: STORAGE_VERSION,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      };

      // Create backup file
      const backupFileName = `backup_${Date.now()}.json`;
      const backupsDir = this.getBackupsDirectory();
      const backupFile = new File(backupsDir, backupFileName);

      backupFile.write(JSON.stringify(backup, null, 2));

      // Update app data with backup timestamp
      await StorageService.updateAppData({
        lastBackupAt: backup.timestamp,
      });

      // Clean up old backups
      await this.cleanupOldBackups();

      console.log('Backup created successfully:', backupFile.uri);
      return { success: true, data: backupFile.uri };
    } catch (error) {
      console.error('Failed to create backup:', error);
      return {
        success: false,
        error: 'Failed to create data backup',
      };
    }
  }

  /**
   * Restore data from a backup file
   */
  static async restoreFromBackup(backupPath: string): Promise<StorageResult<boolean>> {
    try {
      // Check if backup file exists
      const backupFile = new File(backupPath);
      if (!backupFile.exists) {
        return {
          success: false,
          error: 'Backup file not found',
        };
      }

      // Read backup data
      const backupContent = backupFile.text();
      const backup: StorageBackup = JSON.parse(backupContent);

      // Validate backup version
      if (backup.version > STORAGE_VERSION) {
        return {
          success: false,
          error: 'Backup was created with a newer version of the app',
        };
      }

      // Clear existing data
      await StorageService.clearAllData();

      // Restore data
      const restorationPromises = [];

      if (backup.userPreferences) {
        restorationPromises.push(
          AsyncStorage.setItem(
            '@home_harmony_user_preferences',
            JSON.stringify(backup.userPreferences)
          )
        );
      }

      if (backup.savedDesigns && backup.savedDesigns.length > 0) {
        restorationPromises.push(
          AsyncStorage.setItem(
            '@home_harmony_saved_designs',
            JSON.stringify(backup.savedDesigns)
          )
        );
      }

      if (backup.usageTracking) {
        restorationPromises.push(
          AsyncStorage.setItem(
            '@home_harmony_usage_tracking',
            JSON.stringify(backup.usageTracking)
          )
        );
      }

      if (backup.appData) {
        restorationPromises.push(
          AsyncStorage.setItem(
            '@home_harmony_app_data',
            JSON.stringify({
              ...backup.appData,
              updatedAt: Date.now(), // Update restoration timestamp
            })
          )
        );
      }

      await Promise.all(restorationPromises);

      console.log('Data restored successfully from backup');
      return { success: true, data: true };
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return {
        success: false,
        error: 'Failed to restore data from backup',
      };
    }
  }

  /**
   * Get list of available backup files
   */
  static async getAvailableBackups(): Promise<StorageResult<Array<{
    fileName: string;
    filePath: string;
    timestamp: number;
    size: number;
    isValid: boolean;
  }>>> {
    try {
      await this.initializeBackupDirectory();

      const backupsDir = this.getBackupsDirectory();
      const contents = backupsDir.list();
      const backupFiles = contents.filter(item => 
        item instanceof File && 
        item.name.startsWith('backup_') && 
        item.name.endsWith('.json')
      ) as File[];

      const backupInfo = await Promise.all(
        backupFiles.map(async (backupFile) => {
          let isValid = false;
          let timestamp = 0;

          try {
            // Try to parse backup to validate
            const content = backupFile.text();
            const backup: StorageBackup = JSON.parse(content);
            isValid = backup.version <= STORAGE_VERSION;
            timestamp = backup.timestamp;
          } catch {
            // Invalid backup file
            isValid = false;
          }

          return {
            fileName: backupFile.name,
            filePath: backupFile.uri,
            timestamp,
            size: backupFile.size || 0,
            isValid,
          };
        })
      );

      // Sort by timestamp (newest first)
      backupInfo.sort((a, b) => b.timestamp - a.timestamp);

      return { success: true, data: backupInfo };
    } catch (error) {
      console.error('Failed to get available backups:', error);
      return {
        success: false,
        error: 'Failed to list backup files',
      };
    }
  }

  /**
   * Delete a specific backup file
   */
  static async deleteBackup(backupPath: string): Promise<StorageResult<boolean>> {
    try {
      const backupFile = new File(backupPath);
      if (backupFile.exists) {
        backupFile.delete();
      }

      return { success: true, data: true };
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return {
        success: false,
        error: 'Failed to delete backup file',
      };
    }
  }

  /**
   * Export data as JSON string (for sharing/manual backup)
   */
  static async exportDataAsJSON(): Promise<StorageResult<string>> {
    try {
      const [userPreferences, savedDesigns, usageTracking, appData] = await Promise.all([
        StorageService.getUserPreferences(),
        DesignStorageService.getAllSavedDesigns(),
        UsageTrackingService.getUsageTracking(),
        StorageService.getAppData(),
      ]);

      const exportData = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        userPreferences: userPreferences.success ? userPreferences.data : null,
        savedDesigns: savedDesigns.success ? savedDesigns.data : [],
        usageTracking: usageTracking.success ? usageTracking.data : null,
        appData: appData.success ? appData.data : null,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      return { success: true, data: jsonString };
    } catch (error) {
      console.error('Failed to export data as JSON:', error);
      return {
        success: false,
        error: 'Failed to export data',
      };
    }
  }

  /**
   * Import data from JSON string
   */
  static async importDataFromJSON(jsonString: string): Promise<StorageResult<boolean>> {
    try {
      const importData = JSON.parse(jsonString);

      // Validate import data structure
      if (!importData.version || !importData.timestamp) {
        return {
          success: false,
          error: 'Invalid import data format',
        };
      }

      // Create temporary backup file
      const backupsDir = this.getBackupsDirectory();
      const tempBackupFile = new File(backupsDir, `temp_import_${Date.now()}.json`);
      tempBackupFile.write(jsonString);

      // Restore from the temporary backup
      const restoreResult = await this.restoreFromBackup(tempBackupFile.uri);

      // Clean up temporary file
      await this.deleteBackup(tempBackupFile.uri);

      return restoreResult;
    } catch (error) {
      console.error('Failed to import data from JSON:', error);
      return {
        success: false,
        error: 'Failed to import data - invalid format',
      };
    }
  }

  /**
   * Perform data recovery (attempt to restore corrupted data)
   */
  static async performDataRecovery(): Promise<StorageResult<{
    recoveredItems: string[];
    failedItems: string[];
  }>> {
    try {
      const recoveredItems: string[] = [];
      const failedItems: string[] = [];

      // Try to recover each data type individually
      const recoveryTasks = [
        {
          name: 'User Preferences',
          key: '@home_harmony_user_preferences',
          recover: () => StorageService.createUserPreferences(),
        },
        {
          name: 'App Data',
          key: '@home_harmony_app_data',
          recover: () => StorageService.createAppData(),
        },
        {
          name: 'Usage Tracking',
          key: '@home_harmony_usage_tracking',
          recover: () => UsageTrackingService.createUsageTracking(),
        },
      ];

      for (const task of recoveryTasks) {
        try {
          // Check if data exists and is valid
          const data = await AsyncStorage.getItem(task.key);
          
          if (!data) {
            // Data missing, create default
            await task.recover();
            recoveredItems.push(`${task.name} (created default)`);
          } else {
            try {
              JSON.parse(data);
              recoveredItems.push(`${task.name} (validated)`);
            } catch {
              // Data corrupted, recreate
              await AsyncStorage.removeItem(task.key);
              await task.recover();
              recoveredItems.push(`${task.name} (recreated)`);
            }
          }
        } catch (error) {
          console.error(`Failed to recover ${task.name}:`, error);
          failedItems.push(task.name);
        }
      }

      // Try to recover saved designs (more complex)
      try {
        const designsData = await AsyncStorage.getItem('@home_harmony_saved_designs');
        if (designsData) {
          const designs = JSON.parse(designsData);
          if (Array.isArray(designs)) {
            recoveredItems.push(`Saved Designs (${designs.length} designs)`);
          } else {
            throw new Error('Invalid designs format');
          }
        } else {
          recoveredItems.push('Saved Designs (empty)');
        }
      } catch (error) {
        // Clear corrupted designs data
        await AsyncStorage.removeItem('@home_harmony_saved_designs');
        recoveredItems.push('Saved Designs (cleared corrupted data)');
      }

      return {
        success: true,
        data: { recoveredItems, failedItems },
      };
    } catch (error) {
      console.error('Failed to perform data recovery:', error);
      return {
        success: false,
        error: 'Data recovery failed',
      };
    }
  }

  /**
   * Clean up old backup files (keep only MAX_BACKUP_FILES)
   */
  private static async cleanupOldBackups(): Promise<void> {
    try {
      const backupsResult = await this.getAvailableBackups();
      
      if (!backupsResult.success || !backupsResult.data) {
        return;
      }

      const backups = backupsResult.data;
      
      if (backups.length > this.MAX_BACKUP_FILES) {
        const backupsToDelete = backups.slice(this.MAX_BACKUP_FILES);
        
        for (const backup of backupsToDelete) {
          await this.deleteBackup(backup.filePath);
        }

        console.log(`Cleaned up ${backupsToDelete.length} old backup files`);
      }
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
    }
  }

  /**
   * Get backup statistics
   */
  static async getBackupStats(): Promise<StorageResult<{
    totalBackups: number;
    totalBackupSize: number;
    oldestBackup?: number;
    newestBackup?: number;
    lastBackupAt?: number;
  }>> {
    try {
      const backupsResult = await this.getAvailableBackups();
      const appDataResult = await StorageService.getAppData();

      if (!backupsResult.success) {
        return backupsResult;
      }

      const backups = backupsResult.data || [];
      const totalBackupSize = backups.reduce((total, backup) => total + backup.size, 0);

      const stats = {
        totalBackups: backups.length,
        totalBackupSize,
        oldestBackup: backups.length > 0 ? Math.min(...backups.map(b => b.timestamp)) : undefined,
        newestBackup: backups.length > 0 ? Math.max(...backups.map(b => b.timestamp)) : undefined,
        lastBackupAt: appDataResult.success ? appDataResult.data!.lastBackupAt : undefined,
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Failed to get backup stats:', error);
      return {
        success: false,
        error: 'Failed to calculate backup statistics',
      };
    }
  }
}
