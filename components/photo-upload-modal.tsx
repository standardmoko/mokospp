import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

import { PhotoPreview } from '@/components/photo-preview';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UploadTips } from '@/components/upload-tips';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { PhotoStorageService } from '@/services/photo-storage';
import { PhotoAsset, PhotoUploadState } from '@/types/photo';
import { QuizResponse } from '@/types/quiz';

interface PhotoUploadModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (photo: PhotoAsset, quizResponses?: QuizResponse[]) => void;
  quizResponses?: QuizResponse[];
}

export function PhotoUploadModal({ 
  isVisible, 
  onClose, 
  onComplete, 
  quizResponses 
}: PhotoUploadModalProps) {
  const [uploadState, setUploadState] = useState<PhotoUploadState>({
    selectedPhoto: null,
    isUploading: false,
    uploadProgress: 0,
    error: null,
    validationResult: null,
  });

  // Request permissions when modal opens
  useEffect(() => {
    if (isVisible) {
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
    try {
      setUploadState(prev => ({ ...prev, isUploading: true, error: null }));

      // Get additional photo info
      const photoInfo = await PhotoStorageService.getPhotoInfo(asset.uri);
      
      const photo: PhotoAsset = {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: 'image',
        fileSize: photoInfo.fileSize,
        fileName: photoInfo.fileName,
        mimeType: asset.mimeType,
      };

      // Validate photo
      const validationResult = PhotoStorageService.validatePhoto(photo);

      setUploadState(prev => ({
        ...prev,
        selectedPhoto: photo,
        validationResult,
        isUploading: false,
      }));
    } catch (error) {
      console.error('Failed to process photo:', error);
      setUploadState(prev => ({
        ...prev,
        error: 'Failed to process photo. Please try again.',
        isUploading: false,
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

  const handleAnalyzeWorkspace = async () => {
    if (!uploadState.selectedPhoto) return;

    try {
      setUploadState(prev => ({ ...prev, isUploading: true, error: null }));

      // Save photo to app storage
      const savedPhotoUri = await PhotoStorageService.savePhoto(uploadState.selectedPhoto.uri);
      
      // Clean up old photos
      await PhotoStorageService.cleanupOldPhotos();

      const finalPhoto: PhotoAsset = {
        ...uploadState.selectedPhoto,
        uri: savedPhotoUri,
      };

      onComplete(finalPhoto, quizResponses);
      handleClose();
    } catch (error) {
      console.error('Failed to save photo:', error);
      setUploadState(prev => ({
        ...prev,
        error: 'Failed to save photo. Please try again.',
        isUploading: false,
      }));
    }
  };

  const handleClose = () => {
    setUploadState({
      selectedPhoto: null,
      isUploading: false,
      uploadProgress: 0,
      error: null,
      validationResult: null,
    });
    onClose();
  };

  const canProceed = uploadState.selectedPhoto && 
                   uploadState.validationResult?.isValid && 
                   !uploadState.isUploading;

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
          <ThemedText style={[GlobalStyles.heading2, styles.title]}>
            Upload Workspace Photo
          </ThemedText>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityLabel="Close photo upload"
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
              {/* Instructions */}
              <ThemedText style={[GlobalStyles.bodyLarge, styles.instructions]}>
                Take a photo of your current workspace
              </ThemedText>

              {/* Upload Options */}
              <View style={styles.uploadOptions}>
                <TouchableOpacity
                  style={[GlobalStyles.primaryButton, styles.uploadButton]}
                  onPress={handleTakePhoto}
                  disabled={uploadState.isUploading}
                >
                  <IconSymbol name="camera" size={24} color={Colors.white} />
                  <ThemedText style={[GlobalStyles.primaryButtonText, styles.buttonText]}>
                    Take Photo
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[GlobalStyles.secondaryButton, styles.uploadButton]}
                  onPress={handleSelectFromGallery}
                  disabled={uploadState.isUploading}
                >
                  <IconSymbol name="photo" size={24} color={Colors.white} />
                  <ThemedText style={[GlobalStyles.secondaryButtonText, styles.buttonText]}>
                    Choose from Gallery
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Upload Tips */}
              <UploadTips />
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
              onPress={handleAnalyzeWorkspace}
              disabled={!canProceed}
            >
              <ThemedText style={[
                GlobalStyles.compactButtonText,
                !canProceed && styles.disabledButtonText,
              ]}>
                {uploadState.isUploading ? 'Processing...' : 'Analyze My Workspace'}
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
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xlarge,
    borderTopRightRadius: BorderRadius.xlarge,
    maxHeight: '95%',
    minHeight: '75%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
  instructions: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
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
