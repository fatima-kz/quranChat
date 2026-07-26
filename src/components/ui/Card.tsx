import { View, type ViewProps } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';
import { radius, shadows } from '@/theme';

type Props = ViewProps & {
  surface?: 'default' | 'muted' | 'primary';
  padded?: boolean;
  radiusKey?: keyof typeof radius;
};

export function Card({
  surface = 'default',
  padded = true,
  radiusKey = '2xl',
  style,
  ...props
}: Props) {
  const c = useThemeColors();
  const bg = surface === 'primary' ? c.primary : surface === 'muted' ? c.surfaceMuted : c.surface;
  return (
    <View
      style={[
        { backgroundColor: bg, borderRadius: radius[radiusKey] },
        shadows.soft,
        padded ? { padding: 20 } : undefined,
        style,
      ]}
      {...props}
    />
  );
}
