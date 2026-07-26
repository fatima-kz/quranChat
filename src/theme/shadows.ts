import { Platform, type ViewStyle } from 'react-native';

export const shadows = {
  none: { shadowOpacity: 0, elevation: 0 },
  soft: {
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  card: {
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 4,
  },
  floating: {
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 8,
  },
} as const;

export type ShadowKey = keyof typeof shadows;

export function withShadow(key: ShadowKey): ViewStyle {
  const s = shadows[key] as ViewStyle;
  return Platform.OS === 'android' ? { elevation: s.elevation } : s;
}
