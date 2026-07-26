import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '@/components/layout';
import { CText } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useOnboardingStore, saveOnboardingAnswers } from '@/store/onboarding.store';

const QUOTE = {
  arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
  english: '"For indeed, with hardship [will be] ease."',
  reference: 'SURAH ASH-SHARH 94:5',
};

const LOADING_MESSAGES = ['Curating verses for you…', 'Preparing reflections…', 'Almost there…'];

export default function LoadingScreen() {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const [mi, setMi] = useState(0);

  const rotate = useSharedValue(0);
  const progress = useSharedValue(0);
  const quoteOpacity = useSharedValue(0);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const quoteCardStyle = useAnimatedStyle(() => ({
    opacity: quoteOpacity.value,
  }));

  useEffect(() => {
    const { answers, setDone } = useOnboardingStore.getState();
    saveOnboardingAnswers(answers);
    setDone(true);

    rotate.value = withRepeat(
      withTiming(360, { duration: 1800, easing: Easing.linear }),
      -1,
      false,
    );
    progress.value = withTiming(1, { duration: 2400 });
    quoteOpacity.value = withDelay(300, withTiming(1, { duration: 700 }));

    const nav = setTimeout(() => router.replace('/(auth)/login'), 2800);
    return () => clearTimeout(nav);
  }, [rotate, progress, quoteOpacity]);

  useEffect(() => {
    const id = setInterval(() => setMi((i) => (i + 1) % LOADING_MESSAGES.length), 800);
    return () => clearInterval(id);
  }, []);

  return (
    <Screen noPadding style={{ backgroundColor: c.background }}>
      <View style={[styles.container, { paddingTop: insets.top + 80, paddingBottom: insets.bottom + 40 }]}>
        {/* Spinner */}
        <View style={styles.spinnerWrap}>
          <Animated.View style={[styles.spinnerRing, { borderColor: c.primary }, ringStyle]} />
          <View style={[styles.spinnerInner, { backgroundColor: c.surfaceMuted }]}>
            <Ionicons name="sparkles" size={32} color={c.primary} />
          </View>
        </View>

        {/* Headlines */}
        <View style={styles.textWrap}>
          <CText variant="h1" style={{ textAlign: 'center', color: c.text }}>
            Personalizing your experience...
          </CText>
          <CText variant="body" muted style={{ textAlign: 'center', marginTop: 8 }}>
            Creating your sacred digital sanctuary
          </CText>
        </View>

        {/* Quote card */}
        <Animated.View style={[styles.quoteCard, { backgroundColor: c.surface, shadowColor: c.text }, quoteCardStyle]}>
          <CText variant="h2" style={{ color: c.accent, textAlign: 'center' }}>
            ”
          </CText>
          <CText variant="h2" style={{ color: c.primary, textAlign: 'center', marginTop: 8, fontSize: 24, lineHeight: 36 }}>
            {QUOTE.arabic}
          </CText>
          <CText
            variant="body"
            style={{
              color: c.text,
              textAlign: 'center',
              marginTop: 14,
              fontFamily: 'SourceSerif4Italic',
              fontStyle: 'italic',
            }}
          >
            {QUOTE.english}
          </CText>
          <View style={styles.referenceRow}>
            <View style={[styles.line, { backgroundColor: c.border }]} />
            <CText variant="caption" style={{ color: c.textMuted, letterSpacing: 2 }}>
              {QUOTE.reference}
            </CText>
            <View style={[styles.line, { backgroundColor: c.border }]} />
          </View>
        </Animated.View>

        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
            <Animated.View style={[styles.progressFill, { backgroundColor: c.primary }, barStyle]} />
          </View>
          <CText variant="caption" muted style={{ marginTop: 12, textAlign: 'center' }}>
            {LOADING_MESSAGES[mi]}
          </CText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  spinnerWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  spinnerInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { marginTop: 32, alignItems: 'center', paddingHorizontal: 16 },
  quoteCard: {
    width: '100%',
    marginTop: 36,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 12,
  },
  line: { flex: 1, height: 1 },
  progressWrap: {
    width: '100%',
    marginTop: 'auto',
    paddingHorizontal: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
