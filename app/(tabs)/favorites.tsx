import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

import { AIAnalysisModal } from '@/components/ai-analysis-modal';
import { DesignDetailModal } from '@/components/design-detail-modal';
import { RerunAnalysisModal } from '@/components/rerun-analysis-modal';
import { SafeAreaView } from '@/components/safe-area-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { AIAnalysisService } from '@/services/ai-analysis';
import { DesignStorageService } from '@/services/design-storage';
import { UsageTrackingService } from '@/services/usage-tracking';
import { AIAnalysisState } from '@/types/ai-analysis';
import { PhotoAsset } from '@/types/photo';
import { SavedDesign } from '@/types/storage';

export default function FavoritesScreen() {
  const params = useLocalSearchParams();
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<SavedDesign | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isRerunModalVisible, setIsRerunModalVisible] = useState(false);
  const [analysisState, setAnalysisState] = useState<AIAnalysisState>({
    isAnalyzing: false,
    progress: 0,
    currentStep: '',
    error: null,
    result: null,
  });

  // Load designs when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSavedDesigns();
    }, [])
  );

  // Handle showDesign parameter from navigation
  useEffect(() => {
    if (params.showDesign && savedDesigns.length > 0) {
      const designToShow = savedDesigns.find(d => d.id === params.showDesign);
      if (designToShow) {
        handleDesignPress(designToShow);
        // Clear the parameter to avoid showing modal again
        router.setParams({ showDesign: undefined });
      }
    }
  }, [params.showDesign, savedDesigns]);

  const loadSavedDesigns = async () => {
    try {
      const result = await DesignStorageService.getAllSavedDesigns();
      if (result.success) {
        setSavedDesigns(result.data!);
      } else {
        console.error('Failed to load saved designs:', result.error);
      }
    } catch (error) {
      console.error('Error loading saved designs:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadSavedDesigns();
    setIsRefreshing(false);
  };

  const handleToggleFavorite = async (designId: string) => {
    try {
      const result = await DesignStorageService.toggleFavorite(designId);
      if (result.success) {
        // Update local state
        setSavedDesigns(prev => 
          prev.map(design => 
            design.id === designId 
              ? { ...design, isFavorite: !design.isFavorite }
              : design
          )
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to update favorite status');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleDeleteDesign = async (designId: string, designName: string) => {
    Alert.alert(
      'Delete Design',
      `Are you sure you want to delete "${designName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await DesignStorageService.deleteDesign(designId);
              if (result.success) {
                setSavedDesigns(prev => prev.filter(design => design.id !== designId));
              } else {
                Alert.alert('Error', result.error || 'Failed to delete design');
              }
            } catch (error) {
              console.error('Error deleting design:', error);
              Alert.alert('Error', 'Failed to delete design');
            }
          },
        },
      ]
    );
  };

  const handleDesignPress = (design: SavedDesign) => {
    // Ensure no other modals are open
    setIsRerunModalVisible(false);
    setSelectedDesign(design);
    setIsDetailModalVisible(true);
  };

  const handleRerunAnalysis = async (design: SavedDesign) => {
    // Check usage limits before starting
    const canAnalyze = await UsageTrackingService.canPerformAnalysis();
    
    if (!canAnalyze.success || !canAnalyze.data) {
      Alert.alert(
        'Daily Limit Reached',
        `You've reached your daily limit of 5 AI analyses. Please try again tomorrow.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Ensure detail modal is closed first
    setIsDetailModalVisible(false);
    setSelectedDesign(design);
    setIsRerunModalVisible(true);
  };

  const handleRerunAnalysisComplete = async (photo: PhotoAsset, design: SavedDesign) => {
    setIsRerunModalVisible(false);
    
    // Start AI analysis with new photo but existing quiz responses
    setAnalysisState({
      isAnalyzing: true,
      progress: 0,
      currentStep: 'Initializing analysis...',
      error: null,
      result: null,
    });

    try {
      const result = await AIAnalysisService.analyzeWorkspace(
        { photo, quizResponses: design.quizResponses },
        (step: string, progress: number) => {
          setAnalysisState(prev => ({
            ...prev,
            currentStep: step,
            progress,
          }));
        }
      );

      // Analysis completed successfully
      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: false,
        progress: 100,
        result,
      }));

      // Navigate to results screen
      setTimeout(() => {
        setAnalysisState(prev => ({ ...prev, isAnalyzing: false }));
        router.push({
          pathname: '/results',
          params: {
            result: JSON.stringify(result),
            photo: JSON.stringify(photo),
            quizResponses: JSON.stringify(design.quizResponses)
          }
        });
      }, 1000);

    } catch (error) {
      console.error('Re-run analysis failed:', error);
      
      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Analysis failed. Please try again.',
      }));

      // Show error for a few seconds, then close
      setTimeout(() => {
        setAnalysisState(prev => ({ ...prev, error: null }));
      }, 3000);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderDesignItem = ({ item }: { item: SavedDesign }) => (
    <TouchableOpacity
      style={[GlobalStyles.card, styles.designCard]}
      onPress={() => handleDesignPress(item)}
      activeOpacity={0.7}
    >
      {/* Workspace Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.originalPhoto.uri }}
          style={styles.workspaceImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.designHeader}>
          <View style={styles.designInfo}>
            <ThemedText style={[GlobalStyles.cardTitle, styles.designName]}>
              {item.name}
            </ThemedText>
            <ThemedText style={[GlobalStyles.bodySmall, styles.designDate]}>
              {formatDate(item.createdAt)}
            </ThemedText>
          </View>
          <View style={styles.designActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleToggleFavorite(item.id);
              }}
              accessibilityLabel={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <IconSymbol
                name={item.isFavorite ? 'heart.fill' : 'heart'}
                size={20}
                color={item.isFavorite ? '#FF6B6B' : Colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteDesign(item.id, item.name);
              }}
              accessibilityLabel="Delete design"
            >
              <IconSymbol name="trash" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        <ThemedText style={[GlobalStyles.cardBody, styles.designSummary]} numberOfLines={2}>
          {item.analysisResult.summary}
        </ThemedText>
        
        <View style={styles.designStats}>
          <ThemedText style={[GlobalStyles.caption, styles.statText]}>
            {item.analysisResult.recommendations.length} recommendations
          </ThemedText>
          <ThemedText style={[GlobalStyles.caption, styles.statText]}>
            {item.analysisResult.ergonomicInsights.length} ergonomic insights
          </ThemedText>
        </View>
        
        {/* Tap to view indicator */}
        <View style={styles.tapIndicator}>
          <IconSymbol name="chevron.right" size={12} color={Colors.textLighter} />
          <ThemedText style={[GlobalStyles.bodySmall, styles.tapText]}>
            Tap to view details
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="heart" size={64} color={Colors.border} />
      <ThemedText style={[GlobalStyles.heading3, styles.emptyTitle]}>
        No saved designs yet
      </ThemedText>
      <ThemedText style={[GlobalStyles.bodyMedium, styles.emptyDescription]}>
        Start by analyzing your workspace on the Home tab to create your first design!
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']}>
      <View style={[styles.header, GlobalStyles.screenPadding]}>
        <ThemedText type="title" style={GlobalStyles.heading1}>
          Favorites
        </ThemedText>
        <ThemedText style={GlobalStyles.bodyMedium}>
          {savedDesigns.length === 0 
            ? 'Your saved workspace designs will appear here'
            : `${savedDesigns.length} saved design${savedDesigns.length === 1 ? '' : 's'}`
          }
        </ThemedText>
      </View>

      <FlatList
        data={savedDesigns}
        renderItem={renderDesignItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          GlobalStyles.screenPadding,
          savedDesigns.length === 0 && styles.emptyContainer
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Design Detail Modal */}
      <DesignDetailModal
        isVisible={isDetailModalVisible}
        design={selectedDesign}
        onClose={() => {
          setIsDetailModalVisible(false);
          setSelectedDesign(null);
        }}
        onRerunAnalysis={handleRerunAnalysis}
        onToggleFavorite={handleToggleFavorite}
        onDeleteDesign={handleDeleteDesign}
      />

      {/* Re-run Analysis Modal */}
      <RerunAnalysisModal
        isVisible={isRerunModalVisible}
        design={selectedDesign}
        onClose={() => {
          setIsRerunModalVisible(false);
          setSelectedDesign(null);
        }}
        onComplete={handleRerunAnalysisComplete}
      />

      {/* AI Analysis Progress Modal */}
      <AIAnalysisModal
        isVisible={analysisState.isAnalyzing}
        analysisState={analysisState}
        onCancel={() => {
          setAnalysisState(prev => ({ ...prev, isAnalyzing: false, error: null }));
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: Spacing.lg,
    lineHeight: 22,
  },
  designCard: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.border,
  },
  workspaceImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: Spacing.lg,
  },
  designHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  designInfo: {
    flex: 1,
  },
  designName: {
    marginBottom: 2,
  },
  designDate: {
    opacity: 0.7,
  },
  designActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  designSummary: {
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  designStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statText: {
    opacity: 0.7,
  },
  tapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.xs,
  },
  tapText: {
    opacity: 0.6,
    fontSize: 11,
  },
});
