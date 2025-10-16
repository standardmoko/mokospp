/**
 * AI Response Parser Service
 * Handles parsing, cleaning, and structuring AI responses
 */
export class AIResponseParserService {
  /**
   * Parse unstructured AI response as fallback
   */
  static parseUnstructuredResponse(content: string): any {
    return {
      workspace_description: content.substring(0, 200) + '...',
      style_assessment: {
        current_style: 'Modern workspace',
        alignment_score: 0.7,
        alignment_explanation: 'Good potential for improvement',
      },
      ergonomic_evaluation: [],
      improvement_priorities: ['Enhance ergonomics', 'Improve organization', 'Add personal touches'],
      color_analysis: {
        dominant_colors: ['#F5F5F5', '#E0E0E0', '#D0D0D0'],
        mood: 'focus',
        color_harmony: 'Neutral color scheme',
      },
    };
  }

  /**
   * Clean and sanitize analysis data to remove JSON formatting
   */
  static cleanAnalysisData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const cleaned = { ...data };

    // Clean workspace description
    if (cleaned.workspace_description) {
      cleaned.workspace_description = this.cleanText(cleaned.workspace_description);
    }

    // Clean style assessment
    if (cleaned.style_assessment) {
      cleaned.style_assessment = {
        ...cleaned.style_assessment,
        current_style: this.cleanText(cleaned.style_assessment.current_style),
        alignment_explanation: this.cleanText(cleaned.style_assessment.alignment_explanation)
      };
    }

    // Clean ergonomic evaluation
    if (cleaned.ergonomic_evaluation && Array.isArray(cleaned.ergonomic_evaluation)) {
      cleaned.ergonomic_evaluation = cleaned.ergonomic_evaluation.map((evaluation: any) => ({
        ...evaluation,
        observation: this.cleanText(evaluation.observation) || this.cleanText(evaluation.description) || 'Assessment in progress',
        recommendation: this.cleanText(evaluation.recommendation) || 'Consider ergonomic improvements'
      })).filter((evaluation: any) => evaluation.category); // Remove invalid entries
    }

    // Clean improvement priorities
    if (cleaned.improvement_priorities && Array.isArray(cleaned.improvement_priorities)) {
      cleaned.improvement_priorities = cleaned.improvement_priorities.map((priority: string) => 
        this.cleanText(priority)
      );
    }

    return cleaned;
  }

  /**
   * Clean text by removing JSON formatting, quotes, and other artifacts
   */
  static cleanText(text: string | undefined | null): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    let cleaned = text;

    // Remove JSON code blocks
    cleaned = cleaned.replace(/```json\s*/gi, '');
    cleaned = cleaned.replace(/```\s*/g, '');
    
    // Remove JSON object/array wrappers if the entire string is wrapped
    cleaned = cleaned.replace(/^\s*{\s*"[^"]*"\s*:\s*"([^"]*)".*}\s*$/s, '$1');
    cleaned = cleaned.replace(/^\s*{\s*([^}]*)\s*}\s*$/s, '$1');
    cleaned = cleaned.replace(/^\s*\[\s*([^\]]*)\s*\]\s*$/s, '$1');
    
    // Remove JSON field prefixes (e.g., "field_name": "value" -> "value")
    cleaned = cleaned.replace(/^[^:]*:\s*"([^"]*)".*$/s, '$1');
    cleaned = cleaned.replace(/^[^:]*:\s*([^,}]*).*$/s, '$1');
    
    // Remove surrounding quotes
    cleaned = cleaned.replace(/^["']|["']$/g, '');
    
    // Unescape JSON characters
    cleaned = cleaned.replace(/\\"/g, '"');
    cleaned = cleaned.replace(/\\n/g, ' ');
    cleaned = cleaned.replace(/\\t/g, ' ');
    cleaned = cleaned.replace(/\\r/g, '');
    cleaned = cleaned.replace(/\\\\/g, '\\');
    
    // Remove trailing commas and other JSON artifacts
    cleaned = cleaned.replace(/,\s*$/, '');
    cleaned = cleaned.replace(/^\s*,/, '');
    cleaned = cleaned.replace(/[{}[\]]/g, '');
    
    // Clean up specific patterns from the logs
    cleaned = cleaned.replace(/^"category":\s*"[^"]*",?\s*/i, '');
    cleaned = cleaned.replace(/^"status":\s*"[^"]*",?\s*/i, '');
    cleaned = cleaned.replace(/^"observation":\s*"([^"]*)".*$/i, '$1');
    cleaned = cleaned.replace(/^"recommendation":\s*"([^"]*)".*$/i, '$1');
    
    // Remove any remaining JSON-like patterns
    cleaned = cleaned.replace(/"[^"]*":\s*/g, '');
    cleaned = cleaned.replace(/"\s*,?\s*$/g, '');
    cleaned = cleaned.replace(/^[^a-zA-Z0-9]*/, ''); // Remove leading non-alphanumeric
    
    // Clean up whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.trim();
    
    // If the result is empty, too short, or just punctuation, return empty string
    if (!cleaned || cleaned.length < 3 || /^[^\w]*$/.test(cleaned)) {
      return '';
    }

    // Capitalize first letter if it's a sentence
    if (cleaned.length > 0 && /^[a-z]/.test(cleaned)) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    return cleaned;
  }

  /**
   * Extract structured data from AI response with fallback parsing
   */
  static extractStructuredData(aiContent: string): any {
    try {
      // Try to parse as JSON first
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try to find JSON object in the response
      const objectMatch = aiContent.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]);
      }

      // Fallback to unstructured parsing
      return this.parseUnstructuredResponse(aiContent);
    } catch (error) {
      console.warn('Failed to parse structured data from AI response:', error);
      return this.parseUnstructuredResponse(aiContent);
    }
  }

  /**
   * Validate AI response structure
   */
  static validateResponseStructure(data: any): {
    isValid: boolean;
    error?: string;
    missingFields?: string[];
  } {
    const requiredFields = ['workspace_description'];
    const optionalFields = ['style_assessment', 'ergonomic_evaluation', 'improvement_priorities', 'color_analysis'];
    
    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        error: 'Response is not a valid object'
      };
    }

    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return {
        isValid: false,
        error: 'Missing required fields',
        missingFields
      };
    }

    return { isValid: true };
  }
}
