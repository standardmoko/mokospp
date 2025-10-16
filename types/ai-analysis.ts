import { PhotoAsset } from './photo';
import { QuizResponse } from './quiz';

export interface WorkspaceAnalysisRequest {
  photo: PhotoAsset;
  quizResponses: QuizResponse[];
  userId?: string;
}

export interface ProductRecommendation {
  id: string;
  name: string;
  description: string;
  price: {
    min: number;
    max: number;
    currency: 'USD';
  };
  category: 'desk' | 'chair' | 'lighting' | 'storage' | 'decor' | 'tech';
  imageUrl: string;
  purchaseUrl?: string;
  brand?: string;
  rating?: number;
  tags: string[];
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[]; // Hex color codes
  mood: 'focus' | 'creativity' | 'calm' | 'energizing';
  description: string;
}

export interface ErgonomicInsight {
  category: 'desk-height' | 'chair-posture' | 'lighting' | 'screen-position' | 'organization';
  status: 'good' | 'needs-improvement' | 'poor';
  title: string;
  description: string;
  recommendation?: string;
}

export interface WorkspaceAnalysisResult {
  id: string;
  summary: string;
  recommendations: ProductRecommendation[];
  colorPalette?: ColorPalette;
  ergonomicInsights: ErgonomicInsight[];
  styleMatch: {
    vibe: string;
    confidence: number; // 0-1
    explanation: string;
  };
  createdAt: number;
  processingTime: number; // milliseconds
}

export interface AIAnalysisState {
  isAnalyzing: boolean;
  progress: number; // 0-100
  currentStep: string;
  error: string | null;
  result: WorkspaceAnalysisResult | null;
}

export interface AIAnalysisError {
  code: 'NETWORK_ERROR' | 'API_ERROR' | 'TIMEOUT_ERROR' | 'INVALID_IMAGE' | 'QUOTA_EXCEEDED' | 'UNKNOWN_ERROR' | 'RATE_LIMIT_ERROR' | 'INVALID_API_KEY';
  message: string;
  details?: string;
  retryable: boolean;
}

export interface AIPromptContext {
  userVibe: string;
  colorPreference: string;
  budgetRange: string;
  imageDescription: string;
}

export interface ColorExtractionOptions {
  maxColors: number;
  quality: number;
  ignoreWhite: boolean;
  ignoreBlack: boolean;
}

export interface ExtractedColor {
  hex: string;
  rgb: [number, number, number];
  frequency: number;
  luminance: number;
}

// Configuration constants - Removed timeout restrictions for unlimited processing time
export const AI_CONFIG = {
  MODEL: 'gpt-4o' as const,
  MAX_TOKENS: 4000, // Increased for more detailed analysis
  TEMPERATURE: 0.7,
  TIMEOUT_MS: 0, // No timeout - allow unlimited processing time
  MAX_RETRIES: 5, // Increased retries for better reliability
  RETRY_DELAY_MS: 2000, // Longer delay between retries
} as const;

// Analysis steps for progress tracking
export const ANALYSIS_STEPS = {
  INITIALIZING: 'Initializing analysis...',
  PROCESSING_IMAGE: 'Analyzing workspace image...',
  GENERATING_RECOMMENDATIONS: 'Generating product recommendations...',
  EXTRACTING_COLORS: 'Extracting color palette...',
  EVALUATING_ERGONOMICS: 'Evaluating ergonomic factors...',
  FINALIZING: 'Finalizing results...',
} as const;
