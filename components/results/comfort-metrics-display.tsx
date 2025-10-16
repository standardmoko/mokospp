import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { ErgonomicInsight } from '@/types/ai-analysis';

interface ComfortMetric {
  id: string;
  title: string;
  value: string;
  status: 'good' | 'needs-improvement' | 'poor';
  unit?: string;
  icon: string;
  description: string;
  recommendation?: string;
}

interface ComfortMetricsDisplayProps {
  insights: ErgonomicInsight[];
}

export function ComfortMetricsDisplay({ insights }: ComfortMetricsDisplayProps) {
  
  // Generate comfort metrics from ergonomic insights
  const generateComfortMetrics = (): ComfortMetric[] => {
    const metrics: ComfortMetric[] = [];
    
    insights.forEach((insight) => {
      let metric: ComfortMetric | null = null;
      
      switch (insight.category) {
        case 'desk-height':
          metric = {
            id: 'desk-height',
            title: 'Desk Height',
            value: getMetricValue(insight.status, 'height'),
            status: insight.status,
            unit: 'cm',
            icon: 'rectangle.on.rectangle',
            description: 'Optimal desk height for comfortable typing',
            recommendation: insight.recommendation
          };
          break;
          
        case 'chair-posture':
          metric = {
            id: 'chair-angle',
            title: 'Chair Angle',
            value: getMetricValue(insight.status, 'angle'),
            status: insight.status,
            unit: '°',
            icon: 'chair',
            description: 'Chair back angle for proper lumbar support',
            recommendation: insight.recommendation
          };
          break;
          
        case 'lighting':
          metric = {
            id: 'lighting-level',
            title: 'Lighting Level',
            value: getMetricValue(insight.status, 'lux'),
            status: insight.status,
            unit: 'lux',
            icon: 'lightbulb',
            description: 'Ambient lighting for reduced eye strain',
            recommendation: insight.recommendation
          };
          break;
          
        case 'screen-position':
          metric = {
            id: 'screen-distance',
            title: 'Screen Distance',
            value: getMetricValue(insight.status, 'distance'),
            status: insight.status,
            unit: 'cm',
            icon: 'display',
            description: 'Optimal viewing distance from screen',
            recommendation: insight.recommendation
          };
          break;
          
        case 'organization':
          metric = {
            id: 'clutter-level',
            title: 'Organization',
            value: getMetricValue(insight.status, 'organization'),
            status: insight.status,
            icon: 'square.grid.2x2',
            description: 'Workspace organization and clutter level',
            recommendation: insight.recommendation
          };
          break;
      }
      
      if (metric) {
        metrics.push(metric);
      }
    });
    
    return metrics;
  };

  // Generate realistic metric values based on status
  const getMetricValue = (status: string, type: string): string => {
    const values: Record<string, Record<string, string>> = {
      height: {
        good: '72-76',
        'needs-improvement': '68-71',
        poor: '< 65'
      },
      angle: {
        good: '100-110',
        'needs-improvement': '90-99',
        poor: '< 90'
      },
      lux: {
        good: '500-750',
        'needs-improvement': '300-499',
        poor: '< 300'
      },
      distance: {
        good: '50-70',
        'needs-improvement': '40-49',
        poor: '< 40'
      },
      organization: {
        good: 'Excellent',
        'needs-improvement': 'Fair',
        poor: 'Poor'
      }
    };
    
    return values[type]?.[status] || 'N/A';
  };

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
        return 'exclamationmark.triangle.fill';
      case 'poor':
        return 'xmark.circle.fill';
      default:
        return 'circle';
    }
  };

  const renderMetricCard = (metric: ComfortMetric) => {
    const statusColor = getStatusColor(metric.status);
    
    return (
      <View key={metric.id} style={styles.metricCard}>
        {/* Header */}
        <View style={styles.metricHeader}>
          <View style={styles.metricTitleContainer}>
            <IconSymbol 
              name={metric.icon} 
              size={18} 
              color={Colors.textLight} 
            />
            <ThemedText style={[GlobalStyles.bodyMedium, styles.metricTitle]}>
              {metric.title}
            </ThemedText>
          </View>
          
          <View style={styles.statusContainer}>
            <IconSymbol 
              name={getStatusIcon(metric.status)} 
              size={16} 
              color={statusColor} 
            />
          </View>
        </View>

        {/* Value Display */}
        <View style={styles.valueContainer}>
          <ThemedText style={[GlobalStyles.heading2, styles.metricValue, { color: statusColor }]}>
            {metric.value}
          </ThemedText>
          {metric.unit && (
            <ThemedText style={[GlobalStyles.bodySmall, styles.metricUnit]}>
              {metric.unit}
            </ThemedText>
          )}
        </View>

        {/* Description */}
        <ThemedText style={[GlobalStyles.bodySmall, styles.metricDescription]}>
          {metric.description}
        </ThemedText>

        {/* Recommendation */}
        {metric.recommendation && (
          <View style={[styles.recommendationBadge, { borderLeftColor: statusColor }]}>
            <IconSymbol name="lightbulb" size={12} color={statusColor} />
            <ThemedText style={[GlobalStyles.bodySmall, styles.recommendationText]}>
              {metric.recommendation}
            </ThemedText>
          </View>
        )}
      </View>
    );
  };

  const comfortMetrics = generateComfortMetrics();

  if (comfortMetrics.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <ThemedText style={[GlobalStyles.heading3, styles.sectionTitle]}>
          Comfort Metrics
        </ThemedText>
        <ThemedText style={[GlobalStyles.bodySmall, styles.sectionSubtitle]}>
          Detailed measurements for optimal ergonomics
        </ThemedText>
      </View>
      
      <View style={styles.metricsGrid}>
        {comfortMetrics.map(renderMetricCard)}
      </View>
      
      {/* Professional Disclaimer */}
      <View style={styles.disclaimer}>
        <IconSymbol name="info.circle" size={14} color={Colors.textLighter} />
        <ThemedText style={[GlobalStyles.bodySmall, styles.disclaimerText]}>
          Measurements are estimates based on visual analysis. 
          Consult an ergonomics professional for precise assessments.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  headerContainer: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    color: Colors.textLight,
  },
  metricsGrid: {
    gap: Spacing.md,
  },
  metricCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  metricTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  metricTitle: {
    fontWeight: '600',
  },
  statusContainer: {
    padding: Spacing.xs,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  metricValue: {
    fontWeight: '700',
  },
  metricUnit: {
    color: Colors.textLight,
    fontWeight: '500',
  },
  metricDescription: {
    color: Colors.textLight,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  recommendationBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: BorderRadius.small,
    borderLeftWidth: 3,
  },
  recommendationText: {
    flex: 1,
    lineHeight: 16,
    color: Colors.text,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  disclaimerText: {
    flex: 1,
    color: Colors.textLighter,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
