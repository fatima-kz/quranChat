import { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { CText, Avatar } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useAuthStore } from '@/store/auth.store';
import { salaamGreeting } from '@/utils/greetings';

import { DailyAyahCard } from '@/features/home/components/DailyAyahCard';
import { AskAICard } from '@/features/home/components/AskAICard';
import { GuidanceForYou } from '@/features/home/components/GuidanceForYou';
import { LatestReflection } from '@/features/home/components/LatestReflection';
import { FloatingAskButton } from '@/features/home/components/FloatingAskButton';

export default function HomeScreen() {
  const c = useThemeColors();
  const haptic = useHaptics();
  const insets = useSafeAreaInsets();
  const profile = useAuthStore((s) => s.profile);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withTiming(0, { duration: 500 });
  }, [opacity, translateY]);

  const firstName = (profile?.full_name || 'friend').split(' ')[0];

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBtn} />
          <CText variant="h3" style={{ color: c.text }}>
            {"Qur'an Chat"}
          </CText>
          <Pressable
            hitSlop={12}
            style={styles.iconBtn}
            onPress={() => { haptic('light'); router.push('/(tabs)/profile'); }}
          >
            <Avatar name={profile?.full_name ?? 'User'} size={32} imageUrl={profile?.avatar_url} />
          </Pressable>
        </View>

        {/* Greeting */}
        <Animated.View entering={FadeInDown.duration(400)} style={{ marginTop: 8, marginBottom: 20 }}>
          <CText variant="caption" style={{ color: c.accent, letterSpacing: 1.5, fontWeight: '700' }}>
            A MOMENT OF PEACE
          </CText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
            <CText variant="h1" style={{ fontSize: 30, lineHeight: 38, color: c.text }}>
              {salaamGreeting('').replace('Assalamu Alaikum', 'Assalamu Alaikum,')}{' '}
            </CText>
            <CText
              variant="h1"
              style={{
                fontSize: 30,
                lineHeight: 38,
                color: c.accent,
                fontFamily: 'SourceSerif4Italic',
                fontStyle: 'italic',
              }}
            >
              {firstName}
            </CText>
          </View>
        </Animated.View>

        <Animated.View style={[{ gap: 18 }, animStyle]}>
          <DailyAyahCard userTopics={profile?.topics ?? null} />
          <AskAICard />
          <GuidanceForYou />
          <LatestReflection />
        </Animated.View>
      </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
