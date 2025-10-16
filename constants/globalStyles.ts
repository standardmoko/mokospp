import { Platform, StyleSheet } from 'react-native';

// Design System Colors
export const Colors = {
  // Brand Colors
  primary: '#4A8A76',
  primaryLight: '#6BA394',
  primaryDark: '#3A6B5C',
  secondary: '#D96A5F',
  secondaryLight: '#E89A92',
  secondaryDark: '#C4554A',
  
  // Text Colors
  text: '#333333',
  textLight: '#666666',
  textLighter: '#999999',
  
  // Background Colors
  background: '#F4F1EC', // Light blend of #D96A5F and #4A8A76 with warm tone
  backgroundGradientStart: 'rgba(217, 106, 95, 0.12)', // Light coral
  backgroundGradientEnd: 'rgba(74, 138, 118, 0.12)', // Light teal
  white: '#FFFFFF',
  border: '#E8E4DD',
  
  // Status Colors
  error: '#E74C3C',
  warning: '#F39C12',
  success: '#4A8A76',
  
  // Traffic Light Colors (for Ergo Fit Checker)
  trafficRed: '#E74C3C',
  trafficYellow: '#F39C12',
  trafficGreen: '#4A8A76',
};

// Dark Mode Colors
export const DarkColors = {
  primary: '#6BA394',
  secondary: '#E89A92',
  text: '#FFFFFF',
  textLight: '#CCCCCC',
  textLighter: '#999999',
  background: '#1C1A18', // Dark version of the blended background
  backgroundGradientStart: 'rgba(217, 106, 95, 0.08)',
  backgroundGradientEnd: 'rgba(74, 138, 118, 0.08)',
  white: '#2D2D2D',
  border: '#404040',
  error: '#E74C3C',
  warning: '#F39C12',
  success: '#6BA394',
  trafficRed: '#E74C3C',
  trafficYellow: '#F39C12',
  trafficGreen: '#6BA394',
};

// Typography
export const Typography = {
  fontFamily: Platform.select({
    ios: 'Poppins',
    android: 'Poppins',
    default: 'System',
  }),
  sizes: {
    displayLarge: 32,
    displayMedium: 28,
    heading1: 24,
    heading2: 20,
    heading3: 18,
    bodyLarge: 16,
    bodyMedium: 14,
    bodySmall: 12,
    button: 16,
    caption: 12,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    displayLarge: 40,
    displayMedium: 36,
    heading1: 32,
    heading2: 28,
    heading3: 24,
    bodyLarge: 24,
    bodyMedium: 20,
    bodySmall: 16,
    button: 20,
    caption: 16,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const BorderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  round: 50,
};

// Shadows
export const Shadows = {
  small: {
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
};

// Global Styles
export const GlobalStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeAreaContainer: {
    flex: 1,
  },
  screenPadding: {
    paddingHorizontal: Spacing.md,
  },
  screenPaddingHorizontal: {
    paddingHorizontal: Spacing.md,
  },
  screenPaddingVertical: {
    paddingVertical: Spacing.md,
  },
  sectionPadding: {
    paddingVertical: Spacing.lg,
  },
  // Safe Area Edge Styles
  safeAreaTop: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24, // Default status bar height
  },
  safeAreaBottom: {
    paddingBottom: Platform.OS === 'ios' ? 34 : 0, // Default home indicator height
  },

  // Typography Styles
  displayLarge: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.displayLarge,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.displayLarge,
    color: Colors.text,
  },
  displayMedium: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.displayMedium,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.displayMedium,
    color: Colors.text,
  },
  heading1: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.heading1,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.heading1,
    color: Colors.text,
  },
  heading2: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.heading2,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.heading2,
    color: Colors.text,
  },
  heading3: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.heading3,
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.lineHeights.heading3,
    color: Colors.text,
  },
  bodyLarge: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.lineHeights.bodyLarge,
    color: Colors.text,
  },
  bodyMedium: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.bodyMedium,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.lineHeights.bodyMedium,
    color: Colors.textLight,
  },
  bodySmall: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.lineHeights.bodySmall,
    color: Colors.textLight,
  },
  caption: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.regular,
    lineHeight: Typography.lineHeights.caption,
    color: Colors.textLighter,
  },

  // Button Styles
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  primaryButtonText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.button,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  secondaryButtonText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.button,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.button,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },

  // Compact Button Styles (for modals and smaller spaces)
  compactButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  compactButtonText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.bodyMedium,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
  },
  compactOutlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  compactOutlineButtonText: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.bodyMedium,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },

  // Card Styles
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  cardTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.heading3,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  cardBody: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.bodyMedium,
    fontWeight: Typography.weights.regular,
    color: Colors.textLight,
    lineHeight: Typography.lineHeights.bodyMedium,
  },

  // Form Styles
  inputContainer: {
    marginVertical: Spacing.xs,
  },
  inputLabel: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.bodyMedium,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.small,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.sizes.bodyLarge,
    color: Colors.text,
  },
  textInputFocused: {
    borderColor: Colors.primary,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    margin: Spacing.md,
    maxWidth: '90%',
    ...Shadows.large,
  },

  // Navigation Styles
  tabBarStyle: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    // Remove hardcoded padding - let react-navigation handle safe area
  },

  // Status Indicator Styles (for Ergo Fit Checker)
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.xs,
  },
  statusGood: {
    backgroundColor: Colors.trafficGreen,
  },
  statusWarning: {
    backgroundColor: Colors.trafficYellow,
  },
  statusPoor: {
    backgroundColor: Colors.trafficRed,
  },

  // Utility Styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  marginTop: {
    marginTop: Spacing.md,
  },
  marginBottom: {
    marginBottom: Spacing.md,
  },
  marginVertical: {
    marginVertical: Spacing.md,
  },
  marginHorizontal: {
    marginHorizontal: Spacing.md,
  },
});

// Helper function to get theme colors
export const getThemeColors = (isDark: boolean) => {
  return isDark ? DarkColors : Colors;
};

// Helper function to create themed styles
export const createThemedStyles = (isDark: boolean) => {
  const colors = getThemeColors(isDark);
  
  return StyleSheet.create({
    container: {
      ...GlobalStyles.container,
      backgroundColor: colors.background,
    },
    text: {
      color: colors.text,
    },
    card: {
      ...GlobalStyles.card,
      backgroundColor: colors.white,
      borderColor: colors.border,
    },
    // Add more themed styles as needed
  });
};
