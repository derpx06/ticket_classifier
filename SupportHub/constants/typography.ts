/**
 * Font family names must match keys passed to useFonts() in app/_layout.tsx.
 * Do not use fontWeight — use a stronger face (e.g. semibold vs regular) instead.
 */
export const Font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
  mono: 'SpaceMono_400Regular',
} as const;

export type FontKey = keyof typeof Font;
