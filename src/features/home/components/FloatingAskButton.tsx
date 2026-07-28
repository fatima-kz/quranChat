import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useThemeColors } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';

export function FloatingAskButton() {
  const c = useThemeColors();
  const haptic = useHaptics();

  return (
    <Pressable
      onPress={() => {
        haptic('light');
        router.navigate('/(tabs)/chat');
      }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: c.accent,
          shadowColor: c.text,
        },
        pressed && { opacity: 0.92, transform: [{ scale: 0.96 }] },
      ]}
    >
      <Ionicons name="chatbubble" size={24} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
});
