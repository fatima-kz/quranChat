export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 36,
  pill: 999,
} as const;

export type RadiusKey = keyof typeof radius;
