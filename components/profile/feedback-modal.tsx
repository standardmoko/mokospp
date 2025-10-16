import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';

interface FeedbackModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type FeedbackType = 'bug' | 'feature' | 'general' | 'compliment';

interface FeedbackOption {
  id: FeedbackType;
  label: string;
  icon: string;
  description: string;
}

const FEEDBACK_OPTIONS: FeedbackOption[] = [
  {
    id: 'bug',
    label: 'Bug Report',
    icon: 'exclamationmark.triangle',
    description: 'Report a problem or issue',
  },
  {
    id: 'feature',
    label: 'Feature Request',
    icon: 'lightbulb',
    description: 'Suggest a new feature or improvement',
  },
  {
    id: 'general',
    label: 'General Feedback',
    icon: 'message',
    description: 'Share your thoughts or suggestions',
  },
  {
    id: 'compliment',
    label: 'Compliment',
    icon: 'heart',
    description: 'Tell us what you love about the app',
  },
];

export function FeedbackModal({ isVisible, onClose }: FeedbackModalProps) {
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    // Reset form when closing
    setSelectedType(null);
    setFeedbackText('');
    setEmail('');
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedType || !feedbackText.trim()) {
      Alert.alert('Missing Information', 'Please select a feedback type and provide your feedback.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate feedback submission
      // In a real app, this would send to your feedback service
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted successfully. We appreciate your input and will review it carefully.',
        [
          {
            text: 'OK',
            onPress: handleClose,
          },
        ]
      );
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      Alert.alert(
        'Submission Failed',
        'There was an error submitting your feedback. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFeedbackOption = (option: FeedbackOption) => {
    const isSelected = selectedType === option.id;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.optionButton, isSelected && styles.selectedOption]}
        onPress={() => setSelectedType(option.id)}
      >
        <View style={styles.optionContent}>
          <IconSymbol 
            name={option.icon} 
            size={20} 
            color={isSelected ? Colors.primary : Colors.textLight} 
          />
          <View style={styles.optionText}>
            <ThemedText style={[
              styles.optionLabel,
              isSelected && styles.selectedOptionText
            ]}>
              {option.label}
            </ThemedText>
            <ThemedText style={styles.optionDescription}>
              {option.description}
            </ThemedText>
          </View>
        </View>
        {isSelected && (
          <IconSymbol name="checkmark" size={16} color={Colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const canSubmit = selectedType && feedbackText.trim() && !isSubmitting;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      useNativeDriver={true}
      avoidKeyboard={true}
      statusBarTranslucent={false}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={GlobalStyles.heading1}>Send Feedback</ThemedText>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <IconSymbol name="xmark" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={true}
          alwaysBounceVertical={false}
          decelerationRate={0.998}
          scrollEventThrottle={1}
          removeClippedSubviews={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          scrollIndicatorInsets={{ right: 1 }}
          overScrollMode="never"
          directionalLockEnabled={true}
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
        >
          {/* Feedback Type Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>What type of feedback?</ThemedText>
            <View style={styles.optionsContainer}>
              {FEEDBACK_OPTIONS.map(renderFeedbackOption)}
            </View>
          </View>

          {/* Feedback Text */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Tell us more {selectedType && `about your ${selectedType}`}
            </ThemedText>
            <TextInput
              style={[GlobalStyles.textInput, styles.textArea]}
              placeholder="Share your thoughts, suggestions, or describe the issue..."
              placeholderTextColor={Colors.textLighter}
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Optional Email */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Email (optional)
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              Provide your email if you'd like us to follow up with you
            </ThemedText>
            <TextInput
              style={GlobalStyles.textInput}
              placeholder="your.email@example.com"
              placeholderTextColor={Colors.textLighter}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[GlobalStyles.compactOutlineButton, styles.cancelButton]}
            onPress={handleClose}
          >
            <ThemedText style={GlobalStyles.compactOutlineButtonText}>Cancel</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              GlobalStyles.compactButton,
              styles.submitButton,
              !canSubmit && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <ThemedText style={[
              GlobalStyles.compactButtonText,
              !canSubmit && styles.disabledButtonText,
            ]}>
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xlarge,
    borderTopRightRadius: BorderRadius.xlarge,
    maxHeight: '90%',
    minHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: Spacing.md,
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '10',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  selectedOptionText: {
    color: Colors.primary,
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  textArea: {
    height: 120,
    paddingTop: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  disabledButton: {
    backgroundColor: Colors.border,
  },
  disabledButtonText: {
    color: Colors.textLighter,
  },
});
