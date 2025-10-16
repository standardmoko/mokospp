import React from 'react';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';

import { ProgressIndicator } from '@/components/progress-indicator';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { AIAnalysisState } from '@/types/ai-analysis';

interface AIAnalysisModalProps {
  isVisible: boolean;
  analysisState: AIAnalysisState;
  onCancel?: () => void;
}

export function AIAnalysisModal({ 
  isVisible, 
  analysisState, 
  onCancel 
}: AIAnalysisModalProps) {
  const { isAnalyzing, progress, currentStep, error } = analysisState;

  return (
    <Modal
      isVisible={isVisible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.7}
      hasBackdrop={true}
      useNativeDriver={false}
      style={styles.modal}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <IconSymbol 
            name="brain.head.profile" 
            size={32} 
            color={Colors.primary} 
          />
          <ThemedText style={[GlobalStyles.heading2, styles.title]}>
            AI Workspace Analysis
          </ThemedText>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {error ? (
            // Error State
            <View style={styles.errorContainer}>
              <IconSymbol 
                name="exclamationmark.triangle.fill" 
                size={24} 
                color={Colors.error} 
              />
              <ThemedText style={[GlobalStyles.bodyLarge, styles.errorTitle]}>
                Analysis Failed
              </ThemedText>
              <ThemedText style={[GlobalStyles.bodyMedium, styles.errorMessage]}>
                {error}
              </ThemedText>
              <ThemedText style={[GlobalStyles.bodySmall, styles.errorHint]}>
                Don&apos;t worry - we&apos;ll provide recommendations based on your style preferences.
              </ThemedText>
            </View>
          ) : (
            // Loading State
            <View style={styles.loadingContainer}>
              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <ProgressIndicator 
                  progress={progress} 
                  size="large"
                  showPercentage={true}
                />
              </View>

              {/* Current Step */}
              <ThemedText style={[GlobalStyles.bodyLarge, styles.stepText]}>
                {currentStep}
              </ThemedText>

              {/* Progress Description */}
              <ThemedText style={[GlobalStyles.bodySmall, styles.description]}>
                Our AI is analyzing your workspace photo and generating personalized 
                recommendations based on your style preferences.
              </ThemedText>

              {/* Analysis Steps */}
              <View style={styles.stepsContainer}>
                <AnalysisStep 
                  icon="camera.viewfinder" 
                  text="Processing workspace image" 
                  isActive={progress >= 20 && progress < 50}
                  isCompleted={progress >= 50}
                />
                <AnalysisStep 
                  icon="lightbulb" 
                  text="Generating recommendations" 
                  isActive={progress >= 50 && progress < 80}
                  isCompleted={progress >= 80}
                />
                <AnalysisStep 
                  icon="paintpalette" 
                  text="Extracting color palette" 
                  isActive={progress >= 80 && progress < 90}
                  isCompleted={progress >= 90}
                />
                <AnalysisStep 
                  icon="checkmark.circle.fill" 
                  text="Finalizing results" 
                  isActive={progress >= 90 && progress < 100}
                  isCompleted={progress >= 100}
                />
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        {onCancel && (
          <View style={styles.footer}>
            <ThemedText style={[GlobalStyles.bodySmall, styles.cancelHint]}>
              This usually takes 5-10 seconds
            </ThemedText>
          </View>
        )}
      </View>
    </Modal>
  );
}

interface AnalysisStepProps {
  icon: string;
  text: string;
  isActive: boolean;
  isCompleted: boolean;
}

function AnalysisStep({ icon, text, isActive, isCompleted }: AnalysisStepProps) {
  const getIconColor = () => {
    if (isCompleted) return Colors.success;
    if (isActive) return Colors.primary;
    return Colors.textLighter;
  };

  const getTextStyle = () => {
    if (isCompleted || isActive) {
      return [GlobalStyles.bodyMedium, styles.stepActiveText];
    }
    return [GlobalStyles.bodyMedium, styles.stepInactiveText];
  };

  return (
    <View style={styles.step}>
      <IconSymbol 
        name={isCompleted ? "checkmark.circle.fill" : icon} 
        size={16} 
        color={getIconColor()} 
      />
      <ThemedText style={getTextStyle()}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: Spacing.lg,
    zIndex: 1200,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.large,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  stepText: {
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  description: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 18,
    opacity: 0.8,
  },
  stepsContainer: {
    width: '100%',
    gap: Spacing.sm,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  stepActiveText: {
    color: Colors.text,
    fontWeight: '500',
  },
  stepInactiveText: {
    color: Colors.textLighter,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  errorTitle: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    fontWeight: '600',
    color: Colors.error,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
    color: Colors.textLight,
  },
  errorHint: {
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  cancelHint: {
    opacity: 0.6,
    textAlign: 'center',
  },
});
