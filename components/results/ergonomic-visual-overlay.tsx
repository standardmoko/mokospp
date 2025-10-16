import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { ErgonomicInsight } from '@/types/ai-analysis';

interface ErgonomicVisualOverlayProps {
  insights: ErgonomicInsight[];
  imageWidth?: number;
  imageHeight?: number;
}

interface PosturePoint {
  x: number;
  y: number;
  status: 'good' | 'needs-improvement' | 'poor';
  category: string;
  label: string;
}

export function ErgonomicVisualOverlay({ 
  insights, 
  imageWidth = 300, 
  imageHeight = 200 
}: ErgonomicVisualOverlayProps) {
  
  // Generate posture points based on ergonomic insights
  const generatePosturePoints = (): PosturePoint[] => {
    const points: PosturePoint[] = [];
    
    insights.forEach((insight) => {
      let point: PosturePoint | null = null;
      
      switch (insight.category) {
        case 'desk-height':
          point = {
            x: imageWidth * 0.7, // Right side for desk
            y: imageHeight * 0.6,
            status: insight.status,
            category: insight.category,
            label: 'Desk'
          };
          break;
        case 'chair-posture':
          point = {
            x: imageWidth * 0.3, // Left side for chair
            y: imageHeight * 0.5,
            status: insight.status,
            category: insight.category,
            label: 'Chair'
          };
          break;
        case 'lighting':
          point = {
            x: imageWidth * 0.5, // Center top for lighting
            y: imageHeight * 0.2,
            status: insight.status,
            category: insight.category,
            label: 'Light'
          };
          break;
        case 'screen-position':
          point = {
            x: imageWidth * 0.6, // Center-right for screen
            y: imageHeight * 0.3,
            status: insight.status,
            category: insight.category,
            label: 'Screen'
          };
          break;
        case 'organization':
          point = {
            x: imageWidth * 0.8, // Far right for organization
            y: imageHeight * 0.4,
            status: insight.status,
            category: insight.category,
            label: 'Org'
          };
          break;
      }
      
      if (point) {
        points.push(point);
      }
    });
    
    return points;
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

  const posturePoints = generatePosturePoints();

  const renderPostureIndicator = (point: PosturePoint, index: number) => {
    const color = getStatusColor(point.status);
    const pulseRadius = point.status === 'poor' ? 18 : point.status === 'needs-improvement' ? 15 : 12;
    
    return (
      <React.Fragment key={`${point.category}-${index}`}>
        {/* Pulse animation circle for attention */}
        {point.status !== 'good' && (
          <Circle
            cx={point.x}
            cy={point.y}
            r={pulseRadius}
            fill={color}
            opacity="0.2"
          />
        )}
        
        {/* Main indicator circle */}
        <Circle
          cx={point.x}
          cy={point.y}
          r="8"
          fill={color}
          stroke={Colors.white}
          strokeWidth="2"
        />
        
        {/* Label background */}
        <Rect
          x={point.x - 15}
          y={point.y - 25}
          width="30"
          height="12"
          rx="6"
          fill={Colors.white}
          stroke={color}
          strokeWidth="1"
          opacity="0.9"
        />
        
        {/* Label text */}
        <SvgText
          x={point.x}
          y={point.y - 17}
          textAnchor="middle"
          fontSize="8"
          fill={color}
          fontWeight="600"
        >
          {point.label}
        </SvgText>
      </React.Fragment>
    );
  };

  const renderPostureLines = () => {
    // Draw connecting lines between related ergonomic points
    const lines: JSX.Element[] = [];
    
    const deskPoint = posturePoints.find(p => p.category === 'desk-height');
    const chairPoint = posturePoints.find(p => p.category === 'chair-posture');
    const screenPoint = posturePoints.find(p => p.category === 'screen-position');
    
    // Connect chair to desk (posture line)
    if (chairPoint && deskPoint) {
      lines.push(
        <Line
          key="chair-desk-line"
          x1={chairPoint.x}
          y1={chairPoint.y}
          x2={deskPoint.x}
          y2={deskPoint.y}
          stroke={Colors.textLighter}
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.5"
        />
      );
    }
    
    // Connect desk to screen (viewing angle line)
    if (deskPoint && screenPoint) {
      lines.push(
        <Line
          key="desk-screen-line"
          x1={deskPoint.x}
          y1={deskPoint.y}
          x2={screenPoint.x}
          y2={screenPoint.y}
          stroke={Colors.textLighter}
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.5"
        />
      );
    }
    
    return lines;
  };

  if (posturePoints.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText style={[GlobalStyles.bodySmall, styles.overlayTitle]}>
        Ergonomic Assessment Points
      </ThemedText>
      
      <View style={[styles.overlayContainer, { width: imageWidth, height: imageHeight }]}>
        <Svg width={imageWidth} height={imageHeight} style={styles.overlay}>
          {/* Connecting lines */}
          {renderPostureLines()}
          
          {/* Posture indicators */}
          {posturePoints.map(renderPostureIndicator)}
        </Svg>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.trafficGreen }]} />
          <ThemedText style={styles.legendText}>Good</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.trafficYellow }]} />
          <ThemedText style={styles.legendText}>Needs Improvement</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.trafficRed }]} />
          <ThemedText style={styles.legendText}>Poor</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  overlayTitle: {
    fontWeight: '600',
    marginBottom: Spacing.sm,
    color: Colors.textLight,
  },
  overlayContainer: {
    position: 'relative',
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: Colors.textLight,
  },
});
