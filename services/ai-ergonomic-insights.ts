import { ErgonomicInsight } from '@/types/ai-analysis';

/**
 * AI Ergonomic Insights Service
 * Handles processing and generation of ergonomic insights from AI analysis
 */
export class AIErgonomicInsightsService {
  /**
   * Process ergonomic insights from AI analysis data
   */
  static processErgonomicInsights(analysisData: any): ErgonomicInsight[] {
    try {
      if (analysisData.ergonomic_evaluation && Array.isArray(analysisData.ergonomic_evaluation)) {
        return analysisData.ergonomic_evaluation.map((item: any) => ({
          category: this.mapCategory(item.category) || 'organization',
          status: this.mapStatus(item.status) || 'needs-improvement',
          title: this.formatInsightTitle(item.category, item.status),
          description: this.cleanDescription(item.observation || item.description) || 'Ergonomic assessment needed',
          recommendation: this.cleanRecommendation(item.recommendation),
        })).filter((insight: ErgonomicInsight) => insight.description.length > 0);
      }

      // Return basic ergonomic insights as fallback
      return this.getBasicErgonomicInsights();
    } catch (error) {
      console.error('Failed to process ergonomic insights:', error);
      return this.getFallbackErgonomicInsights();
    }
  }

  /**
   * Get basic ergonomic insights for common workspace issues
   */
  private static getBasicErgonomicInsights(): ErgonomicInsight[] {
    return [
      {
        category: 'screen-position' as const,
        status: 'needs-improvement' as const,
        title: 'Monitor Position',
        description: 'Ensure your monitor is at eye level to reduce neck strain.',
        recommendation: 'Adjust monitor height or use a monitor stand.'
      },
      {
        category: 'lighting' as const,
        status: 'needs-improvement' as const,
        title: 'Lighting Assessment',
        description: 'Proper lighting reduces eye strain and improves productivity.',
        recommendation: 'Add task lighting or adjust ambient lighting.'
      },
      {
        category: 'organization' as const,
        status: 'good' as const,
        title: 'Workspace Organization',
        description: 'Keep frequently used items within easy reach.',
        recommendation: 'Organize desk layout for better workflow.'
      }
    ];
  }

  /**
   * Get fallback ergonomic insights when processing fails
   */
  private static getFallbackErgonomicInsights(): ErgonomicInsight[] {
    return [
      {
        category: 'chair-posture' as const,
        status: 'needs-improvement' as const,
        title: 'Posture Check',
        description: 'Maintain good posture while working.',
        recommendation: 'Take regular breaks and adjust your seating position.'
      },
      {
        category: 'desk-height' as const,
        status: 'good' as const,
        title: 'Desk Height',
        description: 'Proper desk height helps prevent strain.',
        recommendation: 'Ensure your desk is at the correct height for your chair.'
      }
    ];
  }

  /**
   * Map AI category to valid ErgonomicInsight category
   */
  private static mapCategory(category: string): ErgonomicInsight['category'] | null {
    if (!category || typeof category !== 'string') return null;

    const categoryMap: Record<string, ErgonomicInsight['category']> = {
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
      'organize': 'organization',
      'clutter': 'organization',
      'storage': 'organization',
    };

    const normalizedCategory = category.toLowerCase().replace(/[^a-z]/g, '');
    return categoryMap[normalizedCategory] || null;
  }

  /**
   * Map AI status to valid ErgonomicInsight status
   */
  private static mapStatus(status: string): ErgonomicInsight['status'] | null {
    if (!status || typeof status !== 'string') return null;

    const statusMap: Record<string, ErgonomicInsight['status']> = {
      'good': 'good',
      'excellent': 'good',
      'great': 'good',
      'fine': 'good',
      'ok': 'good',
      'okay': 'good',
      'needs-improvement': 'needs-improvement',
      'needs_improvement': 'needs-improvement',
      'needsimprovement': 'needs-improvement',
      'improvement': 'needs-improvement',
      'moderate': 'needs-improvement',
      'fair': 'needs-improvement',
      'average': 'needs-improvement',
      'poor': 'poor',
      'bad': 'poor',
      'terrible': 'poor',
      'critical': 'poor',
      'urgent': 'poor',
    };

    const normalizedStatus = status.toLowerCase().replace(/[^a-z]/g, '');
    return statusMap[normalizedStatus] || null;
  }

  /**
   * Format insight title based on category and status
   */
  private static formatInsightTitle(category: string, status: string): string {
    const categoryNames: Record<string, string> = {
      'desk-height': 'Desk Height',
      'chair-posture': 'Chair & Posture',
      'lighting': 'Lighting Setup',
      'screen-position': 'Monitor Position',
      'organization': 'Workspace Organization',
    };

    const statusDescriptions: Record<string, string> = {
      'good': 'Looks Good',
      'needs-improvement': 'Needs Attention',
      'poor': 'Requires Immediate Attention',
    };

    const mappedCategory = this.mapCategory(category);
    const mappedStatus = this.mapStatus(status);

    const categoryName = mappedCategory ? categoryNames[mappedCategory] : 'Workspace Setup';
    const statusDesc = mappedStatus ? statusDescriptions[mappedStatus] : 'Assessment';

    return `${categoryName} - ${statusDesc}`;
  }

  /**
   * Clean and validate description text
   */
  private static cleanDescription(description: string | undefined | null): string {
    if (!description || typeof description !== 'string') {
      return '';
    }

    let cleaned = description.trim();
    
    // Remove JSON artifacts
    cleaned = cleaned.replace(/^["']|["']$/g, '');
    cleaned = cleaned.replace(/\\n/g, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Ensure minimum length and content
    if (cleaned.length < 10 || /^[^\w]*$/.test(cleaned)) {
      return '';
    }

    // Capitalize first letter
    if (cleaned.length > 0 && /^[a-z]/.test(cleaned)) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    // Ensure it ends with proper punctuation
    if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
      cleaned += '.';
    }

    return cleaned;
  }

  /**
   * Clean and validate recommendation text
   */
  private static cleanRecommendation(recommendation: string | undefined | null): string | undefined {
    if (!recommendation || typeof recommendation !== 'string') {
      return undefined;
    }

    let cleaned = recommendation.trim();
    
    // Remove JSON artifacts
    cleaned = cleaned.replace(/^["']|["']$/g, '');
    cleaned = cleaned.replace(/\\n/g, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Ensure minimum length and content
    if (cleaned.length < 5 || /^[^\w]*$/.test(cleaned)) {
      return undefined;
    }

    // Capitalize first letter
    if (cleaned.length > 0 && /^[a-z]/.test(cleaned)) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    // Ensure it ends with proper punctuation
    if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
      cleaned += '.';
    }

    return cleaned;
  }

  /**
   * Prioritize insights based on severity and importance
   */
  static prioritizeInsights(insights: ErgonomicInsight[]): ErgonomicInsight[] {
    const priorityOrder: Record<ErgonomicInsight['status'], number> = {
      'poor': 1,
      'needs-improvement': 2,
      'good': 3,
    };

    const categoryOrder: Record<ErgonomicInsight['category'], number> = {
      'chair-posture': 1,
      'desk-height': 2,
      'screen-position': 3,
      'lighting': 4,
      'organization': 5,
    };

    return insights.sort((a, b) => {
      // First sort by status priority (poor first)
      const statusDiff = priorityOrder[a.status] - priorityOrder[b.status];
      if (statusDiff !== 0) return statusDiff;

      // Then sort by category importance
      return categoryOrder[a.category] - categoryOrder[b.category];
    });
  }

  /**
   * Generate summary of ergonomic assessment
   */
  static generateErgonomicSummary(insights: ErgonomicInsight[]): {
    overallScore: number;
    criticalIssues: number;
    improvementAreas: number;
    goodAreas: number;
    summary: string;
  } {
    const criticalIssues = insights.filter(i => i.status === 'poor').length;
    const improvementAreas = insights.filter(i => i.status === 'needs-improvement').length;
    const goodAreas = insights.filter(i => i.status === 'good').length;
    
    // Calculate overall score (0-100)
    const totalInsights = insights.length;
    const overallScore = totalInsights > 0 
      ? Math.round(((goodAreas * 100) + (improvementAreas * 60) + (criticalIssues * 20)) / totalInsights)
      : 70; // Default score

    let summary = '';
    if (overallScore >= 80) {
      summary = 'Your workspace has good ergonomic setup with minor areas for improvement.';
    } else if (overallScore >= 60) {
      summary = 'Your workspace has moderate ergonomic setup with several areas that could be improved.';
    } else {
      summary = 'Your workspace has significant ergonomic issues that should be addressed for better health and productivity.';
    }

    return {
      overallScore,
      criticalIssues,
      improvementAreas,
      goodAreas,
      summary
    };
  }
}
