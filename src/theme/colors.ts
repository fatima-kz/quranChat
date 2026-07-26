export type ThemeColors = {
  background: string;
  surface: string;
  surface2: string;
  surfaceMuted: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  text: string;
  textMuted: string;
  border: string;
  inputBg: string;
  danger: string;
  overlay: string;
};

export const palette = {
  primary: '#064E3B',
  primaryDeep: '#033320',
  primarySoft: '#065F46',
  secondary: '#D4AF37',
  secondarySoft: '#E8CD7A',
  tertiary: '#F5F2EA',
  neutral: '#1F2937',
  neutralMuted: '#6B7280',
  neutralLight: '#9CA3AF',
  neutralBorder: '#E5E5E5',
  danger: '#B44545',
  dangerDark: '#F87171',
} as const;

export const colors: Record<'light' | 'dark', ThemeColors> = {
  light: {
    background: palette.tertiary,
    surface: '#FFFFFF',
    surface2: '#FAFAF8',
    surfaceMuted: '#EDEAE2',
    primary: palette.primary,
    primaryDeep: palette.primaryDeep,
    primarySoft: palette.primarySoft,
    accent: palette.secondary,
    accentSoft: palette.secondarySoft,
    text: palette.neutral,
    textMuted: palette.neutralMuted,
    border: palette.neutralBorder,
    inputBg: '#FFFFFF',
    danger: palette.danger,
    overlay: 'rgba(31, 41, 55, 0.32)',
  },
  dark: {
    background: '#0B0F0D',
    surface: '#171E1A',
    surface2: '#1E2823',
    surfaceMuted: '#252E28',
    primary: '#3CB99E',
    primaryDeep: '#064E3B',
    primarySoft: '#5DD4B8',
    accent: '#D4AF37',
    accentSoft: 'rgba(212, 175, 55, 0.25)',
    text: '#F0EDE5',
    textMuted: '#8A9590',
    border: '#2A342F',
    inputBg: '#171E1A',
    danger: '#F87171',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

export type ColorScheme = keyof typeof colors;
