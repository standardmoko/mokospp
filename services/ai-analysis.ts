import { ErgonomicAnalysisService } from '@/services/ergonomic-analysis';
import {
  AI_CONFIG,
  AIAnalysisError,
  ANALYSIS_STEPS,
  ColorPalette,
  WorkspaceAnalysisRequest,
  WorkspaceAnalysisResult
} from '@/types/ai-analysis';
import { AIImageProcessingService } from './ai-image-processing';
import { AIPromptService } from './ai-prompts';
import { AIResponseParserService } from './ai-response-parser';
import { ColorExtractionService } from './color-extraction';
import { OpenAIClientService } from './openai-client';
import { ProductRecommendationService } from './product-recommendation';

/**
 * AI Analysis Service
 * Orchestrates workspace analysis using modular AI services
 */
export class AIAnalysisService {

  /**
   * Analyze workspace with retry logic
   */
  static async analyzeWorkspace(
    request: WorkspaceAnalysisRequest,
    onProgress?: (step: string, progress: number) => void
  ): Promise<WorkspaceAnalysisResult> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Progress tracking
    const updateProgress = (step: string, progress: number) => {
      onProgress?.(step, progress);
    };

    updateProgress(ANALYSIS_STEPS.INITIALIZING, 10);

    // Create prompt context from quiz responses
    const promptContext = AIPromptService.createPromptContext(request.quizResponses);

    updateProgress(ANALYSIS_STEPS.PROCESSING_IMAGE, 20);

    // Retry logic
    for (let attempt = 1; attempt <= AI_CONFIG.MAX_RETRIES; attempt++) {
      try {
        const result = await this.performAnalysis(request, promptContext, updateProgress);
        
        updateProgress(ANALYSIS_STEPS.FINALIZING, 100);
        
        return {
          ...result,
          processingTime: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(`Analysis attempt ${attempt} failed:`, error);

        if (attempt < AI_CONFIG.MAX_RETRIES) {
          updateProgress(`Retrying analysis (${attempt}/${AI_CONFIG.MAX_RETRIES})...`, 15);
          await this.delay(AI_CONFIG.RETRY_DELAY_MS * attempt);
        }
      }
    }

    // All retries failed, throw error instead of using fallback
    console.error('All analysis attempts failed:', lastError);
    throw new Error(`Analysis failed after ${AI_CONFIG.MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Perform the actual AI analysis
   */
  private static async performAnalysis(
    request: WorkspaceAnalysisRequest,
    promptContext: any,
    updateProgress: (step: string, progress: number) => void
  ): Promise<WorkspaceAnalysisResult> {
    updateProgress(ANALYSIS_STEPS.PROCESSING_IMAGE, 30);

    // Validate and convert image to base64
    const imageValidation = await AIImageProcessingService.validateImageForAI(request.photo.uri);
    if (!imageValidation.isValid) {
      throw new Error(`Image validation failed: ${imageValidation.error}`);
    }

    const imageBase64 = await AIImageProcessingService.convertImageToBase64(request.photo.uri);

    updateProgress(ANALYSIS_STEPS.PROCESSING_IMAGE, 50);

    // Create the analysis request
    const prompt = AIPromptService.getComprehensivePrompt(promptContext);

    // Call OpenAI Vision API
    const aiContent = await OpenAIClientService.analyzeImageWithPrompt(imageBase64, prompt);

    updateProgress(ANALYSIS_STEPS.GENERATING_RECOMMENDATIONS, 70);

    // Parse and clean AI response
    const analysisData = AIResponseParserService.extractStructuredData(aiContent);
    const cleanedAnalysisData = AIResponseParserService.cleanAnalysisData(analysisData);

    updateProgress(ANALYSIS_STEPS.EXTRACTING_COLORS, 80);

    // Generate product recommendations based on analysis
    const recommendations = ProductRecommendationService.generateRecommendations(
      cleanedAnalysisData,
      promptContext
    );

    updateProgress(ANALYSIS_STEPS.EVALUATING_ERGONOMICS, 85);

    // Extract color palette from the original image
    const colorPalette = await this.extractColorPalette(cleanedAnalysisData, promptContext, request.photo.uri);

    updateProgress(ANALYSIS_STEPS.EVALUATING_ERGONOMICS, 90);

    // Process ergonomic insights with enhanced analysis
    const ergonomicInsights = ErgonomicAnalysisService.analyzeErgonomics(cleanedAnalysisData, {
      enableDetailedMetrics: true,
      includePostureAnalysis: true,
      strictnessLevel: 'standard'
    });

    return {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      summary: AIResponseParserService.cleanText(cleanedAnalysisData.workspace_description) || 'Workspace analysis completed',
      recommendations,
      colorPalette,
      ergonomicInsights,
      styleMatch: {
        vibe: AIResponseParserService.cleanText(cleanedAnalysisData.style_assessment?.current_style) || 'Modern workspace',
        confidence: cleanedAnalysisData.style_assessment?.alignment_score || 0.7,
        explanation: AIResponseParserService.cleanText(cleanedAnalysisData.style_assessment?.alignment_explanation) || 'Good style alignment',
      },
      createdAt: Date.now(),
      processingTime: 0, // Will be set by caller
    };
  }



  /**
   * Extract color palette from analysis
   */
  private static async extractColorPalette(
    analysisData: any, 
    promptContext: any, 
    imageUri: string
  ): Promise<ColorPalette | undefined> {
    try {
      // First, try to extract colors from the actual image
      const extractedPalette = await ColorExtractionService.extractColorPalette(imageUri, {
        maxColors: 5,
        quality: 10,
        ignoreWhite: true,
        ignoreBlack: true,
      });

      // If extraction was successful, return the extracted palette
      if (extractedPalette && extractedPalette.colors.length > 0) {
        return extractedPalette;
      }

      // Fallback: Try to get colors from AI analysis
      if (analysisData.color_analysis?.dominant_colors) {
        return {
          id: `palette_${Date.now()}`,
          name: 'Workspace Colors',
          colors: analysisData.color_analysis.dominant_colors,
          mood: analysisData.color_analysis.mood || 'focus',
          description: analysisData.color_analysis.color_harmony || 'Current workspace color scheme',
        };
      }

      // No fallback - return undefined if extraction fails
      return undefined;
    } catch (error) {
      console.error('Failed to extract color palette:', error);
      return undefined;
    }
  }


  /**
   * Utility function for delays
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate API key availability
   */
  static validateConfiguration(): { isValid: boolean; error?: string } {
    return OpenAIClientService.validateConfiguration();
  }

  /**
   * Create AI analysis error
   */
  static createError(
    code: AIAnalysisError['code'],
    message: string,
    details?: string
  ): AIAnalysisError {
    return {
      code,
      message,
      details,
      retryable: ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'API_ERROR'].includes(code),
    };
  }
}
