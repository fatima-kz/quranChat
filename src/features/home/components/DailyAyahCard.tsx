import { View, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card, CText, Skeleton } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme.store';
import { useAskQuestion } from '@/features/home/hooks/useAskQuestion';
import { useDailyAyah } from '@/features/home/hooks/useDailyAyah';

export function DailyAyahCard({ userTopics }: { userTopics?: string[] | null }) {
  const c = useThemeColors();
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  const ask = useAskQuestion();
  const { data, isLoading, isError } = useDailyAyah(userTopics);

  return (
    <Card surface="muted" padded style={styles.card}>
      {/* Watermark */}
      <View style={styles.watermark}>
        <Ionicons name="book-outline" size={120} color={c.primary} style={{ opacity: 0.08 }} />
      </View>

      {isLoading ? (
        <View style={{ gap: 10, paddingVertical: 4 }}>
          <Skeleton height={20} width="92%" />
          <Skeleton height={20} width="70%" />
          <Skeleton height={14} width="40%" />
        </View>
      ) : isError || !data ? (
        <CText muted>A new reflection will appear here soon.</CText>
      ) : (
        <View style={{ gap: 14, zIndex: 1 }}>
          <View style={[styles.pill, { backgroundColor: c.surface }]}>
            <CText variant="caption" style={{ color: c.primary, fontWeight: '700', letterSpacing: 1 }}>
              DAILY VERSE
            </CText>
          </View>

          <View style={[styles.verseBox, { backgroundColor: c.surface }]}>
            <CText
              variant="h2"
              style={{
                color: c.primary,
                textAlign: 'center',
                fontSize: 26,
                lineHeight: 52,
                paddingTop: 16,
                paddingBottom: 4,
              }}
            >
              {data.arabic}
            </CText>

            <CText
              variant="body"
              style={{
                color: c.text,
                textAlign: 'center',
                fontFamily: 'SourceSerif4Italic',
                fontStyle: 'italic',
                lineHeight: 24,
                marginTop: 4,
              }}
            >
              “{data.english}”
            </CText>

            <CText variant="caption" muted style={{ textAlign: 'center', marginTop: 10 }}>
              {data.ayahRef} · {data.surah}
            </CText>
          </View>

          <CText variant="small" muted style={{ textAlign: 'center', lineHeight: 22 }}>
            {data.reflection}
          </CText>

          <View
            style={{
              alignSelf: 'center',
              marginTop: 8,
              borderRadius: 12,
              backgroundColor: isDark ? c.surfaceMuted : '#E6F4EE',
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.14,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            <TouchableOpacity
              onPress={() => ask(`Give me a tafsir of ${data.ayahRef}`)}
              activeOpacity={0.85}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingHorizontal: 22,
                paddingVertical: 12,
              }}
            >
              <CText variant="bodyMedium" style={{ color: isDark ? c.primary : '#064E3B', fontWeight: '700' }}>
                View Tafsir
              </CText>
              <Ionicons name="arrow-forward" size={16} color={isDark ? c.primary : '#064E3B'} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginTop: 8,
  },
  watermark: {
    position: 'absolute',
    right: -20,
    top: 20,
    opacity: 0.55,
    transform: [{ rotate: '-12deg' }],
  },
  pill: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  verseBox: {
    borderRadius: 18,
    padding: 18,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  tafsirBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'center',
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 3,
  },
});
