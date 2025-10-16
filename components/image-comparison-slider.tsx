import React from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    clamp,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';

import { BorderRadius, Colors, GlobalStyles, Spacing } from '@/constants/globalStyles';
import { ThemedText } from './themed-text';

interface ImageComparisonSliderProps {
  beforeImage: any; // Image source
  afterImage: any; // Image source
  width?: number;
  height?: number;
  initialPosition?: number; // 0-1, where 0.5 is center
}

const { width: screenWidth } = Dimensions.get('window');

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  width = screenWidth - (Spacing.md * 2),
  height = 200,
  initialPosition = 0.5,
}: ImageComparisonSliderProps) {
  const sliderPosition = useSharedValue(initialPosition * width);
  const offset = useSharedValue(initialPosition * width);

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      sliderPosition.value = clamp(offset.value + event.translationX, 0, width);
    })
    .onFinalize(() => {
      offset.value = sliderPosition.value;
    });

  const beforeImageStyle = useAnimatedStyle(() => ({
    width: sliderPosition.value,
  }));

  const sliderLineStyle = useAnimatedStyle(() => ({
    left: sliderPosition.value - 2,
  }));

  const sliderHandleStyle = useAnimatedStyle(() => ({
    left: sliderPosition.value - 15,
  }));

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Labels */}
      <View style={styles.labelsContainer}>
        <ThemedText style={styles.label}>Before</ThemedText>
        <ThemedText style={styles.label}>After</ThemedText>
      </View>

      {/* Image Container */}
      <View style={[styles.imageContainer, { width, height }]}>
        {/* After Image (Background) */}
        <Image
          source={afterImage}
          style={[styles.image, { width, height }]}
          resizeMode="cover"
        />

        {/* Before Image (Clipped) */}
        <Animated.View style={[styles.beforeImageContainer, beforeImageStyle, { height }]}>
          <Image
            source={beforeImage}
            style={[styles.image, { width, height }]}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Slider Line */}
        <Animated.View style={[styles.sliderLine, sliderLineStyle, { height }]} />

        {/* Slider Handle */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sliderHandle, sliderHandleStyle]}>
            <View style={styles.handleIcon}>
              <View style={styles.handleArrow} />
              <View style={[styles.handleArrow, styles.handleArrowRight]} />
            </View>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Instruction Text */}
      <ThemedText style={styles.instructionText}>
        Drag to compare before and after
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  label: {
    ...GlobalStyles.bodySmall,
    fontWeight: '600',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: BorderRadius.medium,
    overflow: 'hidden',
    backgroundColor: Colors.border,
    elevation: 4,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  beforeImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    zIndex: 1,
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    width: 4,
    backgroundColor: Colors.white,
    zIndex: 2,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  sliderHandle: {
    position: 'absolute',
    top: '50%',
    width: 30,
    height: 30,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.round,
    zIndex: 3,
    marginTop: -15, // Center vertically
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  handleIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handleArrow: {
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderRightWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: Colors.textLight,
  },
  handleArrowRight: {
    borderRightWidth: 0,
    borderLeftWidth: 6,
    borderLeftColor: Colors.textLight,
    marginLeft: 2,
  },
  instructionText: {
    ...GlobalStyles.caption,
    marginTop: Spacing.sm,
    color: Colors.textLighter,
    textAlign: 'center',
  },
});
