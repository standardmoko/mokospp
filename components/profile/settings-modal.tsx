import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { StorageService } from '@/services/storage';
import { UserPreferences } from '@/types/storage';

interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function SettingsModal({ isVisible, onClose }: SettingsModalProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      loadPreferences();
    }
  }, [isVisible]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const result = await StorageService.getUserPreferences();
      
      if (result.success && result.data) {
        setPreferences(result.data);
      } else {
        // Create default preferences if none exist
        const createResult = await StorageService.createUserPreferences();
        if (createResult.success && createResult.data) {
          setPreferences(createResult.data);
        }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      Alert.alert('Error', 'Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    if (!preferences) return;

    try {
      const result = await StorageService.updateUserPreferences({
        [key]: value,
      });

      if (result.success && result.data) {
        setPreferences(result.data);
      } else {
        Alert.alert('Error', 'Failed to save setting. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update preference:', error);
      Alert.alert('Error', 'Failed to save setting. Please try again.');
    }
  };




  if (loading) {
    return (
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ThemedText style={GlobalStyles.bodyMedium}>Loading settings...</ThemedText>
          </View>
        </View>
      </Modal>
    );
  }

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
          <ThemedText style={GlobalStyles.heading1}>Settings</ThemedText>
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

          {/* Display Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Display</ThemedText>
            
            <View style={styles.infoItem}>
              <IconSymbol name="gear" size={20} color={Colors.textLight} />
              <View style={styles.infoText}>
                <ThemedText style={styles.infoLabel}>Theme</ThemedText>
                <ThemedText style={styles.infoValue}>System Default</ThemedText>
              </View>
            </View>
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
    maxHeight: '80%',
    minHeight: '60%',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  section: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  infoValue: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
});
