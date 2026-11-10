/**
 * GYMOVA design tokens — "Premium Dark Fitness".
 * Single source of truth consumed by the mobile app (React Native) and the admin dashboard (Tailwind).
 * The lime accent is used sparingly: primary buttons, progress, active states, highlights.
 */

export const palette = {
  background: '#101418',
  backgroundSecondary: '#151C22',
  card: '#1B2229',
  elevated: '#232D35',
  accent: '#C5F36B',
  accentSecondary: '#A7D94F',
  textPrimary: '#FFFFFF',
  textSecondary: '#9AA4AE',
  textMuted: '#68737D',
  border: '#303941',
  success: '#45C486',
  warning: '#F2B84B',
  error: '#EF6464',
  info: '#5BA8F5',
} as const;

export const lightPalette = {
  background: '#F5F7F9',
  backgroundSecondary: '#EDF0F3',
  card: '#FFFFFF',
  elevated: '#F0F3F6',
  accent: '#6E9B12',
  accentSecondary: '#5B8210',
  textPrimary: '#101418',
  textSecondary: '#4D5861',
  textMuted: '#7B858E',
  border: '#D5DBE1',
  success: '#1F9D62',
  warning: '#C98A14',
  error: '#D33F3F',
  info: '#2C7BE5',
} as const;

export type ThemeColors = { [K in keyof typeof palette]: string };

export const themes: Record<'dark' | 'light', ThemeColors> = {
  dark: palette,
  light: lightPalette,
};

/** 4-point spacing system. */
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    web: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  },
  size: {
    display: 34,
    page: 28,
    section: 20,
    body: 16,
    bodySmall: 14,
    caption: 12,
    label: 13,
    metric: 24,
    metricLarge: 40,
  },
  lineHeight: {
    display: 40,
    page: 34,
    section: 26,
    body: 22,
    bodySmall: 20,
    caption: 16,
    label: 18,
    metric: 30,
    metricLarge: 46,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const motion = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;

/** Minimum accessible touch target (Android guideline). */
export const touchTarget = 48;

export const brand = {
  name: 'GYMOVA',
  tagline: 'Train. Eat. Track. Transform.',
  taglineSo: 'Tababar. Cun. La soco. Isbeddel.',
} as const;
