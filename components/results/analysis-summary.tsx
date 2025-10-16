import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';

interface AnalysisSummaryProps {
  summary: string;
  styleMatch: {
    vibe: string;
    confidence: number;
    explanation: string;
  };
  processingTime: number;
}

export function AnalysisSummary({ summary, styleMatch, processingTime }: AnalysisSummaryProps) {
  const formatProcessingTime = (ms: number): string => {
    const seconds = Math.round(ms / 1000);
    return `${seconds}s`;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return Colors.success;
    if (confidence >= 0.6) return Colors.warning;
    return Colors.error;
  };

  const getConfidenceIcon = (confidence: number): string => {
    if (confidence >= 0.8) return 'checkmark.circle.fill';
    if (confidence >= 0.6) return 'exclamationmark.circle.fill';
    return 'xmark.circle.fill';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <IconSymbol name="sparkles" size={24} color={Colors.primary} />
        <ThemedText style={[GlobalStyles.heading2, styles.headerTitle]}>
          Analysis Complete
        </ThemedText>
        <View style={styles.processingTime}>
          <ThemedText style={[GlobalStyles.bodySmall, styles.processingTimeText]}>
            {formatProcessingTime(processingTime)}
          </ThemedText>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <ThemedText style={[GlobalStyles.bodyLarge, styles.summaryText]}>
          {summary}
        </ThemedText>
      </View>

      {/* Style Match */}
      <View style={styles.styleMatchCard}>
        <View style={styles.styleMatchHeader}>
          <ThemedText style={[GlobalStyles.heading3, styles.styleMatchTitle]}>
            Style Match
          </ThemedText>
          <View style={styles.confidenceIndicator}>
            <IconSymbol 
              name={getConfidenceIcon(styleMatch.confidence)} 
              size={16} 
              color={getConfidenceColor(styleMatch.confidence)} 
            />
            <ThemedText style={[
              GlobalStyles.bodySmall, 
              styles.confidenceText,
              { color: getConfidenceColor(styleMatch.confidence) }
            ]}>
              {Math.round(styleMatch.confidence * 100)}%
            </ThemedText>
          </View>
        </View>

        <View style={styles.styleMatchContent}>
          <ThemedText style={[GlobalStyles.bodyMedium, styles.vibeText]}>
            Current Style: {styleMatch.vibe}
          </ThemedText>
          <ThemedText style={[GlobalStyles.bodyMedium, styles.explanationText]}>
            {styleMatch.explanation}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  processingTime: {
    backgroundColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.small,
  },
  processingTimeText: {
    fontWeight: '600',
    opacity: 0.8,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryText: {
    lineHeight: 24,
  },
  styleMatchCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  styleMatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  styleMatchTitle: {
    flex: 1,
  },
  confidenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  confidenceText: {
    fontWeight: '600',
  },
  styleMatchContent: {
    gap: Spacing.sm,
  },
  vibeText: {
    fontWeight: '600',
    color: Colors.primary,
  },
  explanationText: {
    opacity: 0.8,
    lineHeight: 20,
  },
});
