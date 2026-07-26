import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CText } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useAskQuestion } from '@/features/home/hooks/useAskQuestion';
import { useDailyAyah } from '@/features/home/hooks/useDailyAyah';
import { useAuthStore } from '@/store/auth.store';

export function LatestReflection() {
  const c = useThemeColors();
  const ask = useAskQuestion();
  const profile = useAuthStore((s) => s.profile);
  const { data } = useDailyAyah(profile?.topics ?? null);

  const title = data?.surah ? `Reflection on ${data.surah}` : 'The Miracle of Water';
  const question = data
    ? `Reflect on this verse: "${data.text}" (${data.ayahRef})`
    : "What does the Qur'an say about water and creation?";

  return (
    <View
      style={{
        marginTop: 24,
        borderRadius: 22,
        backgroundColor: '#064E3B',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 4,
      }}
    >
      <TouchableOpacity
        onPress={() => ask(question)}
        activeOpacity={0.9}
        style={{ minHeight: 160 }}
      >
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(6, 78, 59, 0.55)' }]} />
        <View style={styles.content}>
          <View style={styles.badge}>
            <Ionicons name="book-outline" size={14} color="#FFFFFF" style={{ opacity: 0.9 }} />
            <CText variant="caption" style={{ color: '#FFFFFF', letterSpacing: 1.5, opacity: 0.9, marginLeft: 6 }}>
              LATEST REFLECTION
            </CText>
          </View>
          <CText variant="h2" style={{ color: '#FFFFFF', lineHeight: 28 }}>
            {title}
          </CText>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 22,
    paddingTop: 52,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});
