import { AIPromptContext } from '@/types/ai-analysis';
import { QuizResponse } from '@/types/quiz';

/**
 * AI Prompt Engineering Service
 * Creates structured prompts for workspace analysis using GPT-4o Vision
 */
export class AIPromptService {
  /**
   * Create context from quiz responses
   */
  static createPromptContext(quizResponses: QuizResponse[]): AIPromptContext {
    const responseMap = new Map(
      quizResponses.map(response => [response.questionId, response.selectedOptionIds[0]])
    );

    const vibeMap: Record<string, string> = {
      'focus-minimal': 'Focus & Minimal - Clean, distraction-free environment for deep work',
      'creative-inspiring': 'Creative & Inspiring - Vibrant space that sparks creativity and innovation',
      'cozy-warm': 'Cozy & Warm - Comfortable, welcoming atmosphere for relaxed productivity',
    };

    const colorMap: Record<string, string> = {
      'neutral-tones': 'Neutral Tones - Calming beiges, whites, and soft grays',
      'bold-accents': 'Bold Accents - Energizing pops of color with strong contrasts',
      'natural-greens': 'Natural Greens - Refreshing plant-inspired earth tones',
    };

    const budgetMap: Record<string, string> = {
      'budget-low': 'Under $500 - Budget-friendly essentials and DIY solutions',
      'budget-mid': '$500 - $1500 - Quality pieces with good value for money',
      'budget-high': '$1500+ - Premium furniture and complete workspace transformation',
    };

    return {
      userVibe: vibeMap[responseMap.get('workspace-vibe') || ''] || 'Modern and functional',
      colorPreference: colorMap[responseMap.get('color-preference') || ''] || 'Neutral and calming',
      budgetRange: budgetMap[responseMap.get('budget-range') || ''] || 'Mid-range quality',
      imageDescription: '', // Will be filled by image analysis
    };
  }

  /**
   * Generate system prompt for workspace analysis
   */
  static getSystemPrompt(): string {
    return `You are an expert interior designer and ergonomics specialist analyzing home office workspaces. 

Your task is to analyze the uploaded workspace photo and provide comprehensive recommendations based on the user's style preferences.

ANALYSIS REQUIREMENTS:
1. Describe what you see in the workspace (furniture, layout, lighting, organization)
2. Evaluate ergonomic factors (desk height, chair position, lighting, screen placement)
3. Assess the current style and how it aligns with user preferences
4. Identify improvement opportunities

RESPONSE FORMAT:
Provide your analysis as a structured JSON response with these exact fields:
{
  "workspace_description": "Detailed description of the current workspace",
  "style_assessment": {
    "current_style": "Description of current style",
    "alignment_score": 0.8,
    "alignment_explanation": "How well it matches user preferences"
  },
  "ergonomic_evaluation": [
    {
      "category": "desk-height|chair-posture|lighting|screen-position|organization",
      "status": "good|needs-improvement|poor",
      "observation": "What you observe",
      "recommendation": "Specific improvement suggestion"
    }
  ],
  "improvement_priorities": [
    "Priority 1: Most important improvement",
    "Priority 2: Secondary improvement",
    "Priority 3: Nice-to-have enhancement"
  ],
  "color_analysis": {
    "dominant_colors": ["#hex1", "#hex2", "#hex3"],
    "mood": "focus|creativity|calm|energizing",
    "color_harmony": "Assessment of current color scheme"
  },
  "product_needs": {
    "required_categories": ["desk", "chair", "lighting", "storage", "decor", "tech"],
    "priority_items": [
      {
        "category": "lighting",
        "reason": "Why this specific category is needed",
        "urgency": "high|medium|low"
      }
    ]
  }
}

GUIDELINES:
- Be specific and actionable in recommendations
- Consider both aesthetics and functionality
- Focus on realistic, achievable improvements
- Prioritize ergonomic health and productivity
- Keep descriptions concise but informative`;
  }

  /**
   * Generate user prompt with context
   */
  static getUserPrompt(context: AIPromptContext): string {
    return `Please analyze this home office workspace photo and provide recommendations.

USER PREFERENCES:
- Desired Vibe: ${context.userVibe}
- Color Preference: ${context.colorPreference}
- Budget Range: ${context.budgetRange}

Focus on how to transform this workspace to better match these preferences while maintaining functionality and ergonomic health.

Provide specific, actionable recommendations that consider the user's style goals and budget constraints.`;
  }

  /**
   * Generate follow-up prompt for product recommendations
   */
  static getProductRecommendationPrompt(
    workspaceAnalysis: string,
    context: AIPromptContext
  ): string {
    return `Based on this workspace analysis: "${workspaceAnalysis}"

And user preferences:
- Vibe: ${context.userVibe}
- Colors: ${context.colorPreference}
- Budget: ${context.budgetRange}

Suggest 5-8 specific product categories that would most improve this workspace:

Categories to consider:
- Desk (standing, traditional, corner, compact)
- Chair (ergonomic, executive, task, gaming)
- Lighting (desk lamp, floor lamp, ambient, smart)
- Storage (shelving, cabinets, organizers, filing)
- Decor (plants, art, accessories, textiles)
- Tech (monitors, keyboard, mouse, accessories)

For each recommendation, specify:
1. Product category and type
2. Why it's needed for this workspace
3. How it matches user preferences
4. Approximate price range within budget

Focus on the most impactful improvements first.`;
  }

  /**
   * Create a comprehensive analysis prompt combining all elements
   */
  static getComprehensivePrompt(context: AIPromptContext): string {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.getUserPrompt(context);

    return `${systemPrompt}

${userPrompt}`;
  }

  /**
   * Generate error recovery prompt for failed analyses
   */
  static getErrorRecoveryPrompt(): string {
    return `I'm having trouble analyzing this workspace image. Please provide a general workspace improvement analysis based on common home office needs:

1. Essential ergonomic considerations
2. Basic lighting improvements
3. Organization and storage solutions
4. Style enhancement suggestions

Keep recommendations practical and widely applicable to most home office setups.`;
  }

  /**
   * Validate and clean AI response
   */
  static validateResponse(response: string): { isValid: boolean; data?: any; error?: string } {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      
      // Check for required fields
      const requiredFields = [
        'workspace_description',
        'style_assessment',
        'ergonomic_evaluation',
        'improvement_priorities',
        'color_analysis'
      ];

      const missingFields = requiredFields.filter(field => !parsed[field]);
      
      if (missingFields.length > 0) {
        return {
          isValid: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        };
      }

      return { isValid: true, data: parsed };
    } catch (error) {
      // If not JSON, try to extract structured information from text
      return this.extractStructuredData(response);
    }
  }

  /**
   * Extract structured data from unstructured AI response
   */
  private static extractStructuredData(response: string): { isValid: boolean; data?: any; error?: string } {
    try {
      // Fallback: create structured response from text analysis
      const data = {
        workspace_description: this.extractSection(response, 'workspace|description|current'),
        style_assessment: {
          current_style: this.extractSection(response, 'style|aesthetic'),
          alignment_score: 0.7, // Default moderate alignment
          alignment_explanation: this.extractSection(response, 'alignment|match|preference')
        },
        ergonomic_evaluation: this.extractErgonomicPoints(response),
        improvement_priorities: this.extractPriorities(response),
        color_analysis: {
          dominant_colors: ['#F5F5F5', '#E0E0E0', '#D0D0D0'], // Default neutral
          mood: 'focus',
          color_harmony: this.extractSection(response, 'color|palette')
        }
      };

      return { isValid: true, data };
    } catch (error) {
      return {
        isValid: false,
        error: 'Unable to parse AI response into structured format'
      };
    }
  }

  /**
   * Extract text sections using keywords
   */
  private static extractSection(text: string, keywords: string): string {
    const keywordList = keywords.split('|');
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if (keywordList.some(keyword => 
        sentence.toLowerCase().includes(keyword.toLowerCase())
      )) {
        return sentence.trim();
      }
    }
    
    return 'Analysis not available';
  }

  /**
   * Extract ergonomic evaluation points
   */
  private static extractErgonomicPoints(text: string): any[] {
    const categories = ['desk', 'chair', 'lighting', 'screen', 'organization'];
    const points = [];

    for (const category of categories) {
      const section = this.extractSection(text, category);
      if (section && section !== 'Analysis not available') {
        points.push({
          category: `${category}-position`,
          status: 'needs-improvement',
          observation: section,
          recommendation: `Consider improving ${category} setup`
        });
      }
    }

    return points.length > 0 ? points : [{
      category: 'general',
      status: 'needs-improvement',
      observation: 'General workspace assessment needed',
      recommendation: 'Consider ergonomic improvements for better comfort'
    }];
  }

  /**
   * Extract improvement priorities
   */
  private static extractPriorities(text: string): string[] {
    const priorities = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.match(/^\d+\.|\-|\*/) && line.length > 10) {
        priorities.push(line.replace(/^\d+\.|\-|\*/, '').trim());
        if (priorities.length >= 3) break;
      }
    }

    return priorities.length > 0 ? priorities : [
      'Improve ergonomic setup',
      'Enhance lighting conditions',
      'Optimize workspace organization'
    ];
  }
}
