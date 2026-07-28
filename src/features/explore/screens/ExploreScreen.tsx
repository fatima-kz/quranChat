import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CText, Avatar } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme.store';
import { useHaptics } from '@/hooks/useHaptics';
import { useQuranStore } from '@/store/quran.store';
import { useAskQuestion } from '@/features/home/hooks/useAskQuestion';
import { getHijriDate } from '@/utils/hijri';
import { getExploreTopics } from '@/features/explore/constants';
import { useAuthStore } from '@/store/auth.store';

export default function ExploreScreen() {
  const c = useThemeColors();
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  const haptic = useHaptics();
  const streakCount = useQuranStore((s) => s.streakCount);
  const hijriDate = getHijriDate();
  const profile = useAuthStore((s) => s.profile);
  const exploreTopics = getExploreTopics(profile?.topics ?? null);
  const ask = useAskQuestion();

  const handleHeroTap = () => {
    haptic('light');
    router.push('/prophets');
  };

  const handleStreakAlert = () => {
    haptic('light');
    Alert.alert(
      'Reading Streak',
      'Your streak increases every day you read a Surah or chat with the AI. Read every day to keep it alive!',
      [{ text: 'Got it' }]
    );
  };

  const handleQiblahTap = () => {
    haptic('light');
    router.push('/qiblah');
  };

  const handleTopicTap = (topicQuery: string) => {
    ask(`What does the Qur'an say about ${topicQuery}?`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <CText variant="h2" style={{ color: c.text }}>Explore</CText>
            <CText variant="caption" style={{ color: c.textMuted, marginTop: 2 }}>{hijriDate}</CText>
          </View>
          <Pressable
            hitSlop={12}
            style={styles.iconBtn}
            onPress={() => { haptic('light'); router.push('/(tabs)/profile'); }}
          >
            <Avatar name={profile?.full_name ?? 'User'} size={36} imageUrl={profile?.avatar_url} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <Pressable
          style={[styles.searchBar, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={() => { haptic('light'); router.push('/search'); }}
        >
          <Ionicons name="search" size={20} color={c.textMuted} />
          <CText style={{ color: c.textMuted, marginLeft: 12, flex: 1 }}>
            Search surahs, topics, or verses...
          </CText>
        </Pressable>

        {/* Reading Streak Card */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Pressable
            style={[styles.streakCard, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={handleStreakAlert}
          >
            <View style={[styles.streakIconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Ionicons name="flame" size={24} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <CText variant="h3" style={{ color: c.text, fontSize: 18 }}>
                {streakCount} day streak
              </CText>
              <CText variant="caption" style={{ color: c.textMuted, marginTop: 4 }}>
                Read every day to keep your streak alive
              </CText>
            </View>
            <Ionicons name="information-circle-outline" size={20} color={c.textMuted} />
          </Pressable>
        </Animated.View>

        {/* Qiblah Compass Card */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <Pressable
            style={({ pressed }) => [
              pressed && { opacity: 0.8 }
            ]}
            onPress={handleQiblahTap}
          >
            <View style={[styles.streakCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={[styles.streakIconWrap, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
                <Ionicons name="compass" size={26} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <CText variant="h3" style={{ color: c.text, fontSize: 18 }}>
                  Qiblah Compass
                </CText>
                <CText variant="caption" style={{ color: c.textMuted, marginTop: 4 }}>
                  Find the direction to Mecca
                </CText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
            </View>
          </Pressable>
        </Animated.View>

        {/* Hero Card: Stories of the Prophets */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Pressable
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
            onPress={handleHeroTap}
          >
            <View style={[styles.heroCard, { backgroundColor: isDark ? '#064E3B' : '#065F46' }]}>
              <View style={styles.heroOverlay} />
              <View style={{ padding: 24 }}>
                <Ionicons name="map" size={32} color="#FDE68A" style={{ marginBottom: 16 }} />
                <CText serif variant="h2" style={{ color: '#fff', fontSize: 26, marginBottom: 8 }}>
                  {"Stories of the Prophets"}
                </CText>
                <CText style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 24, lineHeight: 22 }}>
                  {"Discover the lives and divine missions of Allah's messengers."}
                </CText>
                <View style={styles.heroBtn}>
                  <CText style={{ color: '#064E3B', fontWeight: '700', fontSize: 15 }}>Begin Journey</CText>
                  <Ionicons name="arrow-forward" size={16} color="#064E3B" />
                </View>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Explore Topics Grid */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <CText serif variant="h2" style={{ color: c.text, marginBottom: 16 }}>
            Explore Topics
          </CText>
          
          <View style={styles.topicGrid}>
            {exploreTopics.map((topic) => (
              <View key={topic.id} style={{ width: '48%', marginBottom: 16 }}>
                <Pressable
                  onPress={() => handleTopicTap(topic.query)}
                  style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                >
                  <View style={[styles.topicCard, { backgroundColor: c.surface, borderColor: isDark ? '#374151' : '#F3F4F6' }]}>
                    <Ionicons name={topic.icon} size={24} color="#065F46" style={{ marginBottom: 24 }} />
                    <CText style={{ color: c.text, fontWeight: '700', fontSize: 16, marginBottom: 4 }}>
                      {topic.title}
                    </CText>
                    <CText variant="caption" style={{ color: c.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
                      EXPLORE
                    </CText>
                  </View>
                </Pressable>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    marginBottom: 24,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    gap: 16,
  },
  streakIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'flex-start',
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    height: 140,
    justifyContent: 'flex-end',
  },
});
