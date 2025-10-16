import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { PhotoAsset, PhotoValidationResult } from '@/types/photo';

interface PhotoPreviewProps {
  photo: PhotoAsset;
  validationResult?: PhotoValidationResult | null;
  onRemove: () => void;
  onRetake?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const previewWidth = screenWidth - (Spacing.lg * 2);

export function PhotoPreview({ photo, validationResult, onRemove, onRetake }: PhotoPreviewProps) {
  const aspectRatio = photo.width / photo.height;
  const previewHeight = Math.min(previewWidth / aspectRatio, 300);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const hasErrors = validationResult && !validationResult.isValid;
  const hasWarnings = validationResult && validationResult.warnings.length > 0;

  return (
    <View style={styles.container}>
      {/* Photo Display */}
      <View style={[
        styles.imageContainer,
        hasErrors && styles.imageContainerError,
      ]}>
        <Image 
          source={{ uri: photo.uri }} 
          style={[
            styles.image,
            { width: previewWidth, height: previewHeight }
          ]}
          resizeMode="cover"
        />
        
        {/* Overlay Controls */}
        <View style={styles.overlay}>
          <TouchableOpacity
            style={[styles.overlayButton, styles.removeButton]}
            onPress={onRemove}
            accessibilityLabel="Remove photo"
          >
            <IconSymbol name="xmark" size={16} color={Colors.white} />
          </TouchableOpacity>
          
          {onRetake && (
            <TouchableOpacity
              style={[styles.overlayButton, styles.retakeButton]}
              onPress={onRetake}
              accessibilityLabel="Retake photo"
            >
              <IconSymbol name="camera" size={16} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Photo Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <ThemedText style={GlobalStyles.bodySmall}>
            {photo.width} × {photo.height} • {formatFileSize(photo.fileSize)}
          </ThemedText>
        </View>
        
        {photo.fileName && (
          <ThemedText style={[GlobalStyles.bodySmall, styles.fileName]}>
            {photo.fileName}
          </ThemedText>
        )}
      </View>

      {/* Validation Messages */}
      {validationResult && (
        <View style={styles.validationContainer}>
          {/* Errors */}
          {validationResult.errors.map((error, index) => (
            <View key={`error-${index}`} style={styles.validationItem}>
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color={Colors.error} />
              <ThemedText style={[GlobalStyles.bodySmall, styles.errorText]}>
                {error}
              </ThemedText>
            </View>
          ))}
          
          {/* Warnings */}
          {validationResult.warnings.map((warning, index) => (
            <View key={`warning-${index}`} style={styles.validationItem}>
              <IconSymbol name="info.circle.fill" size={16} color={Colors.warning} />
              <ThemedText style={[GlobalStyles.bodySmall, styles.warningText]}>
                {warning}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  imageContainer: {
    borderRadius: BorderRadius.medium,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.border,
  },
  imageContainerError: {
    borderWidth: 2,
    borderColor: Colors.error,
  },
  image: {
    backgroundColor: Colors.border,
  },
  overlay: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  overlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  removeButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
  },
  retakeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  infoContainer: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileName: {
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
  validationContainer: {
    marginTop: Spacing.sm,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  errorText: {
    color: Colors.error,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  warningText: {
    color: Colors.warning,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
});
