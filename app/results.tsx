import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AnalysisSummary } from '@/components/results/analysis-summary';
import { ColorPaletteDisplay } from '@/components/results/color-palette-display';
import { ErgonomicInsights } from '@/components/results/ergonomic-insights';
import { RecommendationCarousel } from '@/components/results/recommendation-carousel';
import { ResultsActions } from '@/components/results/results-actions';
import { SafeAreaScrollView } from '@/components/safe-area-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { DesignStorageService } from '@/services/design-storage';
import { WorkspaceAnalysisResult } from '@/types/ai-analysis';
import { PhotoAsset } from '@/types/photo';
import { QuizResponse } from '@/types/quiz';

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const [analysisResult, setAnalysisResult] = useState<WorkspaceAnalysisResult | null>(null);
  const [originalPhoto, setOriginalPhoto] = useState<PhotoAsset | null>(null);
  const [quizResponses, setQuizResponses] = useState<QuizResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Parse the analysis result from navigation params
    if (params.result && typeof params.result === 'string') {
      try {
        const result = JSON.parse(params.result) as WorkspaceAnalysisResult;
        setAnalysisResult(result);
        
        // Parse photo if available
        if (params.photo && typeof params.photo === 'string') {
          const photo = JSON.parse(params.photo) as PhotoAsset;
          setOriginalPhoto(photo);
        }
        
        // Parse quiz responses if available
        if (params.quizResponses && typeof params.quizResponses === 'string') {
          const responses = JSON.parse(params.quizResponses) as QuizResponse[];
          setQuizResponses(responses);
        }
      } catch (error) {
        console.error('Failed to parse analysis result:', error);
        Alert.alert(
          'Error',
          'Failed to load analysis results. Please try again.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } else {
      Alert.alert(
        'No Results',
        'No analysis results found. Please run a new analysis.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
    setIsLoading(false);
  }, [params.result, params.photo, params.quizResponses]);

  const handleSaveDesign = async () => {
    if (!analysisResult || isSaving) return;
    
    // Check if we have the required data
    if (!originalPhoto) {
      Alert.alert(
        'Save Error',
        'Cannot save design: Original photo is missing. Please run a new analysis.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (!quizResponses || quizResponses.length === 0) {
      Alert.alert(
        'Save Error',
        'Cannot save design: Quiz responses are missing. Please run a new analysis.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsSaving(true);
    
    try {
      const result = await DesignStorageService.saveDesign(
        analysisResult,
        originalPhoto,
        quizResponses
      );
      
      if (result.success) {
        Alert.alert(
          'Design Saved',
          'Your workspace design has been saved successfully!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Save Failed',
          result.error || 'Failed to save design. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to save design:', error);
      Alert.alert(
        'Save Failed',
        'An error occurred while saving your design. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTryAgain = () => {
    // Navigate back to home screen to start a new analysis
    router.replace('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaScrollView>
        <View style={styles.loadingContainer}>
          <ThemedText style={GlobalStyles.bodyLarge}>Loading results...</ThemedText>
        </View>
      </SafeAreaScrollView>
    );
  }

  if (!analysisResult) {
    return (
      <SafeAreaScrollView>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={Colors.error} />
          <ThemedText style={[GlobalStyles.heading2, styles.errorTitle]}>
            No Results Found
          </ThemedText>
          <ThemedText style={[GlobalStyles.bodyMedium, styles.errorMessage]}>
            We couldn&apos;t find your analysis results. Please try running a new analysis.
          </ThemedText>
          <TouchableOpacity
            style={[GlobalStyles.primaryButton, styles.errorButton]}
            onPress={handleTryAgain}
          >
            <ThemedText style={GlobalStyles.primaryButtonText}>
              Start New Analysis
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaScrollView>
    );
  }

  return (
    <SafeAreaScrollView contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          accessibilityLabel="Go back"
        >
          <IconSymbol name="chevron.left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <ThemedText style={[GlobalStyles.heading1, styles.headerTitle]}>
          Your Workspace Analysis
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>
        {/* Analysis Summary */}
        <AnalysisSummary 
          summary={analysisResult.summary}
          styleMatch={analysisResult.styleMatch}
          processingTime={analysisResult.processingTime}
        />

        {/* Product Recommendations */}
        <View style={styles.section}>
          <ThemedText style={[GlobalStyles.heading2, styles.sectionTitle]}>
            Recommended Products
          </ThemedText>
          <ThemedText style={[GlobalStyles.bodyMedium, styles.sectionDescription]}>
            Curated recommendations based on your style preferences and workspace analysis
          </ThemedText>
          <RecommendationCarousel recommendations={analysisResult.recommendations} />
        </View>

        {/* Color Palette */}
        {analysisResult.colorPalette && (
          <View style={styles.section}>
            <ThemedText style={[GlobalStyles.heading2, styles.sectionTitle]}>
              Color Palette
            </ThemedText>
            <ColorPaletteDisplay colorPalette={analysisResult.colorPalette} />
          </View>
        )}

        {/* Ergonomic Insights */}
        <View style={styles.section}>
          <ThemedText style={[GlobalStyles.heading2, styles.sectionTitle]}>
            Ergonomic Assessment
          </ThemedText>
          <ErgonomicInsights insights={analysisResult.ergonomicInsights} />
        </View>

        {/* Bottom Spacing for Actions */}
      <View style={styles.bottomSpacing} />

      {/* Fixed Action Buttons */}
      <ResultsActions
        onSaveDesign={handleSaveDesign}
        onTryAgain={handleTryAgain}
      />
    </SafeAreaScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.md,
  },
  headerSpacer: {
    width: 40, // Same as back button width
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    marginBottom: Spacing.lg,
    opacity: 0.8,
  },
  bottomSpacing: {
    height: 100, // Space for fixed action buttons
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    color: Colors.error,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },
  errorButton: {
    minWidth: 200,
  },
});
