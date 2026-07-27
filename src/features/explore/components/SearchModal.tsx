import { useState, useMemo, useCallback } from 'react';
import { View, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CText } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useChatStore } from '@/store/chat.store';
import { allSurahs, loadSurahData } from '@/features/quran/api/quran-data';

type SearchResult = {
  type: 'surah' | 'verse' | 'topic';
  title: string;
  subtitle: string;
  surahId?: number;
  verseId?: number;
  topic?: string;
};

const TOPICS = [
  'Patience', 'Gratitude', 'Forgiveness', 'Mercy', 'Prayer',
  'Charity', 'Hardship', 'Hope', 'Trust in Allah', 'Anxiety',
  'Family', 'Nature', 'Death', 'Jannah', 'Repentance',
];

const surahDataCache: Record<number, ReturnType<typeof loadSurahData>> = {};

function getCachedSurah(id: number) {
  if (!surahDataCache[id]) {
    surahDataCache[id] = loadSurahData(id);
  }
  return surahDataCache[id];
}

export function SearchModal() {
  const c = useThemeColors();
  const haptic = useHaptics();
  const [query, setQuery] = useState('');

  const results = useMemo<SearchResult[]>(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const found: SearchResult[] = [];

    for (const surah of allSurahs) {
      if (
        surah.transliteration.toLowerCase().includes(q) ||
        surah.translation.toLowerCase().includes(q) ||
        surah.name.includes(query.trim()) ||
        String(surah.id) === q
      ) {
        found.push({
          type: 'surah',
          title: `${surah.id}. ${surah.transliteration}`,
          subtitle: `${surah.translation} - ${surah.total_verses} verses`,
          surahId: surah.id,
        });
      }
    }

    for (const surah of allSurahs) {
      try {
        const data = getCachedSurah(surah.id);
        if (!data) continue;
        for (const verse of data.verses) {
          const translation = verse.translation.toLowerCase();
          if (translation.includes(q)) {
            found.push({
              type: 'verse',
              title: `${surah.transliteration} ${surah.id}:${verse.id}`,
              subtitle: verse.translation.length > 90
                ? verse.translation.slice(0, 87) + '...'
                : verse.translation,
              surahId: surah.id,
              verseId: verse.id,
            });
          }
        }
      } catch {
        continue;
      }
    }

    for (const topic of TOPICS) {
      if (topic.toLowerCase().includes(q)) {
        found.push({
          type: 'topic',
          title: topic,
          subtitle: 'Ask AI about this topic',
          topic,
        });
      }
    }

    return found.slice(0, 100);
  }, [query]);

  const handleResult = useCallback((result: SearchResult) => {
    haptic('light');
    if (result.type === 'surah' && result.surahId) {
      router.push({ pathname: '/(tabs)/quran/[id]' as any, params: { id: String(result.surahId) } });
    } else if (result.type === 'verse' && result.surahId && result.verseId) {
      router.push({ pathname: '/(tabs)/quran/[id]' as any, params: { id: String(result.surahId), verse: String(result.verseId) } });
    } else if (result.type === 'topic' && result.topic) {
      useChatStore.getState().setPendingQuestion(`What does the Qur'an say about ${result.topic}?`);
      router.push('/(tabs)/chat');
    }
  }, [haptic]);

  const renderResult = useCallback(({ item }: { item: SearchResult }) => (
    <Pressable
      onPress={() => handleResult(item)}
      style={({ pressed }) => [
        styles.resultRow,
        { backgroundColor: c.surface, borderColor: c.border },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.resultIcon, { backgroundColor: item.type === 'surah' ? c.primary + '15' : item.type === 'verse' ? c.accent + '15' : c.surfaceMuted }]}>
        <Ionicons
          name={item.type === 'surah' ? 'book' : item.type === 'verse' ? 'document-text' : 'chatbubble'}
          size={18}
          color={item.type === 'surah' ? c.primary : item.type === 'verse' ? c.accent : c.textMuted}
        />
      </View>
      <View style={{ flex: 1 }}>
        <CText variant="bodyMedium" style={{ color: c.text, fontSize: 15 }}>{item.title}</CText>
        <CText variant="small" muted style={{ marginTop: 2, lineHeight: 18 }}>{item.subtitle}</CText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
    </Pressable>
  ), [c, handleResult]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <View style={styles.searchHeader}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={c.text} />
        </Pressable>
        <View style={[styles.searchInputWrap, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Ionicons name="search" size={20} color={c.textMuted} />
          <TextInput
            autoFocus
            style={[styles.searchInput, { color: c.text }]}
            placeholder="Search surahs, verses, topics..."
            placeholderTextColor={c.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={c.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {query.trim().length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color={c.textMuted} style={{ opacity: 0.4 }} />
          <CText variant="body" muted style={{ marginTop: 12 }}>{"Search across the entire Qur'an"}</CText>
          <CText variant="small" muted style={{ marginTop: 4 }}>Find surahs, verses, or topics</CText>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color={c.textMuted} style={{ opacity: 0.4 }} />
          <CText variant="body" muted style={{ marginTop: 12 }}>{"No results found"}</CText>
        </View>
      ) : (
        <>
          <View style={styles.resultCount}>
            <CText variant="caption" muted>{results.length} results</CText>
          </View>
          <FlatList
            data={results}
            keyExtractor={(item, i) => `${item.type}-${i}`}
            renderItem={renderResult}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            maxToRenderPerBatch={20}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  resultCount: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
});
