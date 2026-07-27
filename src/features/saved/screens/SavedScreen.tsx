import { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme.store';
import { useSavedStore, type SavedVerse } from '@/store/saved.store';

type Tab = 'verses' | 'ai';

export default function SavedScreen() {
  const c = useThemeColors();
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  const savedVerses = useSavedStore((s) => s.verses);
  const savedAi = useSavedStore((s) => s.aiResponses);
  const unsaveVerse = useSavedStore((s) => s.unsaveVerse);
  const unsaveAiResponse = useSavedStore((s) => s.unsaveAiResponse);

  const [tab, setTab] = useState<Tab>('verses');

  // Group verses by surah
  const groupedVerses = useMemo(() => {
    const map = new Map<string, { transliteration: string; verses: SavedVerse[] }>();
    for (const v of savedVerses) {
      const key = String(v.surahId);
      if (!map.has(key)) {
        map.set(key, { transliteration: v.surahTransliteration, verses: [] });
      }
      map.get(key)!.verses.push(v);
    }
    return Array.from(map.entries()).map(([surahId, data]) => ({
      surahId: Number(surahId),
      transliteration: data.transliteration,
      verses: data.verses.sort((a, b) => a.verseId - b.verseId),
    }));
  }, [savedVerses]);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.background }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={c.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: c.text }]}>Saved Items</Text>
            <Text style={[styles.subtitle, { color: c.textMuted }]}>
              Your personalized collection of divine wisdom.
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabRow, { backgroundColor: isDark ? c.surfaceMuted : '#E6F4EE' }]}>
          <Pressable
            onPress={() => setTab('verses')}
            style={[
              styles.tabBtn,
              tab === 'verses' && { backgroundColor: c.surface },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === 'verses' ? c.text : c.textMuted },
                tab === 'verses' && { fontWeight: '700' },
              ]}
            >
              Qur&apos;an Verses
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('ai')}
            style={[
              styles.tabBtn,
              tab === 'ai' && { backgroundColor: c.surface },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === 'ai' ? c.text : c.textMuted },
                tab === 'ai' && { fontWeight: '700' },
              ]}
            >
              AI Responses
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'verses' ? (
          groupedVerses.length === 0 ? (
            <EmptyState icon="book-outline" message="No saved verses yet. Tap the save icon on any verse to add it here." />
          ) : (
            groupedVerses.map((group) => (
              <View key={group.surahId} style={styles.surahGroup}>
                {/* Surah header */}
                <View style={styles.surahHeader}>
                  <Text style={[styles.surahName, { color: c.text }]}>{group.transliteration}</Text>
                  <View style={[styles.countBadge, { backgroundColor: isDark ? 'rgba(60,185,158,0.15)' : '#E6F4EE' }]}>
                    <Text style={[styles.countText, { color: c.primary }]}>
                      {group.verses.length} {group.verses.length === 1 ? 'Ayah' : 'Ayahs'}
                    </Text>
                  </View>
                </View>

                {/* Verse cards */}
                {group.verses.map((verse) => (
                  <View
                    key={verse.id}
                    style={[
                      styles.verseCard,
                      {
                        backgroundColor: c.surface,
                        borderColor: c.border,
                        borderLeftColor: c.primary,
                      },
                    ]}
                  >
                    <View style={styles.verseTop}>
                      <Text style={[styles.ayahLabel, { color: c.textMuted }]}>
                        Ayah {verse.verseId}
                      </Text>
                      <Pressable
                        onPress={() => unsaveVerse(verse.surahId, verse.verseId)}
                        hitSlop={8}
                      >
                        <Ionicons name="heart" size={20} color={c.accent} />
                      </Pressable>
                    </View>
                    <Text style={[styles.arabicText, { color: c.text }]}>
                      {verse.arabicText}
                    </Text>
                    <Text style={[styles.translationText, { color: c.textMuted }]}>
                      &quot;{verse.translation}&quot;
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )
        ) : (
          savedAi.length === 0 ? (
            <EmptyState icon="chatbubble-outline" message="No saved AI responses yet. Tap the save icon on any AI message to add it here." />
          ) : (
            savedAi.map((response) => (
              <View
                key={response.id}
                style={[
                  styles.aiCard,
                  {
                    backgroundColor: c.surface,
                    borderColor: c.border,
                    borderLeftColor: c.accent,
                  },
                ]}
              >
                <View style={styles.verseTop}>
                  {response.citation ? (
                    <Text style={[styles.ayahLabel, { color: c.accent }]}>
                      Qur&apos;an {response.citation.surah}:{response.citation.ayah}
                    </Text>
                  ) : (
                    <Text style={[styles.ayahLabel, { color: c.textMuted }]}>AI Response</Text>
                  )}
                  <Pressable
                    onPress={() => unsaveAiResponse(response.id)}
                    hitSlop={8}
                  >
                    <Ionicons name="heart" size={20} color={c.accent} />
                  </Pressable>
                </View>
                <Text style={[styles.aiContent, { color: c.text }]} numberOfLines={6}>
                  {response.content}
                </Text>
              </View>
            ))
          )
        )}
      </ScrollView>
    </View>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  const c = useThemeColors();
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name={icon as any} size={48} color={c.textMuted} />
      <Text style={[styles.emptyText, { color: c.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 4,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 8,
  },
  surahGroup: {
    marginBottom: 24,
  },
  surahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  surahName: {
    fontSize: 22,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  verseCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
  },
  verseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ayahLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  arabicText: {
    fontSize: 22,
    lineHeight: 42,
    textAlign: 'right',
    marginBottom: 8,
  },
  translationText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  aiCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
  },
  aiContent: {
    fontSize: 14,
    lineHeight: 22,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});
