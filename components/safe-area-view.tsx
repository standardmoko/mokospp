import React from 'react';
import { RefreshControl, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView as RNSafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/globalStyles';

interface SafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  mode?: 'padding' | 'margin';
}

/**
 * SafeAreaView component that provides safe area handling with customizable options
 * 
 * @param children - Child components to render
 * @param style - Additional styles to apply
 * @param backgroundColor - Background color (defaults to theme background)
 * @param edges - Which edges to apply safe area to (defaults to all)
 * @param mode - Whether to use padding or margin for safe area (defaults to padding)
 */
export function SafeAreaView({ 
  children, 
  style, 
  backgroundColor = Colors.background,
  edges = ['top', 'bottom', 'left', 'right'],
  mode = 'padding'
}: SafeAreaViewProps) {
  return (
    <RNSafeAreaView 
      style={[
        styles.container, 
        { backgroundColor },
        style
      ]}
      edges={edges}
      mode={mode}
    >
      {children}
    </RNSafeAreaView>
  );
}

/**
 * SafeAreaScrollView - A ScrollView wrapper with safe area handling
 */
interface SafeAreaScrollViewProps extends SafeAreaViewProps {
  contentContainerStyle?: ViewStyle | ViewStyle[];
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  refreshControl?: React.ReactElement<RefreshControl>;
}

export function SafeAreaScrollView({ 
  children, 
  style, 
  contentContainerStyle,
  backgroundColor = Colors.background,
  edges = ['top', 'bottom', 'left', 'right'],
  showsVerticalScrollIndicator = false,
  showsHorizontalScrollIndicator = false,
  refreshControl,
  ...props 
}: SafeAreaScrollViewProps) {
  const { ScrollView } = require('react-native');
  
  return (
    <SafeAreaView 
      style={style} 
      backgroundColor={backgroundColor} 
      edges={edges}
      {...props}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * SafeAreaInsets hook wrapper for easy access to safe area insets
 */
export function useSafeArea() {
  return useSafeAreaInsets();
}

/**
 * SafeAreaPadding - A View component that applies safe area as padding
 */
interface SafeAreaPaddingProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  backgroundColor?: string;
}

export function SafeAreaPadding({ 
  children, 
  style, 
  edges = ['top', 'bottom'],
  backgroundColor = 'transparent'
}: SafeAreaPaddingProps) {
  const insets = useSafeAreaInsets();
  
  const paddingStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
    backgroundColor,
  };

  return (
    <View style={[paddingStyle, style]}>
      {children}
    </View>
  );
}

/**
 * SafeAreaMargin - A View component that applies safe area as margin
 */
interface SafeAreaMarginProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function SafeAreaMargin({ 
  children, 
  style, 
  edges = ['top', 'bottom']
}: SafeAreaMarginProps) {
  const insets = useSafeAreaInsets();
  
  const marginStyle = {
    marginTop: edges.includes('top') ? insets.top : 0,
    marginBottom: edges.includes('bottom') ? insets.bottom : 0,
    marginLeft: edges.includes('left') ? insets.left : 0,
    marginRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View style={[marginStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
