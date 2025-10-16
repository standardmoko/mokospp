/**
 * Legacy theme file - DEPRECATED
 * Use constants/globalStyles.ts for the Home Harmony design system
 * 
 * This file is kept for backward compatibility with existing Expo template components
 * but should be replaced with the new design system for Home Harmony features.
 */

import { DarkColors, Colors as GlobalColors } from './globalStyles';

// Map our design system colors to the legacy theme structure for compatibility
export const Colors = {
  light: {
    text: GlobalColors.text,
    background: GlobalColors.background,
    tint: GlobalColors.primary,
    icon: GlobalColors.textLight,
    tabIconDefault: GlobalColors.textLight,
    tabIconSelected: GlobalColors.primary,
  },
  dark: {
    text: DarkColors.text,
    background: DarkColors.background,
    tint: DarkColors.primary,
    icon: DarkColors.textLight,
    tabIconDefault: DarkColors.textLight,
    tabIconSelected: DarkColors.primary,
  },
};

// Legacy fonts - use Typography from globalStyles.ts for new components
export const Fonts = {
  sans: 'Poppins',
  serif: 'Poppins',
  rounded: 'Poppins',
  mono: 'Poppins',
};
