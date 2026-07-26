import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CText } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme.store';
import { useAskQuestion } from '@/features/home/hooks/useAskQuestion';
import { useGuidance } from '@/features/home/hooks/useGuidance';
import { useAuthStore } from '@/store/auth.store';

export function GuidanceForYou() {
  const c = useThemeColors();
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  const ask = useAskQuestion();
  const profile = useAuthStore((s) => s.profile);
  const { data: items, isLoading } = useGuidance(profile?.topics ?? null);

  return (
    <View style={styles.container}>
      <CText variant="h2" style={{ color: c.text, marginBottom: 16 }}>Guidance For You</CText>

      <View style={styles.grid}>
        {(items ?? []).map((item, i) => {
          const isPrimary = i === 0;
          return (
            <View
              key={item.question}
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
                    {isLoading ? (
                      <Ionicons name="hourglass-outline" size={20} color={isPrimary ? '#FFFFFF' : c.primary} />
                    ) : (
                      <Ionicons name={item.icon} size={22} color={isPrimary ? '#FFFFFF' : c.primary} />
                    )}
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
