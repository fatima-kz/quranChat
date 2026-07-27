import { StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CText } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { lookupVerse } from '@/features/quran/api/quran-data';
import type { Citation } from '@/types';

type Props = {
  citation: Citation | null;
};

export function CitationFooter({ citation }: Props) {
  const c = useThemeColors();
  const haptic = useHaptics();
  if (!citation) return null;

  const verse = lookupVerse(citation.surah, citation.ayah);

  const openSurah = () => {
    haptic('light');
    router.push({ pathname: '/(tabs)/quran/[id]' as any, params: { id: String(citation.surah), verse: String(citation.ayah) } });
  };

  return (
    <Pressable onPress={openSurah} style={({ pressed }) => [styles.card, { backgroundColor: c.background, borderColor: c.border }, pressed && { opacity: 0.85 }]}>
      <View style={styles.cardHeader}>
        <View>
          <CText variant="caption" style={{ color: c.accent, letterSpacing: 1.5, fontWeight: '700' }}>
            {verse.surahName ? verse.surahName.toUpperCase() : `SURAH ${citation.surah}`}
          </CText>
          <CText variant="small" muted style={{ marginTop: 2 }}>
            Ayah {citation.ayah}
          </CText>
        </View>
        <View style={styles.readBadge}>
          <Ionicons name="book-outline" size={14} color={c.accent} />
          <CText variant="caption" style={{ color: c.accent, fontWeight: '700', marginLeft: 4 }}>
            READ
          </CText>
        </View>
      </View>

      {verse.isValid && verse.verseTranslation ? (
        <View style={[styles.quoteWrap, { borderLeftColor: c.textMuted }]}>
          <CText
            variant="body"
            style={{
              color: c.text,
              fontFamily: 'SourceSerif4Italic',
              fontStyle: 'italic',
              lineHeight: 24,
            }}
          >
            {verse.verseTranslation}
          </CText>
        </View>
      ) : (
        <View style={[styles.quoteWrap, { borderLeftColor: c.textMuted }]}>
          <CText variant="small" muted>
            {"Qur'an " + citation.surah + ":" + citation.ayah}
          </CText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  quoteWrap: {
    borderLeftWidth: 3,
    paddingLeft: 12,
  },
});
