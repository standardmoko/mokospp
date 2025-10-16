import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Typography } from '@/constants/globalStyles';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color, fontFamily: Typography.fontFamily },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: Typography.sizes.bodyLarge,
    lineHeight: Typography.lineHeights.bodyLarge,
    fontWeight: Typography.weights.regular,
  },
  defaultSemiBold: {
    fontSize: Typography.sizes.bodyLarge,
    lineHeight: Typography.lineHeights.bodyLarge,
    fontWeight: Typography.weights.semibold,
  },
  title: {
    fontSize: Typography.sizes.displayLarge,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.lineHeights.displayLarge,
  },
  subtitle: {
    fontSize: Typography.sizes.heading2,
    fontWeight: Typography.weights.semibold,
    lineHeight: Typography.lineHeights.heading2,
  },
  link: {
    fontSize: Typography.sizes.bodyLarge,
    lineHeight: Typography.lineHeights.bodyLarge,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
});
