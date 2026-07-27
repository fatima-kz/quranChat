import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme.store';
import { useQuranStore } from '@/store/quran.store';
import { CText, LogoImage } from '@/components/ui';
import { allSurahs, type SurahMeta } from '@/features/quran/api/quran-data';

export default function QuranScreen() {
  const c = useThemeColors();
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  const lastRead = useQuranStore((s) => s.lastRead);
  const recentSurahs = useQuranStore((s) => s.recentSurahs);
  const hydrated = useQuranStore((s) => s.hydrated);
  const hydrate = useQuranStore((s) => s.hydrate);
  const bookmarks = useQuranStore((s) => s.bookmarks);
  const bookmarkedSurahIds = useMemo(() => new Set(bookmarks.map(b => b.surahId)), [bookmarks]);

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allSurahs;
    const q = search.toLowerCase().trim();
    return allSurahs.filter(
      (s) =>
        s.transliteration.toLowerCase().includes(q) ||
        s.translation.toLowerCase().includes(q) ||
        s.id.toString() === q ||
        s.name.includes(q),
    );
  }, [search]);

  const navigateToSurah = useCallback((id: number) => {
    router.push({ pathname: '/(tabs)/quran/[id]' as any, params: { id: String(id) } });
  }, []);

  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      if (filtered.length === allSurahs.length && bookmarkedSurahIds.size > 0) {
        const idx = filtered.findIndex((s) => bookmarkedSurahIds.has(s.id));
        if (idx >= 0) {
          const timeout = setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.2 });
          }, 100);
          return () => clearTimeout(timeout);
        }
      }
    }, [filtered.length, bookmarkedSurahIds, allSurahs.length])
  );

  const renderSurahRow = useCallback(
    ({ item }: { item: SurahMeta }) => {
      const isBookmarked = bookmarkedSurahIds.has(item.id);
      return (
        <Pressable
          onPress={() => navigateToSurah(item.id)}
          style={({ pressed }) => [
            { opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <View style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
            },
            isBookmarked ? {
              backgroundColor: isDark ? 'rgba(60,185,158,0.15)' : '#E6F4EE',
              borderRadius: 16,
              paddingHorizontal: 16,
              marginVertical: 8,
              borderBottomWidth: 0,
              shadowColor: isDark ? '#000' : '#064E3B',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            } : {
              borderBottomWidth: 1,
              borderBottomColor: isDark ? '#4B5563' : '#D4C4A8',
              backgroundColor: c.background,
            }
          ]}>
            {/* Left Side: Number & Info */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.numberCircle, { borderColor: isBookmarked ? c.accent : c.primary }]}>
                <Text style={[styles.numberText, { color: isBookmarked ? c.accent : c.primary }]}>{item.id}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.surahName, { color: c.text }]}>{item.transliteration}</Text>
                <Text style={[styles.surahSub, { color: c.textMuted }]}>
                  {item.translation} {'\u2022'} {item.total_verses} Verses
                </Text>
              </View>
            </View>

          {/* Arabic name & type badge */}
          <View style={styles.surahRight}>
            <Text style={[styles.arabicName, { color: c.text }]}>{item.name}</Text>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor: item.type === 'meccan'
                    ? (isDark ? 'rgba(60,185,158,0.15)' : '#E6F4EE')
                    : (isDark ? 'rgba(212,175,55,0.15)' : '#FEF3C7'),
                },
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  {
                    color: item.type === 'meccan'
                      ? c.primary
                      : c.accent,
                  },
                ]}
              >
                {item.type.toUpperCase()}
              </Text>
            </View>
          </View>
          </View>
        </Pressable>
      );
    },
    [c, isDark, navigateToSurah, bookmarkedSurahIds],
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.background }}>
        <View style={styles.header}>
          <CText variant="h2" style={{ color: c.text }}>Read Quran</CText>
        </View>
      </SafeAreaView>

      <FlatList
        ref={flatListRef}
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSurahRow}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        onScrollToIndexFailed={(info) => {
          // Average row height is around 80. Add header offset (around 300)
          const offset = 300 + (80 * info.index);
          flatListRef.current?.scrollToOffset({ offset, animated: false });
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.2 });
          }, 100);
        }}
        ListHeaderComponent={
          <>
            {/* Continue Reading Banner */}
            {lastRead && (
              <Pressable
                onPress={() => navigateToSurah(lastRead.surahId)}
                style={({ pressed }) => [
                  styles.continueCard,
                  { backgroundColor: c.primaryDeep },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <View style={styles.continueContent}>
                  <Text style={styles.continueLabel}>CONTINUE READING</Text>
                  <Text style={styles.continueSurah}>{lastRead.surahTransliteration}</Text>
                  <Text style={styles.continueAyah}>
                    Ayah {lastRead.verseId}
                  </Text>
                  <View style={styles.continueBtn}>
                    <Text style={styles.continueBtnText}>CONTINUE</Text>
                    <Ionicons name="arrow-forward" size={16} color="#1F2937" />
                  </View>
                </View>
                <View style={styles.continueLogoWrap}>
                  <LogoImage size={64} />
                </View>
              </Pressable>
            )}

            {/* Recently Viewed */}
            {recentSurahs.length > 0 && (
              <View style={[styles.section, {
                backgroundColor: isDark ? 'rgba(60,185,158,0.15)' : '#E6F4EE',
                borderRadius: 20,
                paddingVertical: 16,
                paddingLeft: 20,
                marginHorizontal: -20, // stretch to screen edges to accommodate FlatList padding, or just inset it
                shadowColor: isDark ? '#000' : '#064E3B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
                marginBottom: 24,
              }]}>
                <View style={[styles.sectionHeader, { paddingRight: 20 }]}>
                  <CText serif variant="h3" style={{ color: c.text }}>Recently Viewed</CText>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, paddingRight: 28 }}
                >
                  {recentSurahs.slice(0, 5).map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() => navigateToSurah(s.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                    >
                      <View style={[
                        styles.recentCard,
                        {
                          backgroundColor: c.surface,
                          borderColor: c.border,
                        }
                      ]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={[styles.recentNum, { borderColor: c.primary, backgroundColor: isDark ? c.surface : '#FFFFFF' }]}>
                          <Text style={[styles.recentNumText, { color: c.primary }]}>
                            {s.id}
                          </Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                          <Text style={[styles.recentName, { color: c.text }]} numberOfLines={1}>
                            {s.transliteration}
                          </Text>
                          <Text style={[styles.recentSub, { color: c.textMuted }]} numberOfLines={1}>
                            {s.translation} {'\u2022'} {s.total_verses} Verses
                          </Text>
                        </View>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* All Surahs header + search */}
            <View style={[styles.section, { marginBottom: 8 }]}>
              <CText serif variant="h3" style={{ color: c.text, marginBottom: 12 }}>
                All Surahs
              </CText>
              <View style={[styles.searchBar, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Ionicons name="search-outline" size={20} color={c.textMuted} />
                <TextInput
                  style={[styles.searchInput, { color: c.text }]}
                  placeholder="Search Surah by name or number..."
                  placeholderTextColor={c.textMuted}
                  value={search}
                  onChangeText={setSearch}
                  autoCorrect={false}
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color={c.textMuted} />
                  </Pressable>
                )}
              </View>
            </View>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  continueCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  continueContent: {
    flex: 1,
  },
  continueLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  continueSurah: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  continueAyah: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 14,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  continueBtnText: {
    color: '#1F2937',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  continueLogoWrap: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentCard: {
    width: 220,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  recentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentNumText: {
    fontSize: 14,
    fontWeight: '700',
  },
  recentName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  recentSub: {
    fontSize: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  numberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  surahSub: {
    fontSize: 12,
  },
  surahRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  arabicName: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
