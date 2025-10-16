import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { SavedDesign } from '@/types/storage';

interface RecentActivityProps {
  hasRecentActivity?: boolean;
  recentDesigns?: SavedDesign[];
  onDesignPress?: (design: SavedDesign) => void;
}

export function RecentActivity({ 
  hasRecentActivity = false, 
  recentDesigns = [],
  onDesignPress 
}: RecentActivityProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <ThemedText style={[GlobalStyles.heading3, styles.title]}>
        Recent Activity
      </ThemedText>
      
      <View style={[GlobalStyles.card, styles.activityCard]}>
        {hasRecentActivity && recentDesigns.length > 0 ? (
          <View>
            <ThemedText style={GlobalStyles.cardTitle}>
              Recent Workspace Designs
            </ThemedText>
            {recentDesigns.slice(0, 3).map((design, index) => (
              <TouchableOpacity
                key={design.id}
                style={[styles.designItem, index > 0 && styles.designItemBorder]}
                onPress={() => onDesignPress?.(design)}
                accessibilityLabel={`View design: ${design.name}`}
              >
                {/* Workspace Image Thumbnail */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: design.originalPhoto.uri }}
                    style={styles.workspaceImage}
                    resizeMode="cover"
                  />
                </View>
                
                <View style={styles.designInfo}>
                  <ThemedText style={[GlobalStyles.bodyMedium, styles.designName]}>
                    {design.name}
                  </ThemedText>
                  <ThemedText style={[GlobalStyles.bodySmall, styles.designDate]}>
                    {formatDate(design.createdAt)}
                  </ThemedText>
                </View>
                {design.isFavorite && (
                  <ThemedText style={styles.favoriteIcon}>♥</ThemedText>
                )}
              </TouchableOpacity>
            ))}
            {recentDesigns.length > 3 && (
              <ThemedText style={[GlobalStyles.bodySmall, styles.moreText]}>
                +{recentDesigns.length - 3} more designs in Favorites
              </ThemedText>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <ThemedText style={[GlobalStyles.bodyMedium, styles.emptyText]}>
              No recent activity yet
            </ThemedText>
            <ThemedText style={[GlobalStyles.bodySmall, styles.emptySubtext]}>
              Start by analyzing your workspace to see your design history here.
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.md,
  },
  activityCard: {
    minHeight: 80,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
  },
  designItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  designItemBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.small,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  workspaceImage: {
    width: '100%',
    height: '100%',
  },
  designInfo: {
    flex: 1,
  },
  designName: {
    fontWeight: '500',
    marginBottom: 2,
  },
  designDate: {
    opacity: 0.7,
  },
  favoriteIcon: {
    color: '#FF6B6B',
    fontSize: 16,
    marginLeft: Spacing.sm,
  },
  moreText: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
