import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { QuizOption } from '@/types/quiz';

interface QuizOptionProps {
  option: QuizOption;
  isSelected: boolean;
  onSelect: (optionId: string) => void;
}

export function QuizOptionComponent({ option, isSelected, onSelect }: QuizOptionProps) {
  const handlePress = () => {
    onSelect(option.id);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected ? styles.selectedContainer : styles.unselectedContainer,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${option.label}. ${option.description || ''}`}
      accessibilityState={{ selected: isSelected }}
    >
      <View style={styles.content}>
        {/* Icon or Color Swatch */}
        <View style={styles.iconContainer}>
          {option.colorSwatch ? (
            <View style={styles.colorSwatchContainer}>
              {option.colorSwatch.slice(0, 4).map((color, index) => (
                <View
                  key={index}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    index === 0 && styles.colorSwatchFirst,
                    index === 1 && styles.colorSwatchSecond,
                    index === 2 && styles.colorSwatchThird,
                    index === 3 && styles.colorSwatchFourth,
                  ]}
                />
              ))}
            </View>
          ) : option.icon ? (
            <IconSymbol
              name={option.icon as any}
              size={24}
              color={isSelected ? Colors.primary : Colors.textLight}
            />
          ) : null}
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <ThemedText style={[
            GlobalStyles.heading3,
            isSelected ? styles.selectedText : styles.unselectedText,
          ]}>
            {option.label}
          </ThemedText>
          
          {option.description && (
            <ThemedText style={[
              GlobalStyles.bodySmall,
              styles.description,
              isSelected ? styles.selectedDescription : styles.unselectedDescription,
            ]}>
              {option.description}
            </ThemedText>
          )}
        </View>

        {/* Selection Indicator */}
        <View style={styles.selectionIndicator}>
          <View style={[
            styles.radioButton,
            isSelected ? styles.radioButtonSelected : styles.radioButtonUnselected,
          ]}>
            {isSelected && <View style={styles.radioButtonInner} />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.medium,
    borderWidth: 2,
  },
  selectedContainer: {
    backgroundColor: Colors.primaryLight + '10',
    borderColor: Colors.primary,
  },
  unselectedContainer: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  colorSwatchContainer: {
    width: 32,
    height: 32,
    position: 'relative',
  },
  colorSwatch: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  colorSwatchFirst: {
    top: 0,
    left: 0,
    zIndex: 4,
  },
  colorSwatchSecond: {
    top: 0,
    right: 0,
    zIndex: 3,
  },
  colorSwatchThird: {
    bottom: 0,
    left: 0,
    zIndex: 2,
  },
  colorSwatchFourth: {
    bottom: 0,
    right: 0,
    zIndex: 1,
  },
  textContainer: {
    flex: 1,
  },
  selectedText: {
    color: Colors.primary,
  },
  unselectedText: {
    color: Colors.text,
  },
  description: {
    marginTop: Spacing.xs,
  },
  selectedDescription: {
    color: Colors.primary,
    opacity: 0.8,
  },
  unselectedDescription: {
    color: Colors.textLight,
  },
  selectionIndicator: {
    marginLeft: Spacing.sm,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonUnselected: {
    borderColor: Colors.border,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
