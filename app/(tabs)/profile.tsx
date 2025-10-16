import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { AppInfo } from '@/components/profile/app-info';
import { PrivacyPolicyModal } from '@/components/profile/privacy-policy-modal';
import { UserSummary } from '@/components/profile/user-summary';
import { SafeAreaScrollView } from '@/components/safe-area-view';
import { StyleQuizModal } from '@/components/style-quiz-modal';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { QuizResponse } from '@/types/quiz';

export default function ProfileScreen() {
  const [isPrivacyPolicyModalVisible, setIsPrivacyPolicyModalVisible] = useState(false);
  const [isQuizModalVisible, setIsQuizModalVisible] = useState(false);

  const handleEditPreferences = () => {
    setIsQuizModalVisible(true);
  };

  const handleQuizComplete = (responses: QuizResponse[]) => {
    console.log('Quiz preferences updated:', responses);
    setIsQuizModalVisible(false);
    // The UserSummary component will automatically reload and show updated preferences
  };

  const handleQuizClose = () => {
    setIsQuizModalVisible(false);
  };

  const handlePrivacyPolicyPress = () => {
    setIsPrivacyPolicyModalVisible(true);
  };

  return (
    <SafeAreaScrollView 
      contentContainerStyle={styles.scrollContent}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={[styles.header, GlobalStyles.screenPadding]}>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={GlobalStyles.heading1}>
            Profile
          </ThemedText>
          <ThemedText style={GlobalStyles.bodyMedium}>
            Your preferences and settings
          </ThemedText>
        </View>
        
      </View>

      {/* User Summary Section */}
      <View style={[styles.section, GlobalStyles.screenPadding]}>
        <UserSummary onEditPreferences={handleEditPreferences} />
      </View>

      {/* Quick Actions */}
      <View style={[styles.section, GlobalStyles.screenPadding]}>
        <ThemedText style={GlobalStyles.heading2}>Quick Actions</ThemedText>
        
        <View style={styles.actionsContainer}>


          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditPreferences}
          >
            <IconSymbol name="pencil" size={20} color={Colors.primary} />
            <View style={styles.actionText}>
              <ThemedText style={styles.actionLabel}>Update Preferences</ThemedText>
              <ThemedText style={styles.actionDescription}>
                Retake the style quiz
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={Colors.textLighter} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePrivacyPolicyPress}
          >
            <IconSymbol name="shield.checkered" size={20} color={Colors.primary} />
            <View style={styles.actionText}>
              <ThemedText style={styles.actionLabel}>Privacy Policy</ThemedText>
              <ThemedText style={styles.actionDescription}>
                View our privacy policy
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={16} color={Colors.textLighter} />
          </TouchableOpacity>
        </View>
      </View>

      {/* App Information */}
      <View style={[styles.section, GlobalStyles.screenPadding]}>
        <AppInfo />
      </View>

      {/* Modals */}


      <PrivacyPolicyModal
        isVisible={isPrivacyPolicyModalVisible}
        onClose={() => setIsPrivacyPolicyModalVisible(false)}
      />

      <StyleQuizModal
        isVisible={isQuizModalVisible}
        onClose={handleQuizClose}
        onComplete={handleQuizComplete}
      />
    </SafeAreaScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  actionsContainer: {
    marginTop: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  actionText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
});
