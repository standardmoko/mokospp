import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalysisSummary } from '@/components/results/analysis-summary';
import { ColorPaletteDisplay } from '@/components/results/color-palette-display';
import { ErgonomicInsights } from '@/components/results/ergonomic-insights';
import { RecommendationCarousel } from '@/components/results/recommendation-carousel';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing, Typography } from '@/constants/globalStyles';
import { SavedDesign } from '@/types/storage';

interface DesignDetailModalProps {
  isVisible: boolean;
  design: SavedDesign | null;
  onClose: () => void;
  onRerunAnalysis: (design: SavedDesign) => void;
  onToggleFavorite: (designId: string) => void;
  onDeleteDesign: (designId: string, designName: string) => void;
}

export function DesignDetailModal({
  isVisible,
  design,
  onClose,
  onRerunAnalysis,
  onToggleFavorite,
  onDeleteDesign,
}: DesignDetailModalProps) {
  const insets = useSafeAreaInsets();
  
  if (!design) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRerunAnalysis = () => {
    onClose();
    onRerunAnalysis(design);
  };

  const handleToggleFavorite = () => {
    onToggleFavorite(design.id);
  };

  const handleDeleteDesign = () => {
    Alert.alert(
      'Delete Design',
      `Are you sure you want to delete "${design.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onClose();
            onDeleteDesign(design.id, design.name);
          },
        },
      ]
    );
  };

  const handleViewFullResults = () => {
    onClose();
    router.push({
      pathname: '/results',
      params: {
        result: JSON.stringify(design.analysisResult),
        photo: JSON.stringify(design.originalPhoto),
        quizResponses: JSON.stringify(design.quizResponses)
      },
    });
  };

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
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={[GlobalStyles.heading2, styles.title]} numberOfLines={2}>
              {design.name}
            </ThemedText>
            <ThemedText style={[GlobalStyles.bodySmall, styles.date]}>
              Created {formatDate(design.createdAt)}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close design details"
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
          {/* Analysis Summary */}
          <AnalysisSummary 
            summary={design.analysisResult.summary}
            styleMatch={design.analysisResult.styleMatch}
            processingTime={design.analysisResult.processingTime}
          />

          {/* Quick Stats */}
          <View style={[GlobalStyles.card, styles.statsCard]}>
            <ThemedText style={[GlobalStyles.heading3, styles.sectionTitle]}>
              Analysis Overview
            </ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText style={GlobalStyles.bodyLarge}>
                  {design.analysisResult.recommendations.length}
                </ThemedText>
                <ThemedText style={[GlobalStyles.caption, styles.statLabel]}>
                  Recommendations
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={GlobalStyles.bodyLarge}>
                  {design.analysisResult.ergonomicInsights.length}
                </ThemedText>
                <ThemedText style={[GlobalStyles.caption, styles.statLabel]}>
                  Ergonomic Insights
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={GlobalStyles.bodyLarge}>
                  {Math.round(design.analysisResult.styleMatch.confidence * 100)}%
                </ThemedText>
                <ThemedText style={[GlobalStyles.caption, styles.statLabel]}>
                  Style Match
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Product Recommendations Preview */}
          <View style={styles.section}>
            <ThemedText style={[GlobalStyles.heading3, styles.sectionTitle]}>
              Top Recommendations
            </ThemedText>
            <RecommendationCarousel 
              recommendations={design.analysisResult.recommendations.slice(0, 3)} 
            />
            {design.analysisResult.recommendations.length > 3 && (
              <TouchableOpacity
                style={[GlobalStyles.outlineButton, styles.viewAllButton]}
                onPress={handleViewFullResults}
              >
                <ThemedText style={GlobalStyles.outlineButtonText}>
                  View All {design.analysisResult.recommendations.length} Recommendations
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Color Palette */}
          {design.analysisResult.colorPalette && (
            <View style={styles.section}>
              <ThemedText style={[GlobalStyles.heading3, styles.sectionTitle]}>
                Color Palette
              </ThemedText>
              <ColorPaletteDisplay colorPalette={design.analysisResult.colorPalette} />
            </View>
          )}

          {/* Ergonomic Insights Preview */}
          <View style={styles.section}>
            <ThemedText style={[GlobalStyles.heading3, styles.sectionTitle]}>
              Ergonomic Assessment
            </ThemedText>
            <ErgonomicInsights insights={design.analysisResult.ergonomicInsights} />
          </View>

          {/* Tags */}
          {design.tags.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={[GlobalStyles.heading3, styles.sectionTitle]}>
                Tags
              </ThemedText>
              <View style={styles.tagsContainer}>
                {design.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <ThemedText style={styles.tagText}>{tag}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Notes */}
          {design.notes && (
            <View style={styles.section}>
              <ThemedText style={[GlobalStyles.heading3, styles.sectionTitle]}>
                Notes
              </ThemedText>
              <View style={[GlobalStyles.card, styles.notesCard]}>
                <ThemedText style={GlobalStyles.bodyMedium}>
                  {design.notes}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[GlobalStyles.compactOutlineButton, styles.actionButton]}
            onPress={handleRerunAnalysis}
          >
            <IconSymbol name="arrow.clockwise" size={14} color={Colors.primary} />
            <ThemedText style={[GlobalStyles.compactOutlineButtonText, styles.buttonText]}>
              Re-run Analysis
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[GlobalStyles.compactOutlineButton, styles.actionButton]}
            onPress={handleToggleFavorite}
          >
            <IconSymbol
              name={design.isFavorite ? 'heart.fill' : 'heart'}
              size={14}
              color={design.isFavorite ? '#FF6B6B' : Colors.primary}
            />
            <ThemedText style={[GlobalStyles.compactOutlineButtonText, styles.buttonText]}>
              {design.isFavorite ? 'Unfavorite' : 'Favorite'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, styles.actionButton]}
            onPress={handleDeleteDesign}
          >
            <IconSymbol name="trash" size={14} color={Colors.error} />
            <ThemedText style={[styles.deleteButtonText, styles.buttonText]}>
              Delete
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
    zIndex: 1000,
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xlarge,
    borderTopRightRadius: BorderRadius.xlarge,
    maxHeight: '95%',
    minHeight: '70%',
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
  date: {
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
    paddingTop: Spacing.lg,
    paddingBottom: 120, // Extra padding for footer buttons
    flexGrow: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  statsCard: {
    marginBottom: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    marginTop: 2,
    opacity: 0.7,
  },
  viewAllButton: {
    marginTop: Spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.small,
  },
  tagText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  notesCard: {
    backgroundColor: Colors.background,
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  buttonText: {
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.error,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  deleteButtonText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.bodyMedium,
    fontWeight: Typography.weights.semibold,
    color: Colors.error,
  },
});
