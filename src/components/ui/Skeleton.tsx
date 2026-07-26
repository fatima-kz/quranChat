import { View, type ViewProps, type DimensionValue } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';

type Props = ViewProps & {
  width?: DimensionValue;
  height?: number;
  radius?: number;
};

export function Skeleton({ width = '100%', height = 16, radius = 8, style, ...props }: Props) {
  const c = useThemeColors();
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: c.surfaceMuted,
          opacity: 0.7,
        },
        style,
      ]}
      {...props}
    />
  );
}
