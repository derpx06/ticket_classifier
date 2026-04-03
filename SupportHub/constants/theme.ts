/**
 * Theme tokens: colors, spacing, radii. Typography faces live in typography.ts
 * and are loaded in app/_layout.tsx.
 */

import { Platform } from 'react-native';

const tintColorLight = '#2563eb';
const tintColorDark = '#93c5fd';

export const Colors = {
  light: {
    text: '#0f172a',
    textSecondary: '#64748b',
    background: '#fafafa',
    surface: '#ffffff',
    surfaceMuted: '#f4f4f5',
    tint: tintColorLight,
    icon: '#71717a',
    border: '#e4e4e7',
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceMuted: '#334155',
    tint: tintColorDark,
    icon: '#94a3b8',
    border: '#334155',
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorDark,
  },
};

/** Brand & status (mode-agnostic). */
export const Palette = {
  primary: '#2563eb',
  primaryPressed: '#1d4ed8',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0284c7',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const Layout = {
  maxContentWidth: 560,
  tabBarHeight: Platform.select({ ios: 88, default: 64 }),
} as const;
