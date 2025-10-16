import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AIAnalysisModal } from '@/components/ai-analysis-modal';
import { ImageComparisonSlider } from '@/components/image-comparison-slider';
import { PhotoUploadModal } from '@/components/photo-upload-modal';
import { RecentActivity } from '@/components/recent-activity';
import { SafeAreaScrollView } from '@/components/safe-area-view';
import { StyleQuizModal } from '@/components/style-quiz-modal';
import { ThemedText } from '@/components/themed-text';
import { UsageIndicator } from '@/components/usage-indicator';
import { Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { AIAnalysisService } from '@/services/ai-analysis';
import { DesignStorageService } from '@/services/design-storage';
import { StorageService } from '@/services/storage';
import { UsageTrackingService } from '@/services/usage-tracking';
import { AIAnalysisState } from '@/types/ai-analysis';
import { PhotoAsset } from '@/types/photo';
import { QuizResponse } from '@/types/quiz';
import { SavedDesign } from '@/types/storage';

export default function HomeScreen() {
  const [isQuizModalVisible, setIsQuizModalVisible] = useState(false);
  const [isPhotoUploadVisible, setIsPhotoUploadVisible] = useState(false);
  const [quizResponses, setQuizResponses] = useState<QuizResponse[]>([]);
  const [analysisState, setAnalysisState] = useState<AIAnalysisState>({
    isAnalyzing: false,
    progress: 0,
    currentStep: '',
    error: null,
    result: null,
  });
  const [remainingAnalyses, setRemainingAnalyses] = useState(5);
  const [recentDesigns, setRecentDesigns] = useState<SavedDesign[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize storage and load data on component mount
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize storage
      await StorageService.initialize();
      
      // Load usage data
      const usageStats = await UsageTrackingService.getUsageStats();
      if (usageStats.success) {
        setRemainingAnalyses(usageStats.data!.remainingToday);
      }

      // Load recent designs
      const recentDesignsResult = await DesignStorageService.getRecentDesigns(3);
      if (recentDesignsResult.success) {
        setRecentDesigns(recentDesignsResult.data!);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await initializeApp();
    setIsRefreshing(false);
  };

  const handleDesignMyOffice = async () => {
    // Check usage limits before starting
    const canAnalyze = await UsageTrackingService.canPerformAnalysis();
    
    if (!canAnalyze.success || !canAnalyze.data) {
      Alert.alert(
        'Daily Limit Reached',
        `You&apos;ve reached your daily limit of 5 AI analyses. Please try again tomorrow.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setIsQuizModalVisible(true);
  };

  const handleQuizComplete = (responses: QuizResponse[]) => {
    console.log('Quiz completed with responses:', responses);
    setQuizResponses(responses);
    setIsQuizModalVisible(false);
    // Proceed to photo upload
    setIsPhotoUploadVisible(true);
  };

  const handleQuizClose = () => {
    setIsQuizModalVisible(false);
  };

  const handlePhotoUploadComplete = async (photo: PhotoAsset, responses?: QuizResponse[]) => {
    console.log('Photo upload completed:', photo);
    console.log('With quiz responses:', responses);
    
    setIsPhotoUploadVisible(false);
    
    // Start AI analysis
    await startAIAnalysis(photo, responses || quizResponses);
  };

  const startAIAnalysis = async (photo: PhotoAsset, responses: QuizResponse[]) => {
    // Validate configuration first
    const configValidation = AIAnalysisService.validateConfiguration();
    if (!configValidation.isValid) {
      Alert.alert(
        'Configuration Error',
        configValidation.error || 'AI analysis is not properly configured.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Record usage before starting analysis
    const usageResult = await UsageTrackingService.recordAnalysisUsage();
    if (!usageResult.success) {
      Alert.alert(
        'Usage Limit Error',
        usageResult.error || 'Unable to track usage.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Update remaining analyses count
    setRemainingAnalyses(prev => Math.max(0, prev - 1));

    // Reset analysis state
    setAnalysisState({
      isAnalyzing: true,
      progress: 0,
      currentStep: 'Initializing analysis...',
      error: null,
      result: null,
    });

    try {
      const result = await AIAnalysisService.analyzeWorkspace(
        { photo, quizResponses: responses },
        (step: string, progress: number) => {
          setAnalysisState(prev => ({
            ...prev,
            currentStep: step,
            progress,
          }));
        }
      );

      // Analysis completed successfully
      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: false,
        progress: 100,
        result,
      }));

      // Navigate to results screen
      console.log('Analysis completed:', result);
      
      // Navigate to results screen with the analysis data
      setTimeout(() => {
        setAnalysisState(prev => ({ ...prev, isAnalyzing: false }));
        router.push({
          pathname: '/results',
          params: {
            result: JSON.stringify(result),
            photo: JSON.stringify(photo),
            quizResponses: JSON.stringify(responses)
          }
        });
      }, 1000);

    } catch (error) {
      console.error('AI analysis failed:', error);
      
      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Analysis failed. Please try again.',
      }));

      // Show error for a few seconds, then close
      setTimeout(() => {
        setAnalysisState(prev => ({ ...prev, error: null }));
      }, 3000);
    }
  };

  const handlePhotoUploadClose = () => {
    setIsPhotoUploadVisible(false);
  };

  return (
    <SafeAreaScrollView 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      edges={['top', 'left', 'right']}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Header Section with Green Background */}
      <View style={styles.header}>
        <ThemedText type="title" style={[GlobalStyles.displayLarge, styles.appTitle]}>
          Home Harmony
        </ThemedText>
        <ThemedText style={[GlobalStyles.bodyMedium, styles.tagline]}>
          AI-Powered Workspace Design
        </ThemedText>
      </View>

      {/* Transform Your Workspace Section - Second */}
      <View style={styles.heroSection}>
        <ThemedText style={[GlobalStyles.heading1, styles.welcomeTitle]}>
          Transform Your Workspace
        </ThemedText>
        <ThemedText style={[GlobalStyles.bodyMedium, styles.welcomeDescription]}>
          See the potential of your space with AI-powered design recommendations
        </ThemedText>

        {/* Image Comparison Slider */}
        <ImageComparisonSlider
          beforeImage={require('@/assets/images/partial-react-logo.png')} // Represents "before" - empty/minimal space
          afterImage={require('@/assets/images/react-logo.png')} // Represents "after" - fully designed space
          height={180}
        />

        {/* Primary CTA Button */}
        <TouchableOpacity 
          style={[GlobalStyles.primaryButton, styles.ctaButton]}
          onPress={handleDesignMyOffice}
          accessibilityLabel="Start designing your office"
          accessibilityHint="Opens the style quiz to begin workspace analysis"
        >
          <ThemedText style={GlobalStyles.primaryButtonText}>
            Design My Office
          </ThemedText>
        </TouchableOpacity>

        {/* Usage Indicator */}
        <UsageIndicator remainingAnalyses={remainingAnalyses} totalAnalyses={5} />
      </View>

      {/* Recent Activity Section - Third */}
      <View style={[styles.recentSection, GlobalStyles.screenPadding]}>
        <RecentActivity 
          hasRecentActivity={recentDesigns.length > 0} 
          recentDesigns={recentDesigns}
          onDesignPress={(design) => {
            router.push({
              pathname: '/favorites',
              params: { showDesign: design.id }
            });
          }}
        />
      </View>

      {/* What You Will Get Section - Fourth */}
      <View style={[styles.featuresSection, GlobalStyles.screenPadding]}>
        <ThemedText style={[GlobalStyles.heading2, styles.sectionTitle]}>
          What You Will Get
        </ThemedText>
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <ThemedText style={styles.featureEmoji}>🎨</ThemedText>
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={[GlobalStyles.bodyMedium, styles.featureTitle]}>
                Color Palettes
              </ThemedText>
              <ThemedText style={[GlobalStyles.bodySmall, styles.featureDescription]}>
                Personalized color schemes that match your style
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <ThemedText style={styles.featureEmoji}>🪑</ThemedText>
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={[GlobalStyles.bodyMedium, styles.featureTitle]}>
                Ergonomic Insights
              </ThemedText>
              <ThemedText style={[GlobalStyles.bodySmall, styles.featureDescription]}>
                Health-focused workspace recommendations
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <ThemedText style={styles.featureEmoji}>🛍️</ThemedText>
            </View>
            <View style={styles.featureContent}>
              <ThemedText style={[GlobalStyles.bodyMedium, styles.featureTitle]}>
                Product Suggestions
              </ThemedText>
              <ThemedText style={[GlobalStyles.bodySmall, styles.featureDescription]}>
                Curated furniture and decor recommendations
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Style Quiz Modal */}
      <StyleQuizModal
        isVisible={isQuizModalVisible}
        onClose={handleQuizClose}
        onComplete={handleQuizComplete}
      />

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isVisible={isPhotoUploadVisible}
        onClose={handlePhotoUploadClose}
        onComplete={handlePhotoUploadComplete}
        quizResponses={quizResponses}
      />

      {/* AI Analysis Modal */}
      <AIAnalysisModal
        isVisible={analysisState.isAnalyzing || analysisState.error !== null}
        analysisState={analysisState}
      />
    </SafeAreaScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: Colors.primary, // Green background
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  appTitle: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
    color: Colors.white, // White text for contrast
  },
  tagline: {
    textAlign: 'center',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)', // Light text for contrast
  },
  heroSection: {
    backgroundColor: '#EBF0E7', // Light green background
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    marginTop: 0, // No space between header and hero section
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    color: Colors.text, // Ensure good contrast
  },
  welcomeDescription: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    lineHeight: 20,
    maxWidth: 300,
    color: Colors.textLight,
  },
  ctaButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    minWidth: 200,
    paddingHorizontal: Spacing.xl,
  },
  featuresSection: {
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  featuresContainer: {
    gap: Spacing.md,
  },
  featureCard: {
    ...GlobalStyles.card,
    // Override card styles
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginVertical: 0, // Override card margin
  },
  featureContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(74, 138, 118, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureTitle: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
    color: Colors.text,
  },
  featureDescription: {
    lineHeight: 18,
    color: Colors.textLight,
  },
  recentSection: {
    paddingBottom: Spacing.lg,
  },
});
