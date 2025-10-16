import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';

interface AppInfoProps {}

export function AppInfo({}: AppInfoProps) {


  return (
    <ThemedView style={styles.container}>

      {/* Credits */}
      <View style={styles.section}>
        <ThemedText style={GlobalStyles.heading2}>Credits</ThemedText>
        
        <View style={styles.creditsContainer}>
          <View style={styles.creditItem}>
            <ThemedText style={styles.creditRole}>Design & Development</ThemedText>
            <ThemedText style={styles.creditName}>Home Harmony Team</ThemedText>
          </View>

          <View style={styles.creditItem}>
            <ThemedText style={styles.creditRole}>AI Analysis</ThemedText>
            <ThemedText style={styles.creditName}>Powered by OpenAI GPT-4o Vision</ThemedText>
          </View>

        </View>
      </View>


      {/* Copyright */}
      <View style={styles.copyrightContainer}>
        <ThemedText style={styles.copyrightText}>
          © 2025 Home Harmony. All rights reserved.
        </ThemedText>
        <ThemedText style={styles.copyrightSubtext}>
          Made with ❤️ for better workspaces
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  creditsContainer: {
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  creditItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  creditRole: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  creditName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  copyrightContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  copyrightText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  copyrightSubtext: {
    fontSize: 10,
    color: Colors.textLighter,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
