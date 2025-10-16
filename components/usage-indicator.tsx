import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';

interface UsageIndicatorProps {
  remainingAnalyses: number;
  totalAnalyses: number;
}

export function UsageIndicator({ 
  remainingAnalyses = 5, 
  totalAnalyses = 5 
}: UsageIndicatorProps) {
  const usedAnalyses = totalAnalyses - remainingAnalyses;
  const progressPercentage = (usedAnalyses / totalAnalyses) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
      </View>
      
      <ThemedText style={[GlobalStyles.caption, styles.text]}>
        {remainingAnalyses} AI analyses remaining today
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  progressContainer: {
    marginBottom: Spacing.xs,
  },
  progressBackground: {
    width: 120,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  text: {
    textAlign: 'center',
  },
});
