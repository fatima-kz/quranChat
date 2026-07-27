import React, { useEffect, useState, useRef, useCallback, useMemo, memo } from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme.store';
import { useQuranStore } from '@/store/quran.store';
import { useSavedStore } from '@/store/saved.store';
import { LogoImage } from '@/components/ui';

type Verse = {
  id: number;
  text: string;
  translation: string;
  transliteration: string;
};

type SurahData = {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: string;
  total_verses: number;
  verses: Verse[];
};


export default function SurahScreen() {
  const c = useThemeColors();
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  const params = useLocalSearchParams<{ id: string }>();
  const surahId = Number(params.id);

  const setLastRead = useQuranStore((s) => s.setLastRead);
  const addRecentSurah = useQuranStore((s) => s.addRecentSurah);
  const addBookmark = useQuranStore((s) => s.addBookmark);
  const removeBookmark = useQuranStore((s) => s.removeBookmark);
  const bookmarks = useQuranStore((s) => s.bookmarks);

  const saveVerse = useSavedStore((s) => s.saveVerse);
  const unsaveVerse = useSavedStore((s) => s.unsaveVerse);
  const savedVerses = useSavedStore((s) => s.verses);

  const [surah, setSurah] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList<Verse>>(null);

  useEffect(() => {
    if (!loading && surah && flatListRef.current) {
      const bookmarkedVerseIdx = surah.verses.findIndex(
        (v) => bookmarks.some((b) => b.surahId === surahId && b.verseId === v.id)
      );
      if (bookmarkedVerseIdx >= 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ 
            index: bookmarkedVerseIdx, 
            animated: true,
            viewPosition: 0.1, 
          });
        }, 500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, surah, surahId]);

  const loadSurah = useCallback(async () => {
    setLoading(true);
    try {
      // Dynamic require for the surah JSON
      const data = await loadSurahData(surahId);
      setSurah(data);

      // Add to recently viewed
      if (data) {
        addRecentSurah({
          id: data.id,
          name: data.name,
          transliteration: data.transliteration,
          translation: data.translation,
          type: data.type,
          total_verses: data.total_verses,
          timestamp: Date.now(),
        });
      }
    } catch (e) {
      console.error('Failed to load surah:', e);
    } finally {
      setLoading(false);
    }
  }, [surahId, addRecentSurah]);

  useEffect(() => {
    loadSurah();
  }, [loadSurah]);

  const handleBookmarkVerse = useCallback(
    (verse: Verse) => {
      if (!surah) return;
      const isMarked = bookmarks.some(
        (b) => b.surahId === surah.id && b.verseId === verse.id,
      );
      if (isMarked) {
        removeBookmark(surah.id, verse.id);
      } else {
        addBookmark({
          surahId: surah.id,
          verseId: verse.id,
          surahName: surah.transliteration,
          verseText: verse.translation,
          timestamp: Date.now(),
        });
      }
    },
    [surah, bookmarks, addBookmark, removeBookmark],
  );

  const handleSaveVerse = useCallback(
    (verse: Verse) => {
      if (!surah) return;
      const key = `${surah.id}-${verse.id}`;
      const isSaved = savedVerses.some((v) => v.id === key);
      if (isSaved) {
        unsaveVerse(surah.id, verse.id);
      } else {
        saveVerse({
          id: key,
          surahId: surah.id,
          surahName: surah.name,
          surahTransliteration: surah.transliteration,
          verseId: verse.id,
          arabicText: verse.text,
          translation: verse.translation,
          timestamp: Date.now(),
        });
      }
    },
    [surah, savedVerses, saveVerse, unsaveVerse],
  );

  const handleShare = useCallback(
    async (verse: Verse) => {
      if (!surah) return;
      await Share.share({
        message: `${verse.text}\n\n"${verse.translation}"\n\n— ${surah.transliteration} (${surah.id}:${verse.id})`,
      });
    },
    [surah],
  );

  const handleContinueReading = useCallback(() => {
    if (!surah) return;
    // Save reading progress at the middle visible verse
    const midVerse = surah.verses[Math.min(4, surah.verses.length - 1)];
    setLastRead({
      surahId: surah.id,
      surahName: surah.name,
      surahTransliteration: surah.transliteration,
      verseId: midVerse.id,
      timestamp: Date.now(),
    });
  }, [surah, setLastRead]);

  // Track reading progress as user scrolls
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && surah) {
      const lastVisible = viewableItems[viewableItems.length - 1].item as Verse;
      setLastRead({
        surahId: surah.id,
        surahName: surah.name,
        surahTransliteration: surah.transliteration,
        verseId: lastVisible.id,
        timestamp: Date.now(),
      });
    }
  });

  const VerseRow = useMemo(() => React.memo(function VerseRowComponent({ item, isMarked, isSaved }: { item: Verse; isMarked: boolean; isSaved: boolean }) {
    return (
      <View style={[
      styles.verseCard, 
      { 
        backgroundColor: isMarked ? (isDark ? c.surfaceMuted : '#F0F9F6') : c.surface, 
        borderColor: isMarked ? c.primary : c.border,
        borderWidth: isMarked ? 2 : 1
      }
    ]}>
      <View style={styles.verseHeader}>
        <View style={[styles.verseNum, { backgroundColor: isDark ? (isMarked ? c.surface : c.surfaceMuted) : (isMarked ? '#FFFFFF' : '#E6F4EE') }]}>
          <Text style={[styles.verseNumText, { color: isMarked ? c.accent : c.primary }]}>{item.id}</Text>
        </View>
        <View style={styles.verseActions}>
          <Pressable onPress={() => handleBookmarkVerse(item)} hitSlop={8}>
            <Ionicons
              name={isMarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isMarked ? c.accent : c.textMuted}
            />
          </Pressable>
          <Pressable onPress={() => handleSaveVerse(item)} hitSlop={8}>
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={20}
              color={isSaved ? c.accent : c.textMuted}
            />
          </Pressable>
          <Pressable onPress={() => handleShare(item)} hitSlop={8}>
            <Ionicons name="share-social-outline" size={20} color={c.textMuted} />
          </Pressable>
        </View>
      </View>
      <Text style={[styles.arabicVerse, { color: c.text }]}>{item.text}</Text>
      <Text style={[styles.translationText, { color: c.textMuted }]}>{item.translation}</Text>
    </View>
    );
  }), [c, isDark, handleBookmarkVerse, handleSaveVerse, handleShare]);

  const renderVerse = useCallback(
    ({ item }: { item: Verse }) => {
      const isMarked = bookmarks.some(
        (b) => b.surahId === surahId && b.verseId === item.id,
      );
      const isSaved = savedVerses.some(
        (v) => v.id === `${surahId}-${item.id}`,
      );
      return <VerseRow item={item} isMarked={isMarked} isSaved={isSaved} />;
    },
    [bookmarks, savedVerses, surahId, VerseRow],
  );

  if (loading || !surah) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const showBismillah = surah.id !== 9;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.background }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={c.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: c.text }]} numberOfLines={1}>
            {surah.transliteration}
          </Text>
          <View style={styles.headerRight}>
            <View style={[styles.headerLogo, { backgroundColor: isDark ? '#000000' : c.surface }]}>
              <LogoImage size={20} />
            </View>
          </View>
        </View>
      </SafeAreaView>

      <FlatList
        ref={flatListRef}
        data={surah.verses}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderVerse}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        onScrollToIndexFailed={(info) => {
          const offset = info.averageItemLength * info.index;
          flatListRef.current?.scrollToOffset({ offset, animated: false });
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.1 });
          }, 100);
        }}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        ListHeaderComponent={
          <>
            <View style={[styles.infoCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={styles.infoLeft}>
                <Text style={[styles.infoTitle, { color: c.text }]}>{surah.translation}</Text>
                <Text style={[styles.infoSub, { color: c.textMuted }]}>
                  {surah.type.toUpperCase()} {'\u2022'} {surah.total_verses} VERSES
                </Text>
              </View>
              <View style={styles.infoRight}>
                <View style={[styles.audioBadge, { backgroundColor: isDark ? c.surfaceMuted : '#F3F4F6' }]}>
                  <View style={[styles.playCircle, { backgroundColor: isDark ? c.surface : '#E5E7EB' }]}>
                    <Ionicons name="play" size={12} color={c.textMuted} />
                  </View>
                  <View>
                    <Text style={[styles.audioText, { color: c.textMuted }]}>Play{'\n'}Audio</Text>
                  </View>
                </View>
                <Text style={[styles.comingSoon, { color: c.accent }]}>COMING SOON</Text>
              </View>
            </View>

            {/* Bismillah */}
            {showBismillah && (
              <View style={styles.bismillahWrap}>
                <Text style={[styles.bismillahArabic, { color: c.text }]}>
                  بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
                </Text>
                <Text style={[styles.bismillahTranslation, { color: c.textMuted }]}>
                  In the name of Allah, the Entirely Merciful, the Especially Merciful.
                </Text>
              </View>
            )}
          </>
        }
      />

      {/* Continue Reading Floating Button */}
      <SafeAreaView edges={['bottom']} style={styles.floatingWrap}>
        <Pressable
          onPress={handleContinueReading}
          style={({ pressed }) => [
            styles.floatingBtn,
            { backgroundColor: c.primaryDeep },
            pressed && { opacity: 0.9 },
          ]}
        >
          <Ionicons name="book" size={18} color="#FFFFFF" />
          <Text style={styles.floatingText}>CONTINUE READING</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

// Helper to dynamically load surah data
async function loadSurahData(id: number): Promise<SurahData> {
  // Use require with a switch for expo's static analysis
  // This is the recommended pattern for local JSON in Expo/RN
  const surahMap: Record<number, any> = {
    1: require('@/assets/quran/1.json'),
    2: require('@/assets/quran/2.json'),
    3: require('@/assets/quran/3.json'),
    4: require('@/assets/quran/4.json'),
    5: require('@/assets/quran/5.json'),
    6: require('@/assets/quran/6.json'),
    7: require('@/assets/quran/7.json'),
    8: require('@/assets/quran/8.json'),
    9: require('@/assets/quran/9.json'),
    10: require('@/assets/quran/10.json'),
    11: require('@/assets/quran/11.json'),
    12: require('@/assets/quran/12.json'),
    13: require('@/assets/quran/13.json'),
    14: require('@/assets/quran/14.json'),
    15: require('@/assets/quran/15.json'),
    16: require('@/assets/quran/16.json'),
    17: require('@/assets/quran/17.json'),
    18: require('@/assets/quran/18.json'),
    19: require('@/assets/quran/19.json'),
    20: require('@/assets/quran/20.json'),
    21: require('@/assets/quran/21.json'),
    22: require('@/assets/quran/22.json'),
    23: require('@/assets/quran/23.json'),
    24: require('@/assets/quran/24.json'),
    25: require('@/assets/quran/25.json'),
    26: require('@/assets/quran/26.json'),
    27: require('@/assets/quran/27.json'),
    28: require('@/assets/quran/28.json'),
    29: require('@/assets/quran/29.json'),
    30: require('@/assets/quran/30.json'),
    31: require('@/assets/quran/31.json'),
    32: require('@/assets/quran/32.json'),
    33: require('@/assets/quran/33.json'),
    34: require('@/assets/quran/34.json'),
    35: require('@/assets/quran/35.json'),
    36: require('@/assets/quran/36.json'),
    37: require('@/assets/quran/37.json'),
    38: require('@/assets/quran/38.json'),
    39: require('@/assets/quran/39.json'),
    40: require('@/assets/quran/40.json'),
    41: require('@/assets/quran/41.json'),
    42: require('@/assets/quran/42.json'),
    43: require('@/assets/quran/43.json'),
    44: require('@/assets/quran/44.json'),
    45: require('@/assets/quran/45.json'),
    46: require('@/assets/quran/46.json'),
    47: require('@/assets/quran/47.json'),
    48: require('@/assets/quran/48.json'),
    49: require('@/assets/quran/49.json'),
    50: require('@/assets/quran/50.json'),
    51: require('@/assets/quran/51.json'),
    52: require('@/assets/quran/52.json'),
    53: require('@/assets/quran/53.json'),
    54: require('@/assets/quran/54.json'),
    55: require('@/assets/quran/55.json'),
    56: require('@/assets/quran/56.json'),
    57: require('@/assets/quran/57.json'),
    58: require('@/assets/quran/58.json'),
    59: require('@/assets/quran/59.json'),
    60: require('@/assets/quran/60.json'),
    61: require('@/assets/quran/61.json'),
    62: require('@/assets/quran/62.json'),
    63: require('@/assets/quran/63.json'),
    64: require('@/assets/quran/64.json'),
    65: require('@/assets/quran/65.json'),
    66: require('@/assets/quran/66.json'),
    67: require('@/assets/quran/67.json'),
    68: require('@/assets/quran/68.json'),
    69: require('@/assets/quran/69.json'),
    70: require('@/assets/quran/70.json'),
    71: require('@/assets/quran/71.json'),
    72: require('@/assets/quran/72.json'),
    73: require('@/assets/quran/73.json'),
    74: require('@/assets/quran/74.json'),
    75: require('@/assets/quran/75.json'),
    76: require('@/assets/quran/76.json'),
    77: require('@/assets/quran/77.json'),
    78: require('@/assets/quran/78.json'),
    79: require('@/assets/quran/79.json'),
    80: require('@/assets/quran/80.json'),
    81: require('@/assets/quran/81.json'),
    82: require('@/assets/quran/82.json'),
    83: require('@/assets/quran/83.json'),
    84: require('@/assets/quran/84.json'),
    85: require('@/assets/quran/85.json'),
    86: require('@/assets/quran/86.json'),
    87: require('@/assets/quran/87.json'),
    88: require('@/assets/quran/88.json'),
    89: require('@/assets/quran/89.json'),
    90: require('@/assets/quran/90.json'),
    91: require('@/assets/quran/91.json'),
    92: require('@/assets/quran/92.json'),
    93: require('@/assets/quran/93.json'),
    94: require('@/assets/quran/94.json'),
    95: require('@/assets/quran/95.json'),
    96: require('@/assets/quran/96.json'),
    97: require('@/assets/quran/97.json'),
    98: require('@/assets/quran/98.json'),
    99: require('@/assets/quran/99.json'),
    100: require('@/assets/quran/100.json'),
    101: require('@/assets/quran/101.json'),
    102: require('@/assets/quran/102.json'),
    103: require('@/assets/quran/103.json'),
    104: require('@/assets/quran/104.json'),
    105: require('@/assets/quran/105.json'),
    106: require('@/assets/quran/106.json'),
    107: require('@/assets/quran/107.json'),
    108: require('@/assets/quran/108.json'),
    109: require('@/assets/quran/109.json'),
    110: require('@/assets/quran/110.json'),
    111: require('@/assets/quran/111.json'),
    112: require('@/assets/quran/112.json'),
    113: require('@/assets/quran/113.json'),
    114: require('@/assets/quran/114.json'),
  };

  return surahMap[id] as SurahData;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
    marginTop: 8,
  },
  infoLeft: {},
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoSub: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  infoRight: {
    alignItems: 'center',
  },
  audioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    marginBottom: 4,
  },
  playCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  comingSoon: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bismillahWrap: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  bismillahArabic: {
    fontSize: 28,
    lineHeight: 48,
    textAlign: 'center',
    fontWeight: '400',
  },
  bismillahTranslation: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  verseCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verseNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseNumText: {
    fontSize: 13,
    fontWeight: '700',
  },
  verseActions: {
    flexDirection: 'row',
    gap: 14,
  },
  arabicVerse: {
    fontSize: 24,
    lineHeight: 46,
    textAlign: 'right',
    marginBottom: 12,
    fontWeight: '400',
  },
  translationText: {
    fontSize: 14,
    lineHeight: 22,
  },
  floatingWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  floatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    gap: 10,
  },
  floatingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
