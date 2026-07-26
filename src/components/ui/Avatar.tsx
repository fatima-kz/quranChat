import { View, Text } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';

type Props = {
  name: string;
  size?: number;
};

export function Avatar({ name, size = 56 }: Props) {
  const c = useThemeColors();
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: c.primary + '22',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: c.primary, fontSize: size * 0.36, fontWeight: '700' }}>
        {initials || '?'}
      </Text>
    </View>
  );
}
