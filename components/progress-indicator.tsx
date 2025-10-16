import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  showLabels?: boolean;
}

export function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  showLabels = true 
}: ProgressIndicatorProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {showLabels && (
        <ThemedText style={[GlobalStyles.bodySmall, styles.label]}>
          Step {currentStep} of {totalSteps}
        </ThemedText>
      )}
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
        
        <View style={styles.stepsContainer}>
          {Array.from({ length: totalSteps }, (_, index) => (
            <View
              key={index}
              style={[
                styles.stepIndicator,
                index < currentStep ? styles.stepCompleted : styles.stepPending,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  label: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
    opacity: 0.8,
  },
  progressContainer: {
    position: 'relative',
    height: 8,
  },
  progressBackground: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginTop: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  stepCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepPending: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
});
