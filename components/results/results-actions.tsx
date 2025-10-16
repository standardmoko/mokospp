import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';

interface ResultsActionsProps {
  onSaveDesign: () => void;
  onTryAgain: () => void;
}

export function ResultsActions({ onSaveDesign, onTryAgain }: ResultsActionsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.actionsContainer}>
        {/* Try Again Button */}
        <TouchableOpacity
          style={[GlobalStyles.outlineButton, styles.tryAgainButton]}
          onPress={onTryAgain}
          accessibilityLabel="Start a new workspace analysis"
        >
          <IconSymbol name="arrow.clockwise" size={18} color={Colors.primary} />
          <ThemedText style={[GlobalStyles.outlineButtonText, styles.buttonText]}>
            Try Again
          </ThemedText>
        </TouchableOpacity>

        {/* Save Design Button */}
        <TouchableOpacity
          style={[GlobalStyles.primaryButton, styles.saveButton]}
          onPress={onSaveDesign}
          accessibilityLabel="Save this design to favorites"
        >
          <IconSymbol name="heart" size={18} color={Colors.white} />
          <ThemedText style={[GlobalStyles.primaryButtonText, styles.buttonText]}>
            Save Design
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl, // Extra padding for safe area
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  tryAgainButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  buttonText: {
    fontWeight: '600',
  },
});
