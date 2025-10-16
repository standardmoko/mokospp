import { QuizData, QuizResponse } from '@/types/quiz';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUIZ_STORAGE_KEY = '@home_harmony_quiz_data';
const QUIZ_VERSION = 1;

export class QuizStorageService {
  /**
   * Save quiz responses to local storage
   */
  static async saveQuizData(responses: QuizResponse[]): Promise<void> {
    try {
      const quizData: QuizData = {
        responses,
        completedAt: Date.now(),
        version: QUIZ_VERSION,
      };
      
      await AsyncStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizData));
    } catch (error) {
      console.error('Failed to save quiz data:', error);
      throw new Error('Unable to save quiz preferences');
    }
  }

  /**
   * Load quiz responses from local storage
   */
  static async loadQuizData(): Promise<QuizData | null> {
    try {
      const storedData = await AsyncStorage.getItem(QUIZ_STORAGE_KEY);
      
      if (!storedData) {
        return null;
      }

      const quizData: QuizData = JSON.parse(storedData);
      
      // Check version compatibility
      if (quizData.version !== QUIZ_VERSION) {
        console.warn('Quiz data version mismatch, clearing old data');
        await this.clearQuizData();
        return null;
      }

      return quizData;
    } catch (error) {
      console.error('Failed to load quiz data:', error);
      return null;
    }
  }

  /**
   * Clear all quiz data from storage
   */
  static async clearQuizData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUIZ_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear quiz data:', error);
    }
  }

  /**
   * Check if user has completed the quiz
   */
  static async hasCompletedQuiz(): Promise<boolean> {
    try {
      const quizData = await this.loadQuizData();
      return quizData !== null && quizData.responses.length >= 3;
    } catch (error) {
      console.error('Failed to check quiz completion:', error);
      return false;
    }
  }

  /**
   * Get specific quiz response by question ID
   */
  static async getQuizResponse(questionId: string): Promise<QuizResponse | null> {
    try {
      const quizData = await this.loadQuizData();
      
      if (!quizData) {
        return null;
      }

      return quizData.responses.find(response => response.questionId === questionId) || null;
    } catch (error) {
      console.error('Failed to get quiz response:', error);
      return null;
    }
  }
}
