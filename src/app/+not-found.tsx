import { Link } from 'expo-router';
import { View, Pressable, Text } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';

export default function NotFoundScreen() {
  const c = useThemeColors();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: c.text }}>Screen not found</Text>
      <Link href="/" asChild>
        <Pressable style={{ marginTop: 12 }}>
          <Text style={{ color: c.primary, fontWeight: '600' }}>Go home</Text>
        </Pressable>
      </Link>
    </View>
  );
}
