import { AI_CONFIG, AIAnalysisError } from '@/types/ai-analysis';
import OpenAI from 'openai';

// Configuration for the secure API proxy
const API_CONFIG = {
  PROXY_URL: 'https://v0-ai-home-office-stylist.vercel.app/api/wardroubekey',
  ACCESS_TOKEN: process.env.EXPO_PUBLIC_WARDROPE_SECURE_TOKEN,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

interface CachedApiKey {
  key: string;
  timestamp: number;
}

/**
 * OpenAI Client Service
 * Manages OpenAI client initialization and API interactions through secure proxy
 */
export class OpenAIClientService {
  private static openai: OpenAI | null = null;
  private static cachedApiKey: CachedApiKey | null = null;

  /**
   * Fetch API key from secure proxy
   */
  private static async fetchApiKeyFromProxy(): Promise<string> {
    // Check if we have a valid cached key
    if (this.cachedApiKey) {
      const isExpired = Date.now() - this.cachedApiKey.timestamp > API_CONFIG.CACHE_DURATION;
      if (!isExpired) {
        return this.cachedApiKey.key;
      }
    }

    const accessToken = API_CONFIG.ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('Access token not found. Please set EXPO_PUBLIC_WARDROPE_SECURE_TOKEN in your environment.');
    }

    try {
      const response = await fetch(API_CONFIG.PROXY_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Proxy API error (${response.status}): ${errorData.message || 'Failed to fetch API key'}`);
      }

      const data = await response.json();
      if (!data.key) {
        throw new Error('Invalid response from proxy: missing API key');
      }

      // Cache the API key
      this.cachedApiKey = {
        key: data.key,
        timestamp: Date.now(),
      };

      return data.key;
    } catch (error) {
      console.error('Failed to fetch API key from proxy:', error);
      throw new Error(`Proxy connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initialize and get OpenAI client
   */
  static async getClient(): Promise<OpenAI> {
    if (!this.openai) {
      const apiKey = await this.fetchApiKeyFromProxy();
      
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true, // Required for React Native/Expo
      });
    }

    return this.openai;
  }

  /**
   * Call OpenAI Vision API with image and prompt
   */
  static async analyzeImageWithPrompt(
    imageBase64: string,
    prompt: string
  ): Promise<string> {
    const client = await this.getClient();

    try {
      const response = await client.chat.completions.create({
        model: AI_CONFIG.MODEL,
        max_tokens: AI_CONFIG.MAX_TOKENS,
        temperature: AI_CONFIG.TEMPERATURE,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
      });

      const aiContent = response.choices[0]?.message?.content;
      if (!aiContent) {
        throw new Error('No response from AI analysis');
      }

      return aiContent;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      
      if (error instanceof Error) {
        // Handle specific OpenAI errors
        if (error.message.includes('rate limit')) {
          throw this.createError('RATE_LIMIT_ERROR', 'API rate limit exceeded. Please try again later.');
        } else if (error.message.includes('invalid_api_key')) {
          throw this.createError('INVALID_API_KEY', 'Invalid OpenAI API key.');
        } else if (error.message.includes('insufficient_quota')) {
          throw this.createError('QUOTA_EXCEEDED', 'OpenAI API quota exceeded.');
        } else if (error.message.includes('timeout')) {
          throw this.createError('TIMEOUT_ERROR', 'Request timed out. Please try again.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw this.createError('NETWORK_ERROR', 'Network error. Please check your connection.');
        } else if (error.message.includes('Proxy connection failed')) {
          throw this.createError('NETWORK_ERROR', 'Unable to connect to secure proxy. Please check your internet connection.');
        } else if (error.message.includes('Proxy API error')) {
          throw this.createError('INVALID_API_KEY', 'Authentication failed. Please check your access token configuration.');
        }
      }
      
      throw this.createError('API_ERROR', `OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate proxy configuration
   */
  static validateConfiguration(): { isValid: boolean; error?: string } {
    const accessToken = API_CONFIG.ACCESS_TOKEN;
    
    if (!accessToken) {
      return {
        isValid: false,
        error: 'Access token is not configured. Please add EXPO_PUBLIC_WARDROPE_SECURE_TOKEN to your environment variables.',
      };
    }

    if (!API_CONFIG.PROXY_URL) {
      return {
        isValid: false,
        error: 'Proxy URL is not configured.',
      };
    }

    return { isValid: true };
  }

  /**
   * Test API connection
   */
  static async testConnection(): Promise<{ isConnected: boolean; error?: string }> {
    try {
      // Test proxy connection first
      await this.fetchApiKeyFromProxy();
      
      // Then test OpenAI connection
      const client = await this.getClient();
      await client.models.list();
      
      return { isConnected: true };
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Get API usage information (if available)
   */
  static async getUsageInfo(): Promise<{
    available: boolean;
    usage?: any;
    error?: string;
  }> {
    // Note: OpenAI doesn't provide usage info through the standard API
    // This is a placeholder for future implementation
    return {
      available: false,
      error: 'Usage information not available through OpenAI API'
    };
  }

  /**
   * Create AI analysis error
   */
  private static createError(
    code: AIAnalysisError['code'],
    message: string,
    details?: string
  ): AIAnalysisError {
    return {
      code,
      message,
      details,
      retryable: ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'API_ERROR', 'RATE_LIMIT_ERROR'].includes(code),
    };
  }

  /**
   * Reset client and cache (useful for testing or configuration changes)
   */
  static resetClient(): void {
    this.openai = null;
    this.cachedApiKey = null;
  }

  /**
   * Clear cached API key (force refresh on next request)
   */
  static clearCache(): void {
    this.cachedApiKey = null;
  }
}
