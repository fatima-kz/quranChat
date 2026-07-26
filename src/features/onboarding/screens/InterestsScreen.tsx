import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useOnboardingStore } from '@/store/onboarding.store';
import { ONBOARDING_TOPICS } from '@/constants/prompts';

const TOPIC_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  prayer: 'moon-outline',
  patience: 'leaf-outline',
  gratitude: 'hand-left-outline',
  anxiety: 'cloudy-outline',
  family: 'people-outline',
  forgiveness: 'heart-outline',
  prophets: 'book-outline',
  habits: 'sunny-outline',
};

export default function InterestsScreen() {
  const c = useThemeColors();
  const haptic = useHaptics();
  const insets = useSafeAreaInsets();
  const topics = useOnboardingStore((s) => s.answers.topics);
  const toggleTopic = useOnboardingStore((s) => s.toggleTopic);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withTiming(0, { duration: 500 });
  }, [opacity, translateY]);

  return (
    <View style={{ flex: 1, backgroundColor: c.background, paddingBottom: insets.bottom + 24 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => { haptic('light'); router.back(); }} hitSlop={12} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={26} color={c.text} />
          </Pressable>
          <View style={{ flex: 1, height: 6, borderRadius: 3, marginHorizontal: 16, overflow: 'hidden', backgroundColor: c.border }}>
            <View style={{ height: '100%', borderRadius: 3, backgroundColor: '#064E3B', width: '50%' }} />
          </View>
          <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={12}>
            <Text style={{ color: '#9CA3AF', fontWeight: '700', fontSize: 12 }}>SKIP</Text>
          </Pressable>
        </View>

        {/* Title & options */}
        <Animated.View style={[animStyle, { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }]}>
          <View style={{ gap: 8, marginBottom: 22 }}>
            <Text style={{ fontSize: 28, lineHeight: 36, fontWeight: '700', color: '#1F2937' }}>
              What would you like to focus on?
            </Text>
            <Text style={{ fontSize: 16, lineHeight: 22, color: '#6B7280' }}>
              Select all that apply.
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            {ONBOARDING_TOPICS.map((t) => {
              const selected = topics.includes(t.id);
              const iconName = TOPIC_ICONS[t.id] || 'ellipse-outline';
              return (
                <View
                  key={t.id}
                  style={{
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: selected ? '#064E3B' : '#E5E5E5',
                    backgroundColor: selected ? '#E6F4EE' : '#FFFFFF',
                    overflow: 'hidden',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      haptic('selection');
                      toggleTopic(t.id);
                    }}
                    activeOpacity={0.85}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selected ? '#C8E6D8' : '#F3F4F6',
                        marginRight: 14,
                      }}
                    >
                      <Ionicons name={iconName} size={20} color={selected ? '#064E3B' : '#6B7280'} />
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#1F2937',
                      }}
                    >
                      {t.label}
                    </Text>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor: selected ? '#064E3B' : '#D1D5DB',
                        backgroundColor: selected ? '#064E3B' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {selected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Sticky bottom */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={{ paddingHorizontal: 24, paddingTop: 12, backgroundColor: c.background }}
      >
        <View
          style={{
            width: '100%',
            height: 56,
            borderRadius: 14,
            backgroundColor: '#064E3B',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 4,
            opacity: topics.length === 0 ? 0.5 : 1,
          }}
        >
          <TouchableOpacity
                    onPress={() => router.push('/(setup)/profile')}
            disabled={topics.length === 0}
            activeOpacity={0.85}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 17, marginRight: 10 }}>
              Continue
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={{ marginTop: 14, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>
          Step 2 of 3
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
