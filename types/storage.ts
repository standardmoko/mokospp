import { WorkspaceAnalysisResult } from './ai-analysis';
import { PhotoAsset } from './photo';
import { QuizResponse } from './quiz';

// Storage version for data migration
export const STORAGE_VERSION = 1;

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: '@home_harmony_user_preferences',
  SAVED_DESIGNS: '@home_harmony_saved_designs',
  USAGE_TRACKING: '@home_harmony_usage_tracking',
  APP_DATA: '@home_harmony_app_data',
  QUIZ_DATA: '@home_harmony_quiz_data', // Already used in QuizStorageService
} as const;

// User preferences and settings
export interface UserPreferences {
  id: string;
  lastQuizResponses?: QuizResponse[];
  favoriteDesignIds: string[];
  notificationsEnabled: boolean;
  themePreference: 'light' | 'dark' | 'system';
  createdAt: number;
  updatedAt: number;
  version: number;
}

// Saved workspace design
export interface SavedDesign {
  id: string;
  name: string;
  analysisResult: WorkspaceAnalysisResult;
  originalPhoto: PhotoAsset;
  quizResponses: QuizResponse[];
  isFavorite: boolean;
  tags: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Daily usage tracking
export interface DailyUsage {
  date: string; // YYYY-MM-DD format
  analysisCount: number;
  lastAnalysisAt?: number;
  resetAt: number; // Timestamp when the day resets
}

// Usage tracking data
export interface UsageTracking {
  currentDaily: DailyUsage;
  totalAnalyses: number;
  totalDesignsSaved: number;
  firstUsageAt: number;
  lastUsageAt: number;
  version: number;
}

// App-wide data and settings
export interface AppData {
  hasCompletedOnboarding: boolean;
  lastBackupAt?: number;
  installationId: string;
  version: number;
  createdAt: number;
  updatedAt: number;
}

// Storage operation result
export interface StorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Storage backup data
export interface StorageBackup {
  version: number;
  timestamp: number;
  userPreferences?: UserPreferences;
  savedDesigns: SavedDesign[];
  usageTracking: UsageTracking;
  appData: AppData;
}

// Storage statistics
export interface StorageStats {
  totalDesigns: number;
  favoriteDesigns: number;
  totalAnalyses: number;
  remainingAnalysesToday: number;
  storageSize: number; // in bytes
  lastBackup?: number;
}

// Design filter options
export interface DesignFilter {
  isFavorite?: boolean;
  tags?: string[];
  dateRange?: {
    start: number;
    end: number;
  };
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// Constants for usage limits
export const USAGE_LIMITS = {
  DAILY_ANALYSES: 5,
  MAX_SAVED_DESIGNS: 50,
  MAX_BACKUP_AGE_DAYS: 30,
} as const;

// Default values
export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, 'id' | 'createdAt' | 'updatedAt'> = {
  favoriteDesignIds: [],
  notificationsEnabled: true,
  themePreference: 'system',
  version: STORAGE_VERSION,
};

export const DEFAULT_APP_DATA: Omit<AppData, 'installationId' | 'createdAt' | 'updatedAt'> = {
  hasCompletedOnboarding: false,
  version: STORAGE_VERSION,
};

// Helper function to create today's date string
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper function to create installation ID
export function createInstallationId(): string {
  return `install_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to create design ID
export function createDesignId(): string {
  return `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to create user preferences ID
export function createUserPreferencesId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
