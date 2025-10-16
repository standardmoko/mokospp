import { ProductRecommendation } from '@/types/ai-analysis';

/**
 * Product Recommendation Service
 * Handles generation of contextual product recommendations
 */
export class ProductRecommendationService {
  /**
   * Generate product recommendations based on analysis and user preferences
   */
  static generateRecommendations(
    analysisData: any,
    promptContext: any
  ): ProductRecommendation[] {
    try {
      // Determine budget range for pricing
      const priceMultiplier = this.calculatePriceMultiplier(promptContext.budgetRange);

      // Generate contextual recommendations based on user preferences and workspace analysis
      const recommendations: ProductRecommendation[] = [];
      
      // Get base product recommendations
      const baseProducts = this.getBaseProducts();
      
      // Add style-specific recommendations
      const styleProducts = this.getStyleSpecificProducts(promptContext.userVibe);
      
      // Combine and select products
      const allProducts = [...baseProducts, ...styleProducts];
      const selectedProducts = allProducts.slice(0, 8);
      
      // Apply pricing and create final recommendations
      selectedProducts.forEach((product, index) => {
        const adjustedPrice = Math.round(product.basePrice * priceMultiplier);
        const priceVariation = Math.round(adjustedPrice * 0.2); // 20% price range
        
        recommendations.push({
          id: `rec_${index + 1}`,
          name: product.name,
          description: product.description,
          price: {
            min: adjustedPrice - priceVariation,
            max: adjustedPrice + priceVariation,
            currency: 'USD' as const
          },
          category: product.category,
          imageUrl: `https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=${encodeURIComponent(product.name)}`,
          tags: product.tags,
          rating: 4.2 + (Math.random() * 0.6) // Random rating between 4.2-4.8
        });
      });

      console.log(`Generated ${recommendations.length} product recommendations`);
      return recommendations;
    } catch (error) {
      console.error('Failed to generate product recommendations:', error);
      return this.getFallbackRecommendations();
    }
  }

  /**
   * Calculate price multiplier based on budget range
   */
  private static calculatePriceMultiplier(budgetRange?: string): number {
    if (!budgetRange) return 1; // Default to mid-range

    const budgetStr = budgetRange.toLowerCase();
    if (budgetStr.includes('under') || budgetStr.includes('500')) {
      return 0.6; // Lower prices
    } else if (budgetStr.includes('1500') || budgetStr.includes('high') || budgetStr.includes('premium')) {
      return 1.8; // Higher prices
    }
    
    return 1; // Mid-range
  }

  /**
   * Get base product recommendations that work for most workspaces
   */
  private static getBaseProducts() {
    return [
      {
        category: 'chair' as const,
        name: 'Ergonomic Office Chair',
        description: 'Comfortable office chair with lumbar support and adjustable height for better posture and productivity.',
        basePrice: 150,
        tags: ['ergonomic', 'comfort', 'productivity']
      },
      {
        category: 'desk' as const,
        name: 'Standing Desk Converter',
        description: 'Adjustable desk converter that allows you to alternate between sitting and standing throughout the day.',
        basePrice: 200,
        tags: ['adjustable', 'health', 'ergonomic']
      },
      {
        category: 'lighting' as const,
        name: 'LED Desk Lamp',
        description: 'Adjustable LED desk lamp with multiple brightness levels and color temperatures to reduce eye strain.',
        basePrice: 60,
        tags: ['adjustable', 'eye-care', 'modern']
      },
      {
        category: 'storage' as const,
        name: 'Desktop Organizer',
        description: 'Multi-compartment desk organizer to keep your workspace tidy and improve organization.',
        basePrice: 35,
        tags: ['organization', 'tidy', 'productivity']
      },
      {
        category: 'tech' as const,
        name: 'Monitor Stand',
        description: 'Adjustable monitor stand to improve screen positioning and reduce neck strain.',
        basePrice: 45,
        tags: ['ergonomic', 'adjustable', 'organization']
      },
      {
        category: 'decor' as const,
        name: 'Desktop Plant',
        description: 'Low-maintenance succulent or air plant to add natural elements and improve air quality.',
        basePrice: 25,
        tags: ['natural', 'air-quality', 'aesthetic']
      }
    ];
  }

  /**
   * Get style-specific product recommendations based on user preferences
   */
  private static getStyleSpecificProducts(userVibe?: string) {
    const styleProducts = [];

    if (!userVibe) return styleProducts;

    const vibe = userVibe.toLowerCase();
    
    if (vibe.includes('modern') || vibe.includes('minimalist')) {
      styleProducts.push({
        category: 'decor' as const,
        name: 'Minimalist Wall Art',
        description: 'Clean, geometric wall art that complements a modern workspace aesthetic.',
        basePrice: 40,
        tags: ['modern', 'minimalist', 'aesthetic']
      });
    }
    
    if (vibe.includes('cozy') || vibe.includes('warm')) {
      styleProducts.push({
        category: 'lighting' as const,
        name: 'Warm Ambient Light',
        description: 'Soft, warm lighting to create a cozy and comfortable workspace atmosphere.',
        basePrice: 55,
        tags: ['cozy', 'warm', 'ambient']
      });
    }
    
    if (vibe.includes('productive') || vibe.includes('professional')) {
      styleProducts.push({
        category: 'storage' as const,
        name: 'Filing Cabinet',
        description: 'Compact filing cabinet to organize documents and maintain a professional workspace.',
        basePrice: 120,
        tags: ['professional', 'organization', 'storage']
      });
    }

    if (vibe.includes('creative') || vibe.includes('artistic')) {
      styleProducts.push({
        category: 'decor' as const,
        name: 'Inspiration Board',
        description: 'Cork board or magnetic board for displaying ideas, sketches, and inspiration.',
        basePrice: 30,
        tags: ['creative', 'inspiration', 'organization']
      });
    }

    if (vibe.includes('tech') || vibe.includes('gaming')) {
      styleProducts.push({
        category: 'tech' as const,
        name: 'RGB LED Strip',
        description: 'Customizable RGB LED lighting to create an immersive tech workspace atmosphere.',
        basePrice: 35,
        tags: ['tech', 'gaming', 'customizable']
      });
    }

    return styleProducts;
  }

  /**
   * Get fallback recommendations when generation fails
   */
  private static getFallbackRecommendations(): ProductRecommendation[] {
    return [
      {
        id: 'rec_fallback_1',
        name: 'Ergonomic Office Chair',
        description: 'Comfortable office chair with lumbar support for better posture.',
        price: { min: 120, max: 180, currency: 'USD' as const },
        category: 'chair' as const,
        imageUrl: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Office+Chair',
        tags: ['ergonomic', 'comfort'],
        rating: 4.3
      },
      {
        id: 'rec_fallback_2',
        name: 'LED Desk Lamp',
        description: 'Adjustable LED desk lamp to reduce eye strain.',
        price: { min: 45, max: 75, currency: 'USD' as const },
        category: 'lighting' as const,
        imageUrl: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Desk+Lamp',
        tags: ['lighting', 'adjustable'],
        rating: 4.5
      },
      {
        id: 'rec_fallback_3',
        name: 'Desktop Organizer',
        description: 'Multi-compartment organizer to keep your workspace tidy.',
        price: { min: 25, max: 45, currency: 'USD' as const },
        category: 'storage' as const,
        imageUrl: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Organizer',
        tags: ['organization', 'storage'],
        rating: 4.4
      }
    ];
  }

  /**
   * Filter recommendations based on analysis insights
   */
  static filterByAnalysisInsights(
    recommendations: ProductRecommendation[],
    analysisData: any
  ): ProductRecommendation[] {
    // If analysis suggests lighting issues, prioritize lighting products
    if (analysisData.improvement_priorities?.some((p: string) => 
      p.toLowerCase().includes('light') || p.toLowerCase().includes('bright'))) {
      recommendations.sort((a, b) => {
        if (a.category === 'lighting' && b.category !== 'lighting') return -1;
        if (b.category === 'lighting' && a.category !== 'lighting') return 1;
        return 0;
      });
    }

    // If analysis suggests organization issues, prioritize storage products
    if (analysisData.improvement_priorities?.some((p: string) => 
      p.toLowerCase().includes('organiz') || p.toLowerCase().includes('clutter'))) {
      recommendations.sort((a, b) => {
        if (a.category === 'storage' && b.category !== 'storage') return -1;
        if (b.category === 'storage' && a.category !== 'storage') return 1;
        return 0;
      });
    }

    return recommendations;
  }
}
