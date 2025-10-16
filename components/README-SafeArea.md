# Safe Area Components

This directory contains reusable safe area components that provide consistent safe area handling across the Home Harmony app.

## Overview

The safe area system is built on top of `react-native-safe-area-context` and provides a global solution for handling device safe areas (notches, status bars, home indicators, etc.).

## Components

### SafeAreaView
The main safe area container component.

```tsx
import { SafeAreaView } from '@/components/safe-area-view';

<SafeAreaView>
  <YourContent />
</SafeAreaView>
```

**Props:**
- `children`: React nodes to render
- `style`: Additional styles
- `backgroundColor`: Background color (defaults to theme background)
- `edges`: Which edges to apply safe area to (defaults to all)
- `mode`: 'padding' or 'margin' (defaults to 'padding')

### SafeAreaScrollView
A ScrollView wrapper with built-in safe area handling.

```tsx
import { SafeAreaScrollView } from '@/components/safe-area-view';

<SafeAreaScrollView contentContainerStyle={styles.content}>
  <YourScrollableContent />
</SafeAreaScrollView>
```

**Props:**
- All SafeAreaView props
- `contentContainerStyle`: Styles for scroll content
- `showsVerticalScrollIndicator`: Show/hide scroll indicators

### SafeAreaPadding
Applies safe area as padding to child components.

```tsx
import { SafeAreaPadding } from '@/components/safe-area-view';

<SafeAreaPadding edges={['top', 'bottom']}>
  <YourContent />
</SafeAreaPadding>
```

### SafeAreaMargin
Applies safe area as margin to child components.

```tsx
import { SafeAreaMargin } from '@/components/safe-area-view';

<SafeAreaMargin edges={['top']}>
  <YourContent />
</SafeAreaMargin>
```

### useSafeArea Hook
Access safe area insets directly in your components.

```tsx
import { useSafeArea } from '@/components/safe-area-view';

function MyComponent() {
  const insets = useSafeArea();
  
  return (
    <View style={{ paddingTop: insets.top }}>
      <YourContent />
    </View>
  );
}
```

## Global Setup

The app is wrapped with `SafeAreaProvider` in `app/_layout.tsx`, providing safe area context to all screens.

## Usage Guidelines

1. **Use SafeAreaScrollView for scrollable screens** - Most tab screens should use this
2. **Use SafeAreaView for non-scrollable screens** - Simple containers or modal content
3. **Use SafeAreaPadding/SafeAreaMargin for specific components** - When you need fine-grained control
4. **Use useSafeArea hook for custom implementations** - When building custom layouts

## Examples

### Tab Screen (Scrollable)
```tsx
export default function MyTabScreen() {
  return (
    <SafeAreaScrollView>
      <View style={styles.header}>
        <ThemedText>My Screen</ThemedText>
      </View>
      <View style={styles.content}>
        {/* Your content */}
      </View>
    </SafeAreaScrollView>
  );
}
```

### Modal or Simple Screen
```tsx
export default function MyModalScreen() {
  return (
    <SafeAreaView>
      <View style={styles.header}>
        <ThemedText>Modal Title</ThemedText>
      </View>
      <View style={styles.content}>
        {/* Your content */}
      </View>
    </SafeAreaView>
  );
}
```

### Custom Safe Area Usage
```tsx
function CustomHeader() {
  const insets = useSafeArea();
  
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <ThemedText>Custom Header</ThemedText>
    </View>
  );
}
```

## Migration Notes

When migrating existing screens:

1. Replace `<ThemedView style={GlobalStyles.container}>` with `<SafeAreaView>`
2. Replace `<ScrollView>` with `<SafeAreaScrollView>`
3. Remove manual safe area padding/margin calculations
4. Test on devices with different safe area configurations (iPhone X+, Android with notches, etc.)
