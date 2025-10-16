import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { QuizStorageService } from '@/services/quiz-storage';
import { UsageTrackingService } from '@/services/usage-tracking';
import { QuizResponse } from '@/types/quiz';

interface UserSummaryProps {
  onEditPreferences?: () => void;
}

interface UserStats {
  totalAnalyses: number;
  totalDesignsSaved: number;
  todayAnalyses: number;
  remainingToday: number;
  daysSinceFirstUse: number;
}

export function UserSummary({ onEditPreferences }: UserSummaryProps) {
  const [quizResponses, setQuizResponses] = useState<QuizResponse[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Load quiz preferences
      const quizData = await QuizStorageService.loadQuizData();
      if (quizData) {
        setQuizResponses(quizData.responses);
      }

      // Load usage statistics
      const usageResult = await UsageTrackingService.getUsageStats();
      if (usageResult.success && usageResult.data) {
        setUserStats(usageResult.data);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPreferenceLabel = (questionId: string, selectedOptionId: string): string => {
    const preferenceMap: Record<string, Record<string, string>> = {
      'workspace-vibe': {
        'focus-minimal': 'Focus & Minimal',
        'creative-inspiring': 'Creative & Inspiring',
        'cozy-warm': 'Cozy & Warm',
      },
      'color-preference': {
        'neutral-tones': 'Neutral Tones',
        'bold-accents': 'Bold Accents',
        'natural-greens': 'Natural Greens',
      },
      'budget-range': {
        'budget-low': 'Under $500',
        'budget-mid': '$500 - $1500',
        'budget-high': '$1500+',
      },
    };

    return preferenceMap[questionId]?.[selectedOptionId] || 'Unknown';
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={GlobalStyles.bodyMedium}>Loading your profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* User Preferences Section */}
      <View style={styles.section}>
        <View style={[GlobalStyles.row, GlobalStyles.spaceBetween]}>
          <ThemedText style={GlobalStyles.heading2}>Your Preferences</ThemedText>
          {quizResponses.length > 0 && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEditPreferences}
            >
              <IconSymbol name="pencil" size={16} color={Colors.primary} />
              <ThemedText style={styles.editButtonText}>Edit</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {quizResponses.length > 0 ? (
          <View style={styles.preferencesContainer}>
            {quizResponses.map((response) => (
              <View key={response.questionId} style={styles.preferenceItem}>
                <ThemedText style={styles.preferenceLabel}>
                  {response.questionId === 'workspace-vibe' && 'Workspace Style:'}
                  {response.questionId === 'color-preference' && 'Color Palette:'}
                  {response.questionId === 'budget-range' && 'Budget Range:'}
                </ThemedText>
                <ThemedText style={styles.preferenceValue}>
                  {getPreferenceLabel(response.questionId, response.selectedOptionIds[0])}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol name="questionmark.circle" size={32} color={Colors.textLighter} />
            <ThemedText style={[GlobalStyles.bodyMedium, styles.emptyText]}>
              Complete the style quiz to see your preferences here
            </ThemedText>
          </View>
        )}
      </View>

      {/* Usage Statistics Section */}
      {userStats && (
        <View style={styles.section}>
          <ThemedText style={GlobalStyles.heading2}>Usage Statistics</ThemedText>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{userStats.totalAnalyses}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Analyses</ThemedText>
            </View>
            
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{userStats.totalDesignsSaved}</ThemedText>
              <ThemedText style={styles.statLabel}>Designs Saved</ThemedText>
            </View>
            
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{userStats.remainingToday}</ThemedText>
              <ThemedText style={styles.statLabel}>Remaining Today</ThemedText>
            </View>
            
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{userStats.daysSinceFirstUse}</ThemedText>
              <ThemedText style={styles.statLabel}>Days Active</ThemedText>
            </View>
          </View>
        </View>
      )}
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: Spacing.xs,
  },
  preferencesContainer: {
    marginTop: Spacing.md,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  preferenceLabel: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  preferenceValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing.sm,
    color: Colors.textLighter,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    fontWeight: '500',
  },
});
