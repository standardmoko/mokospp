import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';

interface PrivacyPolicyModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isVisible, onClose }: PrivacyPolicyModalProps) {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
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
          <ThemedText style={GlobalStyles.heading1}>Privacy Policy</ThemedText>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
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
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>No Data Collection</ThemedText>
            <ThemedText style={styles.sectionContent}>
              We do not collect, store, or share any user data. There is no backend, no server, no login, or any data collection involved. All results are stored locally on your device after analysis.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Image Processing</ThemedText>
            <ThemedText style={styles.sectionContent}>
              When you upload an image, OpenAI analyzes it solely to provide a better result for what you are looking for. After processing, all results are saved locally, and all images remain on your device.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Local Storage Only</ThemedText>
            <ThemedText style={styles.sectionContent}>
              All data is saved locally on your device, and you have full control over it. You can delete all your saved data at any time directly from your device. We do not process, store, or have access to any of your images or personal information.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>OpenAI Processing</ThemedText>
            <ThemedText style={styles.sectionContent}>
              Images are sent to OpenAI for analysis to generate workspace recommendations. OpenAI processes these images according to their own privacy policy. We do not store or have access to your images - they are only used for generating your personalized results.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Data Deletion</ThemedText>
            <ThemedText style={styles.sectionContent}>
              You maintain complete control over your data:
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • Delete individual workspace analyses at any time
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • Clear all saved data through app settings
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • Uninstalling the app removes all data permanently
            </ThemedText>
            <ThemedText style={styles.bulletPoint}>
              • No data recovery possible as nothing is stored externally
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Contact Us</ThemedText>
            <ThemedText style={styles.sectionContent}>
              If you have any questions about this Privacy Policy, please contact us.
            </ThemedText>
          </View>

          <View style={styles.lastUpdated}>
            <ThemedText style={styles.lastUpdatedText}>
              Last updated: October 2025
            </ThemedText>
          </View>
        </ScrollView>
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
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  bulletPoint: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: Spacing.xs,
    paddingLeft: Spacing.sm,
  },
  lastUpdated: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: Colors.textLighter,
    fontStyle: 'italic',
  },
});
