import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP } from '@/constants/app';
import { useAuthStore } from '@/store/auth.store';
import { useOnboardingStore } from '@/store/onboarding.store';
import { LogoImage } from '@/components/ui';
import { useFonts } from '@/hooks/useFonts';
import { palette } from '@/theme';

export default function SplashScreen() {
  const insets = useSafeAreaInsets();

  // Logo card animations
  const cardScale = useSharedValue(0.6);
  const cardOpacity = useSharedValue(0);
  const cardRotateZ = useSharedValue(-8);

  // Text animations
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  // Bottom loader
  const bottomOpacity = useSharedValue(0);

  const ready = useAuthStore((s) => s.ready);
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const onboardingDone = useOnboardingStore((s) => s.done);
  const fontsLoaded = useFonts();

  // Logo card animated style
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { scale: cardScale.value },
      { rotate: `${cardRotateZ.value}deg` },
    ],
  }));

  // Text animated style
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  // Bottom animated style
  const bottomStyle = useAnimatedStyle(() => ({
    opacity: bottomOpacity.value,
  }));

  useEffect(() => {
    // Card: bounce in with rotation
    cardOpacity.value = withTiming(1, { duration: 600 });
    cardScale.value = withSequence(
      withSpring(1.08, { damping: 8, stiffness: 120 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    );
    cardRotateZ.value = withSequence(
      withTiming(3, { duration: 400, easing: Easing.out(Easing.ease) }),
      withSpring(0, { damping: 10, stiffness: 150 }),
    );

    // Text: fade up after card lands
    textOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(500, withSpring(0, { damping: 14, stiffness: 120 }));

    // Bottom loader: fade in last
    bottomOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
  }, [cardOpacity, cardScale, cardRotateZ, textOpacity, textTranslateY, bottomOpacity]);

  useEffect(() => {
    if (!ready || !fontsLoaded) return;
    const t = setTimeout(() => {
      if (!onboardingDone) router.replace('/(onboarding)/welcome');
      else if (!session) router.replace('/(auth)/login');
      else if (!profile?.full_name) router.replace('/(setup)/profile');
      else router.replace('/(tabs)/home');
    }, 2200);
    return () => clearTimeout(t);
  }, [ready, fontsLoaded, onboardingDone, session, profile]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 32 }]}>
      {/* Center content */}
      <View style={styles.center}>
        {/* Animated logo card */}
        <Animated.View style={[styles.card, cardStyle]}>
          <LogoImage size={140} />
        </Animated.View>

        {/* App name & tagline */}
        <Animated.View style={textStyle}>
          <Text style={styles.title}>{APP.name}</Text>
          <Text style={styles.tagline}>{APP.tagline}</Text>
        </Animated.View>
      </View>

      {/* Bottom loader */}
      <Animated.View style={[styles.bottom, bottomStyle]}>
        <ActivityIndicator size="small" color="#064E3B" />
        <Text style={styles.loadingText}>LOADING</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.tertiary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: 220,
    height: 220,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 6,
    marginBottom: 28,
  },
  title: {
    fontSize: 36,
    lineHeight: 42,
    color: palette.primary,
    textAlign: 'center',
    fontWeight: '700',
  },
  tagline: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    color: palette.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 24,
  },
  bottom: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    letterSpacing: 6,
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
  },
});
