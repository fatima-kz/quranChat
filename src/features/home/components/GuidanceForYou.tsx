import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CText } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme.store';
import { useAskQuestion } from '@/features/home/hooks/useAskQuestion';

const ITEMS = [
  {
    icon: 'bulb-outline' as const,
    question: "What does the Qur'an say about finding inner peace?",
    label: "What does the Qur'an say about finding inner peace?",
    color: 'primary' as const,
  },
  {
    icon: 'heart-outline' as const,
    question: 'Understanding patience and gratitude in the Qur\'an',
    label: 'Understanding patience and gratitude',
    color: 'surface' as const,
  },
  {
    icon: 'people-outline' as const,
    question: 'What are the rights of parents and kin in Islam?',
    label: 'Rights of parents and kin',
    color: 'surface' as const,
  },
];

export function GuidanceForYou() {
  const c = useThemeColors();
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  const ask = useAskQuestion();

  return (
    <View style={styles.container}>
      <CText variant="h2" style={{ color: c.text, marginBottom: 16 }}>Guidance For You</CText>

      <View style={styles.grid}>
        {ITEMS.map((item) => {
          const isPrimary = item.color === 'primary';
          return (
            <View
              key={item.label}
              style={{
                borderRadius: 18,
                backgroundColor: isPrimary ? c.primaryDeep : (isDark ? c.surfaceMuted : '#E6F4EE'),
                borderWidth: 1,
                borderColor: isPrimary ? c.primaryDeep : (isDark ? c.border : '#D1E8DD'),
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 2,
              }}
            >
              <TouchableOpacity
                onPress={() => ask(item.question)}
                activeOpacity={0.85}
                style={{ padding: 18 }}
              >
                <View style={styles.row}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isPrimary ? 'rgba(255,255,255,0.18)' : (isDark ? c.surface : '#C8E6D8'),
                    }}
                  >
                    <Ionicons name={item.icon} size={22} color={isPrimary ? '#FFFFFF' : c.primary} />
                  </View>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={isPrimary ? 'rgba(255,255,255,0.7)' : c.textMuted}
                  />
                </View>
                <CText
                  variant="bodyMedium"
                  style={{
                    color: isPrimary ? '#FFFFFF' : c.text,
                    marginTop: 16,
                    lineHeight: 22,
                  }}
                  numberOfLines={3}
                >
                  {item.label}
                </CText>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 28 },
  grid: { gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
