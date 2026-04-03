import { StyleSheet, Text, type TextProps } from 'react-native';

import { Font } from '@/constants/typography';
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
        { color },
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
    fontFamily: Font.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontFamily: Font.semibold,
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontFamily: Font.bold,
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    fontFamily: Font.semibold,
    fontSize: 20,
    lineHeight: 28,
  },
  link: {
    fontFamily: Font.medium,
    lineHeight: 30,
    fontSize: 16,
    color: '#2563eb',
  },
});
