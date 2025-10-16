import { File } from 'expo-file-system';

/**
 * AI Image Processing Service
 * Handles image conversion and processing for AI analysis
 */
export class AIImageProcessingService {
  /**
   * Convert image to base64 for OpenAI Vision API
   */
  static async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const file = new File(imageUri);
      const bytes = await file.bytes();
      
      // Convert bytes to base64 more efficiently
      const uint8Array = new Uint8Array(bytes);
      let binaryString = '';
      
      // Process in chunks to avoid call stack size exceeded error
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binaryString += String.fromCharCode(...chunk);
      }
      
      const base64 = btoa(binaryString);
      return base64;
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      throw new Error('Unable to process image file');
    }
  }

  /**
   * Validate image format and size for AI processing
   */
  static async validateImageForAI(imageUri: string): Promise<{
    isValid: boolean;
    error?: string;
    size?: number;
  }> {
    try {
      const file = new File(imageUri);
      const bytes = await file.bytes();
      const sizeInMB = bytes.length / (1024 * 1024);

      // OpenAI Vision API has a 20MB limit
      if (sizeInMB > 20) {
        return {
          isValid: false,
          error: 'Image size exceeds 20MB limit for AI processing',
          size: sizeInMB
        };
      }

      // Check if file exists and has content
      if (bytes.length === 0) {
        return {
          isValid: false,
          error: 'Image file is empty or corrupted'
        };
      }

      return {
        isValid: true,
        size: sizeInMB
      };
    } catch (error) {
      console.error('Failed to validate image for AI:', error);
      return {
        isValid: false,
        error: 'Unable to validate image file'
      };
    }
  }

  /**
   * Get image metadata for analysis context
   */
  static async getImageMetadata(imageUri: string): Promise<{
    size: number;
    format?: string;
    dimensions?: { width: number; height: number };
  }> {
    try {
      const file = new File(imageUri);
      const bytes = await file.bytes();
      
      return {
        size: bytes.length / (1024 * 1024), // Size in MB
        format: this.detectImageFormat(bytes),
      };
    } catch (error) {
      console.error('Failed to get image metadata:', error);
      return { size: 0 };
    }
  }

  /**
   * Detect image format from file bytes
   */
  private static detectImageFormat(bytes: ArrayBuffer): string {
    const uint8Array = new Uint8Array(bytes);
    
    // Check for JPEG
    if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
      return 'jpeg';
    }
    
    // Check for PNG
    if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && 
        uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
      return 'png';
    }
    
    // Check for WebP
    if (uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && 
        uint8Array[10] === 0x42 && uint8Array[11] === 0x50) {
      return 'webp';
    }
    
    return 'unknown';
  }
}
