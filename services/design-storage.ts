import AsyncStorage from '@react-native-async-storage/async-storage';

import { WorkspaceAnalysisResult } from '@/types/ai-analysis';
import { PhotoAsset } from '@/types/photo';
import { QuizResponse } from '@/types/quiz';
import {
    createDesignId,
    DesignFilter,
    SavedDesign,
    STORAGE_KEYS,
    StorageResult,
    USAGE_LIMITS
} from '@/types/storage';

/**
 * Design Storage Service
 * Manages saved workspace designs and favorites
 */
export class DesignStorageService {
  /**
   * Get all saved designs
   */
  static async getAllSavedDesigns(): Promise<StorageResult<SavedDesign[]>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_DESIGNS);
      
      if (!data) {
        return { success: true, data: [] };
      }

      const designs: SavedDesign[] = JSON.parse(data);
      
      // Sort by creation date (newest first)
      designs.sort((a, b) => b.createdAt - a.createdAt);

      return { success: true, data: designs };
    } catch (error) {
      console.error('Failed to get saved designs:', error);
      return {
        success: false,
        error: 'Failed to load saved designs',
      };
    }
  }

  /**
   * Get filtered designs
   */
  static async getFilteredDesigns(filter: DesignFilter): Promise<StorageResult<SavedDesign[]>> {
    try {
      const allDesignsResult = await this.getAllSavedDesigns();
      
      if (!allDesignsResult.success || !allDesignsResult.data) {
        return allDesignsResult;
      }

      let filteredDesigns = allDesignsResult.data;

      // Apply filters
      if (filter.isFavorite !== undefined) {
        filteredDesigns = filteredDesigns.filter(d => d.isFavorite === filter.isFavorite);
      }

      if (filter.tags && filter.tags.length > 0) {
        filteredDesigns = filteredDesigns.filter(d => 
          filter.tags!.some(tag => d.tags.includes(tag))
        );
      }

      if (filter.dateRange) {
        filteredDesigns = filteredDesigns.filter(d => 
          d.createdAt >= filter.dateRange!.start && 
          d.createdAt <= filter.dateRange!.end
        );
      }

      // Apply sorting
      if (filter.sortBy) {
        filteredDesigns.sort((a, b) => {
          const aValue = a[filter.sortBy!];
          const bValue = b[filter.sortBy!];
          
          let comparison = 0;
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          }

          return filter.sortOrder === 'asc' ? comparison : -comparison;
        });
      }

      return { success: true, data: filteredDesigns };
    } catch (error) {
      console.error('Failed to get filtered designs:', error);
      return {
        success: false,
        error: 'Failed to filter designs',
      };
    }
  }

  /**
   * Get design by ID
   */
  static async getDesignById(id: string): Promise<StorageResult<SavedDesign>> {
    try {
      const allDesignsResult = await this.getAllSavedDesigns();
      
      if (!allDesignsResult.success || !allDesignsResult.data) {
        return {
          success: false,
          error: 'Failed to load designs',
        };
      }

      const design = allDesignsResult.data.find(d => d.id === id);
      
      if (!design) {
        return {
          success: false,
          error: 'Design not found',
        };
      }

      return { success: true, data: design };
    } catch (error) {
      console.error('Failed to get design by ID:', error);
      return {
        success: false,
        error: 'Failed to load design',
      };
    }
  }

  /**
   * Save a new design
   */
  static async saveDesign(
    analysisResult: WorkspaceAnalysisResult,
    originalPhoto: PhotoAsset,
    quizResponses: QuizResponse[],
    name?: string,
    tags: string[] = []
  ): Promise<StorageResult<SavedDesign>> {
    try {
      const allDesignsResult = await this.getAllSavedDesigns();
      
      if (!allDesignsResult.success) {
        return {
          success: false,
          error: 'Failed to load existing designs',
        };
      }

      const existingDesigns = allDesignsResult.data || [];

      // Check storage limit
      if (existingDesigns.length >= USAGE_LIMITS.MAX_SAVED_DESIGNS) {
        return {
          success: false,
          error: `Maximum of ${USAGE_LIMITS.MAX_SAVED_DESIGNS} designs can be saved`,
        };
      }

      const now = Date.now();
      const design: SavedDesign = {
        id: createDesignId(),
        name: name || `Workspace Design ${new Date().toLocaleDateString()}`,
        analysisResult,
        originalPhoto,
        quizResponses,
        isFavorite: false,
        tags,
        createdAt: now,
        updatedAt: now,
      };

      const updatedDesigns = [design, ...existingDesigns];

      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_DESIGNS,
        JSON.stringify(updatedDesigns)
      );

      return { success: true, data: design };
    } catch (error) {
      console.error('Failed to save design:', error);
      return {
        success: false,
        error: 'Failed to save design',
      };
    }
  }

  /**
   * Update an existing design
   */
  static async updateDesign(
    id: string,
    updates: Partial<Pick<SavedDesign, 'name' | 'isFavorite' | 'tags' | 'notes'>>
  ): Promise<StorageResult<SavedDesign>> {
    try {
      const allDesignsResult = await this.getAllSavedDesigns();
      
      if (!allDesignsResult.success || !allDesignsResult.data) {
        return {
          success: false,
          error: 'Failed to load designs',
        };
      }

      const designs = allDesignsResult.data;
      const designIndex = designs.findIndex(d => d.id === id);

      if (designIndex === -1) {
        return {
          success: false,
          error: 'Design not found',
        };
      }

      const updatedDesign: SavedDesign = {
        ...designs[designIndex],
        ...updates,
        updatedAt: Date.now(),
      };

      designs[designIndex] = updatedDesign;

      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_DESIGNS,
        JSON.stringify(designs)
      );

      return { success: true, data: updatedDesign };
    } catch (error) {
      console.error('Failed to update design:', error);
      return {
        success: false,
        error: 'Failed to update design',
      };
    }
  }

  /**
   * Delete a design
   */
  static async deleteDesign(id: string): Promise<StorageResult<boolean>> {
    try {
      const allDesignsResult = await this.getAllSavedDesigns();
      
      if (!allDesignsResult.success || !allDesignsResult.data) {
        return {
          success: false,
          error: 'Failed to load designs',
        };
      }

      const designs = allDesignsResult.data;
      const filteredDesigns = designs.filter(d => d.id !== id);

      if (filteredDesigns.length === designs.length) {
        return {
          success: false,
          error: 'Design not found',
        };
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_DESIGNS,
        JSON.stringify(filteredDesigns)
      );

      return { success: true, data: true };
    } catch (error) {
      console.error('Failed to delete design:', error);
      return {
        success: false,
        error: 'Failed to delete design',
      };
    }
  }

  /**
   * Toggle favorite status
   */
  static async toggleFavorite(id: string): Promise<StorageResult<SavedDesign>> {
    try {
      const designResult = await this.getDesignById(id);
      
      if (!designResult.success || !designResult.data) {
        return {
          success: false,
          error: 'Design not found',
        };
      }

      return await this.updateDesign(id, {
        isFavorite: !designResult.data.isFavorite,
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      return {
        success: false,
        error: 'Failed to update favorite status',
      };
    }
  }

  /**
   * Get favorite designs
   */
  static async getFavoriteDesigns(): Promise<StorageResult<SavedDesign[]>> {
    return await this.getFilteredDesigns({ isFavorite: true });
  }

  /**
   * Get recent designs (last 5)
   */
  static async getRecentDesigns(limit: number = 5): Promise<StorageResult<SavedDesign[]>> {
    try {
      const allDesignsResult = await this.getAllSavedDesigns();
      
      if (!allDesignsResult.success || !allDesignsResult.data) {
        return allDesignsResult;
      }

      const recentDesigns = allDesignsResult.data.slice(0, limit);
      return { success: true, data: recentDesigns };
    } catch (error) {
      console.error('Failed to get recent designs:', error);
      return {
        success: false,
        error: 'Failed to load recent designs',
      };
    }
  }

  /**
   * Search designs by name or tags
   */
  static async searchDesigns(query: string): Promise<StorageResult<SavedDesign[]>> {
    try {
      const allDesignsResult = await this.getAllSavedDesigns();
      
      if (!allDesignsResult.success || !allDesignsResult.data) {
        return allDesignsResult;
      }

      const lowercaseQuery = query.toLowerCase();
      const matchingDesigns = allDesignsResult.data.filter(design => 
        design.name.toLowerCase().includes(lowercaseQuery) ||
        design.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
        (design.notes && design.notes.toLowerCase().includes(lowercaseQuery))
      );

      return { success: true, data: matchingDesigns };
    } catch (error) {
      console.error('Failed to search designs:', error);
      return {
        success: false,
        error: 'Failed to search designs',
      };
    }
  }

  /**
   * Get design statistics
   */
  static async getDesignStats(): Promise<StorageResult<{
    total: number;
    favorites: number;
    tags: { [tag: string]: number };
    oldestDesign?: number;
    newestDesign?: number;
  }>> {
    try {
      const allDesignsResult = await this.getAllSavedDesigns();
      
      if (!allDesignsResult.success || !allDesignsResult.data) {
        return {
          success: true,
          data: {
            total: 0,
            favorites: 0,
            tags: {},
          },
        };
      }

      const designs = allDesignsResult.data;
      const tagCounts: { [tag: string]: number } = {};

      // Count tags
      designs.forEach(design => {
        design.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const stats = {
        total: designs.length,
        favorites: designs.filter(d => d.isFavorite).length,
        tags: tagCounts,
        oldestDesign: designs.length > 0 ? Math.min(...designs.map(d => d.createdAt)) : undefined,
        newestDesign: designs.length > 0 ? Math.max(...designs.map(d => d.createdAt)) : undefined,
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Failed to get design stats:', error);
      return {
        success: false,
        error: 'Failed to calculate design statistics',
      };
    }
  }

  /**
   * Clear all saved designs
   */
  static async clearAllDesigns(): Promise<StorageResult<boolean>> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_DESIGNS);
      return { success: true, data: true };
    } catch (error) {
      console.error('Failed to clear all designs:', error);
      return {
        success: false,
        error: 'Failed to clear designs',
      };
    }
  }
}
