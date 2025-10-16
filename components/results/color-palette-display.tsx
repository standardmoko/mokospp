import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { ColorPalette } from '@/types/ai-analysis';

interface ColorPaletteDisplayProps {
  colorPalette: ColorPalette;
}

export function ColorPaletteDisplay({ colorPalette }: ColorPaletteDisplayProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const getMoodIcon = (mood: string): string => {
    const moodIcons: Record<string, string> = {
      focus: 'target',
      creativity: 'paintbrush',
      calm: 'leaf',
      energizing: 'bolt',
    };
    return moodIcons[mood] || 'circle';
  };

  const getMoodColor = (mood: string): string => {
    const moodColors: Record<string, string> = {
      focus: Colors.secondary,
      creativity: Colors.primary,
      calm: Colors.success,
      energizing: Colors.warning,
    };
    return moodColors[mood] || Colors.textLight;
  };

  const copyColorToClipboard = async (color: string) => {
    try {
      await Clipboard.setStringAsync(color);
      setCopiedColor(color);
      
      // Clear the copied state after 2 seconds
      setTimeout(() => {
        setCopiedColor(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy color to clipboard:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText style={[GlobalStyles.heading3, styles.paletteName]}>
            {colorPalette.name}
          </ThemedText>
          <View style={styles.moodBadge}>
            <IconSymbol 
              name={getMoodIcon(colorPalette.mood)} 
              size={14} 
              color={getMoodColor(colorPalette.mood)} 
            />
            <ThemedText style={[
              GlobalStyles.bodySmall, 
              styles.moodText,
              { color: getMoodColor(colorPalette.mood) }
            ]}>
              {colorPalette.mood.charAt(0).toUpperCase() + colorPalette.mood.slice(1)}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Color Swatches */}
      <View style={styles.colorsContainer}>
        {colorPalette.colors.map((color, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.colorItem}
            onPress={() => copyColorToClipboard(color)}
            accessibilityLabel={`Copy color ${color} to clipboard`}
            accessibilityRole="button"
          >
            <View 
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                copiedColor === color && styles.copiedSwatch
              ]}
            >
              {copiedColor === color && (
                <View style={styles.copiedIndicator}>
                  <IconSymbol name="checkmark" size={16} color={Colors.white} />
                </View>
              )}
            </View>
            <ThemedText style={[
              GlobalStyles.bodySmall, 
              styles.colorCode,
              copiedColor === color && styles.copiedText
            ]}>
              {color.toUpperCase()}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <ThemedText style={[GlobalStyles.bodyMedium, styles.description]}>
          {colorPalette.description}
        </ThemedText>
      </View>

      {/* Usage Tips */}
      <View style={styles.tipsContainer}>
        <View style={styles.tipItem}>
          <IconSymbol name="lightbulb" size={16} color={Colors.warning} />
          <ThemedText style={[GlobalStyles.bodySmall, styles.tipText]}>
            Use these colors for accent walls, furniture, or decor items
          </ThemedText>
        </View>
        <View style={styles.tipItem}>
          <IconSymbol name="paintbrush" size={16} color={Colors.primary} />
          <ThemedText style={[GlobalStyles.bodySmall, styles.tipText]}>
            Tap any color swatch to copy its hex code to clipboard
          </ThemedText>
        </View>
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
  header: {
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paletteName: {
    flex: 1,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.small,
    gap: Spacing.xs,
  },
  moodText: {
    fontWeight: '600',
  },
  colorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  colorItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.medium,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  copiedSwatch: {
    borderColor: Colors.success,
    borderWidth: 2,
  },
  copiedIndicator: {
    position: 'absolute',
    backgroundColor: Colors.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCode: {
    fontFamily: 'monospace',
    fontWeight: '600',
    color: Colors.textLight,
    textAlign: 'center',
  },
  copiedText: {
    color: Colors.success,
    fontWeight: '700',
  },
  descriptionContainer: {
    marginBottom: Spacing.lg,
  },
  description: {
    lineHeight: 20,
    opacity: 0.8,
  },
  tipsContainer: {
    gap: Spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  tipText: {
    flex: 1,
    color: Colors.textLight,
    lineHeight: 18,
  },
});
