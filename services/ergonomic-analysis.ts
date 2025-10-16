import { ErgonomicInsight } from '@/types/ai-analysis';

export interface ErgonomicAnalysisConfig {
  enableDetailedMetrics: boolean;
  includePostureAnalysis: boolean;
  strictnessLevel: 'lenient' | 'standard' | 'strict';
}

export interface ErgonomicMetrics {
  deskHeight: {
    estimated: number; // in cm
    optimal: { min: number; max: number };
    status: 'good' | 'needs-improvement' | 'poor';
  };
  chairAngle: {
    estimated: number; // in degrees
    optimal: { min: number; max: number };
    status: 'good' | 'needs-improvement' | 'poor';
  };
  lightingLevel: {
    estimated: number; // in lux
    optimal: { min: number; max: number };
    status: 'good' | 'needs-improvement' | 'poor';
  };
  screenDistance: {
    estimated: number; // in cm
    optimal: { min: number; max: number };
    status: 'good' | 'needs-improvement' | 'poor';
  };
  organizationScore: {
    estimated: number; // 0-100
    optimal: { min: number; max: number };
    status: 'good' | 'needs-improvement' | 'poor';
  };
}

export class ErgonomicAnalysisService {
  
  /**
   * Analyze ergonomic factors from AI response data
   */
  static analyzeErgonomics(
    analysisData: any,
    config: ErgonomicAnalysisConfig = {
      enableDetailedMetrics: true,
      includePostureAnalysis: true,
      strictnessLevel: 'standard'
    }
  ): ErgonomicInsight[] {
    const insights: ErgonomicInsight[] = [];
    
    try {
      // Process AI ergonomic evaluation if available
      if (analysisData.ergonomic_evaluation && Array.isArray(analysisData.ergonomic_evaluation)) {
        analysisData.ergonomic_evaluation.forEach((item: any) => {
          const insight = this.processErgonomicItem(item, config);
          if (insight) {
            insights.push(insight);
          }
        });
      }
      
      // Add enhanced analysis based on improvement priorities
      if (analysisData.improvement_priorities && Array.isArray(analysisData.improvement_priorities)) {
        const additionalInsights = this.extractInsightsFromPriorities(
          analysisData.improvement_priorities,
          config
        );
        insights.push(...additionalInsights);
      }
      
      // Ensure we have at least basic ergonomic categories covered
      const coveredCategories = insights.map(i => i.category);
      const missingCategories = this.getMissingCategories(coveredCategories);
      
      missingCategories.forEach(category => {
        const defaultInsight = this.generateDefaultInsight(category, config);
        if (defaultInsight) {
          insights.push(defaultInsight);
        }
      });
      
      return this.prioritizeInsights(insights, config);
      
    } catch (error) {
      console.error('Failed to analyze ergonomics:', error);
      return []; // Return empty array instead of fallback insights
    }
  }

  /**
   * Process individual ergonomic evaluation item
   */
  private static processErgonomicItem(
    item: any,
    config: ErgonomicAnalysisConfig
  ): ErgonomicInsight | null {
    try {
      const category = this.normalizeCategory(item.category);
      if (!category) return null;
      
      const status = this.normalizeStatus(item.status, config.strictnessLevel);
      const title = this.generateTitle(category, status);
      const description = item.observation || item.description || 'Assessment in progress';
      const recommendation = this.enhanceRecommendation(
        item.recommendation,
        category,
        status,
        config
      );
      
      return {
        category,
        status,
        title,
        description,
        recommendation
      };
    } catch (error) {
      console.error('Failed to process ergonomic item:', error);
      return null;
    }
  }

  /**
   * Extract insights from improvement priorities
   */
  private static extractInsightsFromPriorities(
    priorities: string[],
    config: ErgonomicAnalysisConfig
  ): ErgonomicInsight[] {
    const insights: ErgonomicInsight[] = [];
    
    priorities.forEach((priority, index) => {
      const insight = this.parseImprovement(priority, index, config);
      if (insight) {
        insights.push(insight);
      }
    });
    
    return insights;
  }

  /**
   * Parse improvement priority into ergonomic insight
   */
  private static parseImprovement(
    improvement: string,
    priority: number,
    config: ErgonomicAnalysisConfig
  ): ErgonomicInsight | null {
    const lowerImprovement = improvement.toLowerCase();
    
    // Map improvement text to categories
    const categoryMappings: Record<string, string> = {
      'ergonomic': 'chair-posture',
      'posture': 'chair-posture',
      'chair': 'chair-posture',
      'desk': 'desk-height',
      'height': 'desk-height',
      'light': 'lighting',
      'illumination': 'lighting',
      'screen': 'screen-position',
      'monitor': 'screen-position',
      'display': 'screen-position',
      'organization': 'organization',
      'clutter': 'organization',
      'storage': 'organization'
    };
    
    let detectedCategory: string | null = null;
    
    for (const [keyword, category] of Object.entries(categoryMappings)) {
      if (lowerImprovement.includes(keyword)) {
        detectedCategory = category;
        break;
      }
    }
    
    if (!detectedCategory) return null;
    
    const status = priority === 0 ? 'poor' : priority === 1 ? 'needs-improvement' : 'needs-improvement';
    
    return {
      category: detectedCategory as any,
      status: status as any,
      title: this.generateTitle(detectedCategory as any, status as any),
      description: improvement,
      recommendation: this.generateRecommendation(detectedCategory as any, status as any, config)
    };
  }

  /**
   * Normalize category names
   */
  private static normalizeCategory(category: string): string | null {
    const categoryMap: Record<string, string> = {
      'desk-height': 'desk-height',
      'desk_height': 'desk-height',
      'deskheight': 'desk-height',
      'chair-posture': 'chair-posture',
      'chair_posture': 'chair-posture',
      'chairposture': 'chair-posture',
      'chair': 'chair-posture',
      'posture': 'chair-posture',
      'lighting': 'lighting',
      'light': 'lighting',
      'illumination': 'lighting',
      'screen-position': 'screen-position',
      'screen_position': 'screen-position',
      'screenposition': 'screen-position',
      'monitor': 'screen-position',
      'display': 'screen-position',
      'organization': 'organization',
      'organisation': 'organization',
      'clutter': 'organization',
      'storage': 'organization'
    };
    
    return categoryMap[category.toLowerCase()] || null;
  }

  /**
   * Normalize status based on strictness level
   */
  private static normalizeStatus(
    status: string,
    strictness: 'lenient' | 'standard' | 'strict'
  ): 'good' | 'needs-improvement' | 'poor' {
    const statusMap: Record<string, Record<string, string>> = {
      lenient: {
        'good': 'good',
        'ok': 'good',
        'acceptable': 'good',
        'needs-improvement': 'needs-improvement',
        'fair': 'needs-improvement',
        'poor': 'poor',
        'bad': 'poor'
      },
      standard: {
        'good': 'good',
        'excellent': 'good',
        'ok': 'needs-improvement',
        'acceptable': 'needs-improvement',
        'needs-improvement': 'needs-improvement',
        'fair': 'needs-improvement',
        'poor': 'poor',
        'bad': 'poor'
      },
      strict: {
        'excellent': 'good',
        'good': 'needs-improvement',
        'ok': 'needs-improvement',
        'acceptable': 'poor',
        'needs-improvement': 'poor',
        'fair': 'poor',
        'poor': 'poor',
        'bad': 'poor'
      }
    };
    
    return (statusMap[strictness][status.toLowerCase()] || 'needs-improvement') as any;
  }

  /**
   * Generate enhanced recommendations
   */
  private static enhanceRecommendation(
    baseRecommendation: string | undefined,
    category: string,
    status: string,
    config: ErgonomicAnalysisConfig
  ): string | undefined {
    if (baseRecommendation && baseRecommendation.length > 20) {
      return baseRecommendation;
    }
    
    return this.generateRecommendation(category as any, status as any, config);
  }

  /**
   * Generate detailed recommendations based on category and status
   */
  private static generateRecommendation(
    category: 'desk-height' | 'chair-posture' | 'lighting' | 'screen-position' | 'organization',
    status: 'good' | 'needs-improvement' | 'poor',
    config: ErgonomicAnalysisConfig
  ): string {
    const recommendations: Record<string, Record<string, string[]>> = {
      'desk-height': {
        'needs-improvement': [
          'Adjust desk height so elbows are at 90° when typing',
          'Consider a height-adjustable desk or keyboard tray',
          'Ensure feet are flat on floor or footrest'
        ],
        'poor': [
          'Immediately adjust desk height - current setup may cause strain',
          'Use a standing desk converter or adjustable keyboard tray',
          'Consider ergonomic assessment for proper measurements'
        ]
      },
      'chair-posture': {
        'needs-improvement': [
          'Adjust chair height and back angle for better lumbar support',
          'Ensure chair back supports natural spine curve',
          'Consider ergonomic chair with adjustable features'
        ],
        'poor': [
          'Replace chair or add lumbar support immediately',
          'Adjust chair settings: height, back angle, armrests',
          'Take regular breaks to prevent long-term strain'
        ]
      },
      'lighting': {
        'needs-improvement': [
          'Add task lighting to reduce eye strain',
          'Position light source to minimize screen glare',
          'Consider adjustable desk lamp with warm light'
        ],
        'poor': [
          'Improve lighting immediately - current setup strains eyes',
          'Add multiple light sources for even illumination',
          'Position screen perpendicular to windows to reduce glare'
        ]
      },
      'screen-position': {
        'needs-improvement': [
          'Adjust monitor height so top is at eye level',
          'Position screen 50-70cm away from eyes',
          'Tilt screen slightly backward (10-20°)'
        ],
        'poor': [
          'Reposition screen immediately to prevent neck strain',
          'Use monitor arm or stand for proper height adjustment',
          'Ensure screen is directly in front, not to the side'
        ]
      },
      'organization': {
        'needs-improvement': [
          'Add storage solutions to reduce desktop clutter',
          'Organize frequently used items within arm\'s reach',
          'Create designated spaces for different work materials'
        ],
        'poor': [
          'Declutter workspace immediately for better focus',
          'Implement filing system for papers and supplies',
          'Remove unnecessary items from work surface'
        ]
      }
    };
    
    const categoryRecs = recommendations[category];
    if (!categoryRecs || status === 'good') {
      return 'Maintain current setup and monitor for changes';
    }
    
    const statusRecs = categoryRecs[status] || [];
    const selectedRec = statusRecs[Math.floor(Math.random() * statusRecs.length)];
    
    return selectedRec || 'Consider ergonomic improvements for better comfort';
  }

  /**
   * Generate title based on category and status
   */
  private static generateTitle(
    category: 'desk-height' | 'chair-posture' | 'lighting' | 'screen-position' | 'organization',
    status: 'good' | 'needs-improvement' | 'poor'
  ): string {
    const titles: Record<string, Record<string, string>> = {
      'desk-height': {
        'good': 'Desk Height Optimal',
        'needs-improvement': 'Desk Height Adjustment Needed',
        'poor': 'Desk Height Requires Attention'
      },
      'chair-posture': {
        'good': 'Chair & Posture Excellent',
        'needs-improvement': 'Chair Setup Needs Improvement',
        'poor': 'Chair & Posture Issues Detected'
      },
      'lighting': {
        'good': 'Lighting Conditions Good',
        'needs-improvement': 'Lighting Could Be Enhanced',
        'poor': 'Lighting Needs Immediate Attention'
      },
      'screen-position': {
        'good': 'Screen Position Optimal',
        'needs-improvement': 'Screen Position Adjustment Needed',
        'poor': 'Screen Position Problematic'
      },
      'organization': {
        'good': 'Workspace Well Organized',
        'needs-improvement': 'Organization Opportunities',
        'poor': 'Workspace Needs Organization'
      }
    };
    
    return titles[category]?.[status] || `${category} Assessment`;
  }

  /**
   * Get missing ergonomic categories
   */
  private static getMissingCategories(
    coveredCategories: string[]
  ): ('desk-height' | 'chair-posture' | 'lighting' | 'screen-position' | 'organization')[] {
    const allCategories: ('desk-height' | 'chair-posture' | 'lighting' | 'screen-position' | 'organization')[] = [
      'desk-height',
      'chair-posture', 
      'lighting',
      'screen-position',
      'organization'
    ];
    
    return allCategories.filter(category => !coveredCategories.includes(category));
  }

  /**
   * Generate default insight for missing category
   */
  private static generateDefaultInsight(
    category: 'desk-height' | 'chair-posture' | 'lighting' | 'screen-position' | 'organization',
    config: ErgonomicAnalysisConfig
  ): ErgonomicInsight {
    return {
      category,
      status: 'good',
      title: this.generateTitle(category, 'good'),
      description: 'No specific issues identified in this area.',
      recommendation: undefined
    };
  }

  /**
   * Prioritize insights by importance and status
   */
  private static prioritizeInsights(
    insights: ErgonomicInsight[],
    config: ErgonomicAnalysisConfig
  ): ErgonomicInsight[] {
    const priorityOrder = ['poor', 'needs-improvement', 'good'];
    const categoryOrder = ['chair-posture', 'desk-height', 'screen-position', 'lighting', 'organization'];
    
    return insights.sort((a, b) => {
      // First sort by status priority
      const statusDiff = priorityOrder.indexOf(a.status) - priorityOrder.indexOf(b.status);
      if (statusDiff !== 0) return statusDiff;
      
      // Then sort by category importance
      const categoryDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      return categoryDiff;
    });
  }

}
