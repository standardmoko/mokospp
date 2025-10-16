import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PhotoPreview } from '@/components/photo-preview';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UploadTips } from '@/components/upload-tips';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { PhotoStorageService } from '@/services/photo-storage';
import { PhotoAsset, PhotoUploadState } from '@/types/photo';
import { SavedDesign } from '@/types/storage';

interface RerunAnalysisModalProps {
  isVisible: boolean;
  design: SavedDesign | null;
  onClose: () => void;
  onComplete: (photo: PhotoAsset, design: SavedDesign) => void;
}

export function RerunAnalysisModal({ 
  isVisible, 
  design,
  onClose, 
  onComplete,
}: RerunAnalysisModalProps) {
  const insets = useSafeAreaInsets();
  const [uploadState, setUploadState] = useState<PhotoUploadState>({
    selectedPhoto: null,
    isUploading: false,
    uploadProgress: 0,
    error: null,
    validationResult: null,
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isVisible) {
      setUploadState({
        selectedPhoto: null,
        isUploading: false,
        uploadProgress: 0,
        error: null,
        validationResult: null,
      });
    } else if (isVisible) {
      requestPermissions();
    }
  }, [isVisible]);

  const requestPermissions = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your photo library to upload workspace photos.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to request permissions:', error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'We need access to your camera to take workspace photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processSelectedPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      setUploadState(prev => ({
        ...prev,
        error: 'Failed to take photo. Please try again.',
      }));
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processSelectedPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Failed to select photo:', error);
      setUploadState(prev => ({
        ...prev,
        error: 'Failed to select photo. Please try again.',
      }));
    }
  };

  const processSelectedPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      uploadProgress: 0,
      error: null,
    }));

    try {
      // Convert to PhotoAsset format
      const photoAsset: PhotoAsset = {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type || 'image',
      };

      // Validate the photo
      const validationResult = await PhotoStorageService.validatePhoto(photoAsset);
      
      setUploadState(prev => ({
        ...prev,
        selectedPhoto: photoAsset,
        validationResult,
        isUploading: false,
        uploadProgress: 100,
      }));

      if (!validationResult.isValid) {
        setUploadState(prev => ({
          ...prev,
          error: validationResult.errors.join(', '),
        }));
      }
    } catch (error) {
      console.error('Failed to process photo:', error);
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: 'Failed to process photo. Please try again.',
      }));
    }
  };

  const handleRemovePhoto = () => {
    setUploadState(prev => ({
      ...prev,
      selectedPhoto: null,
      validationResult: null,
      error: null,
    }));
  };

  const handleRerunAnalysis = async () => {
    if (!uploadState.selectedPhoto || !design || uploadState.isUploading) return;

    if (!uploadState.validationResult?.isValid) {
      setUploadState(prev => ({
        ...prev,
        error: 'Please select a valid workspace photo before proceeding.',
      }));
      return;
    }

    onComplete(uploadState.selectedPhoto, design);
  };

  const handleClose = () => {
    if (!uploadState.isUploading) {
      onClose();
    }
  };

  const canProceed = uploadState.selectedPhoto && 
                   uploadState.validationResult?.isValid && 
                   !uploadState.isUploading;

  if (!design) return null;

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
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={[GlobalStyles.heading2, styles.title]}>
              Re-run Analysis
            </ThemedText>
            <ThemedText style={[GlobalStyles.bodyMedium, styles.subtitle]}>
              Upload a new photo to re-analyze &quot;{design.name}&quot;
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityLabel="Close re-run analysis"
          >
            <IconSymbol name="xmark" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
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
          {!uploadState.selectedPhoto ? (
            <>
              <ThemedText style={[GlobalStyles.bodyMedium, styles.instructions]}>
                Take a new photo or select one from your gallery to get updated recommendations 
                based on your current workspace setup.
              </ThemedText>

              {/* Upload Options */}
              <View style={styles.uploadOptions}>
                <TouchableOpacity
                  style={[GlobalStyles.compactButton, styles.uploadButton]}
                  onPress={handleTakePhoto}
                  disabled={uploadState.isUploading}
                >
                  <IconSymbol name="camera" size={20} color={Colors.white} />
                  <ThemedText style={[GlobalStyles.compactButtonText, styles.buttonText]}>
                    Take Photo
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[GlobalStyles.compactOutlineButton, styles.uploadButton]}
                  onPress={handleSelectFromGallery}
                  disabled={uploadState.isUploading}
                >
                  <IconSymbol name="photo" size={20} color={Colors.primary} />
                  <ThemedText style={[GlobalStyles.compactOutlineButtonText, styles.buttonText]}>
                    Choose from Gallery
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Upload Tips */}
              <UploadTips isExpanded={false} />
            </>
          ) : (
            <>
              {/* Photo Preview */}
              <PhotoPreview
                photo={uploadState.selectedPhoto}
                validationResult={uploadState.validationResult}
                onRemove={handleRemovePhoto}
                onRetake={handleTakePhoto}
              />

              {/* Comparison Note */}
              <View style={[GlobalStyles.card, styles.comparisonNote]}>
                <IconSymbol name="lightbulb" size={16} color={Colors.primary} />
                <ThemedText style={[GlobalStyles.bodySmall, styles.noteText]}>
                  Your new analysis will use the same style preferences from your original quiz, 
                  but with updated recommendations based on this new photo.
                </ThemedText>
              </View>
            </>
          )}

          {/* Error Message */}
          {uploadState.error && (
            <View style={styles.errorContainer}>
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color={Colors.error} />
              <ThemedText style={[GlobalStyles.bodySmall, styles.errorText]}>
                {uploadState.error}
              </ThemedText>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        {uploadState.selectedPhoto && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[GlobalStyles.compactOutlineButton, styles.backButton]}
              onPress={handleRemovePhoto}
              disabled={uploadState.isUploading}
            >
              <ThemedText style={GlobalStyles.compactOutlineButtonText}>
                Choose Different Photo
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                GlobalStyles.compactButton,
                styles.analyzeButton,
                !canProceed && styles.disabledButton,
              ]}
              onPress={handleRerunAnalysis}
              disabled={!canProceed}
            >
              <ThemedText style={[
                GlobalStyles.compactButtonText,
                !canProceed && styles.disabledButtonText,
              ]}>
                {uploadState.isUploading ? 'Processing...' : 'Re-run Analysis'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
    zIndex: 1100,
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xlarge,
    borderTopRightRadius: BorderRadius.xlarge,
    maxHeight: '90%',
    minHeight: '60%',
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    opacity: 0.7,
  },
  closeButton: {
    padding: Spacing.sm,
    marginTop: -Spacing.sm,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  instructions: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  uploadOptions: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  buttonText: {
    marginLeft: 0,
  },
  comparisonNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary + '10',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  noteText: {
    flex: 1,
    lineHeight: 18,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.error + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.small,
    marginVertical: Spacing.sm,
  },
  errorText: {
    color: Colors.error,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  backButton: {
    flex: 1,
  },
  analyzeButton: {
    flex: 2,
  },
  disabledButton: {
    backgroundColor: Colors.border,
  },
  disabledButtonText: {
    color: Colors.textLighter,
  },
});
