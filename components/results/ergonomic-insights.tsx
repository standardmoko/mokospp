import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ComfortMetricsDisplay } from '@/components/results/comfort-metrics-display';
import { ErgonomicVisualOverlay } from '@/components/results/ergonomic-visual-overlay';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { ErgonomicInsight } from '@/types/ai-analysis';

interface ErgonomicInsightsProps {
  insights: ErgonomicInsight[];
}

export function ErgonomicInsights({ insights }: ErgonomicInsightsProps) {
  const [showDetailedView, setShowDetailedView] = useState(false);
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'good':
        return Colors.trafficGreen;
      case 'needs-improvement':
        return Colors.trafficYellow;
      case 'poor':
        return Colors.trafficRed;
      default:
        return Colors.textLighter;
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'good':
        return 'checkmark.circle.fill';
      case 'needs-improvement':
        return 'exclamationmark.circle.fill';
      case 'poor':
        return 'xmark.circle.fill';
      default:
        return 'circle';
    }
  };

  const getCategoryIcon = (category: string): string => {
    const categoryIcons: Record<string, string> = {
      'desk-height': 'rectangle.on.rectangle',
      'chair-posture': 'chair',
      'lighting': 'lightbulb',
      'screen-position': 'display',
      'organization': 'square.grid.2x2',
    };
    return categoryIcons[category] || 'square.grid.2x2';
  };

  const renderInsightCard = (insight: ErgonomicInsight, index: number) => {
    const statusColor = getStatusColor(insight.status);
    
    return (
      <View key={index} style={styles.insightCard}>
        {/* Header */}
        <View style={styles.insightHeader}>
          <View style={styles.categoryInfo}>
            <IconSymbol 
              name={getCategoryIcon(insight.category)} 
              size={20} 
              color={Colors.textLight} 
            />
            <ThemedText style={[GlobalStyles.heading3, styles.insightTitle]}>
              {insight.title}
            </ThemedText>
          </View>
          
          {/* Enhanced Traffic Light Indicator */}
          <View style={[
            styles.enhancedStatusBadge,
            { 
              backgroundColor: statusColor + '15',
              borderColor: statusColor + '40'
            }
          ]}>
            <View style={[
              styles.trafficLightDot,
              { backgroundColor: statusColor }
            ]} />
            <IconSymbol 
              name={getStatusIcon(insight.status)} 
              size={14} 
              color={statusColor} 
            />
          </View>
        </View>

        {/* Status Label */}
        <View style={styles.statusLabelContainer}>
          <ThemedText style={[
            GlobalStyles.bodySmall, 
            styles.statusLabel,
            { color: statusColor }
          ]}>
            {insight.status.replace('-', ' ').toUpperCase()}
          </ThemedText>
        </View>

        {/* Description */}
        <ThemedText style={[GlobalStyles.bodyMedium, styles.insightDescription]}>
          {insight.description}
        </ThemedText>

        {/* Recommendation */}
        {insight.recommendation && (
          <View style={[
            styles.recommendationContainer,
            { borderLeftColor: statusColor }
          ]}>
            <View style={styles.recommendationHeader}>
              <IconSymbol name="lightbulb" size={14} color={statusColor} />
              <ThemedText style={[
                GlobalStyles.bodySmall, 
                styles.recommendationLabel,
                { color: statusColor }
              ]}>
                Recommendation
              </ThemedText>
            </View>
            <ThemedText style={[GlobalStyles.bodyMedium, styles.recommendationText]}>
              {insight.recommendation}
            </ThemedText>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="checkmark.circle" size={32} color={Colors.success} />
      <ThemedText style={[GlobalStyles.bodyLarge, styles.emptyTitle]}>
        No Issues Found
      </ThemedText>
      <ThemedText style={[GlobalStyles.bodyMedium, styles.emptyMessage]}>
        Your workspace setup looks great! No ergonomic concerns were identified.
      </ThemedText>
    </View>
  );

  if (!insights || insights.length === 0) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      {/* Header with Toggle */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <ThemedText style={[GlobalStyles.heading3, styles.sectionTitle]}>
            Ergonomic Assessment
          </ThemedText>
          <ThemedText style={[GlobalStyles.bodySmall, styles.sectionSubtitle]}>
            Workspace comfort and health analysis
          </ThemedText>
        </View>
        
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setShowDetailedView(!showDetailedView)}
          accessibilityLabel={showDetailedView ? "Show simple view" : "Show detailed view"}
        >
          <IconSymbol 
            name={showDetailedView ? "list.bullet" : "chart.bar"} 
            size={16} 
            color={Colors.primary} 
          />
          <ThemedText style={[GlobalStyles.bodySmall, styles.toggleText]}>
            {showDetailedView ? 'Simple' : 'Detailed'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        {['good', 'needs-improvement', 'poor'].map((status) => {
          const count = insights.filter(insight => insight.status === status).length;
          if (count === 0) return null;
          
          return (
            <View key={status} style={styles.summaryItem}>
              <View style={[
                styles.summaryDot,
                { backgroundColor: getStatusColor(status) }
              ]} />
              <IconSymbol 
                name={getStatusIcon(status)} 
                size={16} 
                color={getStatusColor(status)} 
              />
              <ThemedText style={[GlobalStyles.bodySmall, styles.summaryText]}>
                {count} {status.replace('-', ' ')}
              </ThemedText>
            </View>
          );
        })}
      </View>

      {/* Visual Overlay (Detailed View Only) */}
      {showDetailedView && (
        <ErgonomicVisualOverlay 
          insights={insights}
          imageWidth={280}
          imageHeight={180}
        />
      )}

      {/* Insights List */}
      <View style={styles.insightsList}>
        {insights.map(renderInsightCard)}
      </View>

      {/* Comfort Metrics (Detailed View Only) */}
      {showDetailedView && (
        <ComfortMetricsDisplay insights={insights} />
      )}

      {/* Footer Note */}
      <View style={styles.footerNote}>
        <IconSymbol name="info.circle" size={14} color={Colors.textLighter} />
        <ThemedText style={[GlobalStyles.bodySmall, styles.footerText]}>
          These assessments are based on general ergonomic principles. 
          Consult a professional for personalized advice.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    color: Colors.textLight,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.small,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  toggleText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryText: {
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  insightsList: {
    gap: Spacing.md,
  },
  insightCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.small,
    padding: Spacing.md,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  insightTitle: {
    flex: 1,
  },
  enhancedStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
  },
  trafficLightDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabelContainer: {
    marginBottom: Spacing.sm,
  },
  statusLabel: {
    fontWeight: '600',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  insightDescription: {
    marginBottom: Spacing.sm,
    lineHeight: 20,
    opacity: 0.8,
  },
  recommendationContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.small,
    padding: Spacing.sm,
    borderLeftWidth: 3,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  recommendationLabel: {
    fontWeight: '600',
  },
  recommendationText: {
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    fontWeight: '600',
    color: Colors.success,
  },
  emptyMessage: {
    textAlign: 'center',
    color: Colors.textLight,
    lineHeight: 20,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    flex: 1,
    color: Colors.textLighter,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
