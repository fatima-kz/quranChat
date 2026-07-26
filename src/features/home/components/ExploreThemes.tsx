import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';

import { CText } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme.store';
import { useAskQuestion } from '@/features/home/hooks/useAskQuestion';

const THEMES = ['Success', 'Forgiveness', 'Charity', 'Patience', 'Gratitude', 'Family', 'Prayer'];

export function ExploreThemes() {
  const c = useThemeColors();
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  const ask = useAskQuestion();

  return (
    <>
      <CText variant="h2" style={{ color: c.text, marginTop: 28, marginBottom: 14 }}>
        Explore Themes
      </CText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {THEMES.map((theme) => (
          <View
            key={theme}
            style={{
              borderRadius: 12,
              backgroundColor: isDark ? c.surfaceMuted : '#E6F4EE',
              borderWidth: 1,
              borderColor: isDark ? c.border : '#D1E8DD',
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <TouchableOpacity
              onPress={() => ask(`What does the Qur'an say about ${theme.toLowerCase()}?`)}
              activeOpacity={0.85}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 12,
              }}
            >
              <CText variant="bodyMedium" style={{ color: isDark ? c.text : '#1F2937', fontWeight: '600' }}>{theme}</CText>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    paddingRight: 24,
    paddingBottom: 4,
  },
});
