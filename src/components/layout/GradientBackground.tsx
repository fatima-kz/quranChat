import { View, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useThemeColors } from '@/hooks/useTheme';
import type { ThemeColors } from '@/theme';

type Props = ViewProps & {
  variant?: 'hero' | 'soft' | 'splash';
};

function gradient(variant: NonNullable<Props['variant']>, c: ThemeColors): [string, string, string] {
  switch (variant) {
    case 'splash':
      return [c.primaryDeep, c.primary, c.primarySoft];
    case 'hero':
      return [c.primaryDeep, c.primary, c.primarySoft];
    case 'soft':
    default:
      return [c.surface, c.background, c.background];
  }
}

export function GradientBackground({ variant = 'soft', style, children, ...props }: Props) {
  const c = useThemeColors();
  return (
    <View style={[{ flex: 1 }, style]} {...props}>
      <LinearGradient
        colors={gradient(variant, c)}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 1 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      {children}
    </View>
  );
}
