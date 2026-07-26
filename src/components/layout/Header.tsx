import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useTheme';

type Props = {
  title?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  transparent?: boolean;
};

export function Header({ title, showBack, right, transparent }: Props) {
  const c = useThemeColors();

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: transparent ? 'transparent' : c.background }}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.side}>
            <Ionicons name="chevron-back" size={26} color={c.text} />
          </Pressable>
        ) : (
          <View style={styles.side} />
        )}
        {title ? (
          <Text style={{ fontSize: 17, fontWeight: '600', color: c.text }}>{title}</Text>
        ) : (
          <View />
        )}
        <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 48,
  },
  side: { width: 40 },
});
