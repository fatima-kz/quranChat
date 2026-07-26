import { View, type ViewProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

import { useThemeColors } from '@/hooks/useTheme';
import { radius } from '@/theme';

type Props = ViewProps & {
  intensity?: number;
  radiusKey?: keyof typeof radius;
};

export function BlurCard({ intensity = 40, radiusKey = '2xl', style, children, ...props }: Props) {
  const c = useThemeColors();

  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          { backgroundColor: c.surface + 'F2', borderRadius: radius[radiusKey], borderWidth: 1, borderColor: c.border },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[{ borderRadius: radius[radiusKey], overflow: 'hidden', borderWidth: 1, borderColor: c.border }, style]} {...props}>
      <BlurView intensity={intensity} tint="light" style={{ flex: 1 }}>
        {children}
      </BlurView>
    </View>
  );
}
