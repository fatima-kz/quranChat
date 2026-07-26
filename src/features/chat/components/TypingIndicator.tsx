import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useThemeColors } from '@/hooks/useTheme';

export function TypingIndicator() {
  const c = useThemeColors();

  return (
    <View style={styles.wrap}>
      <View style={[styles.bubble, { backgroundColor: c.surface, borderColor: c.border }]}>
        {[0, 1, 2].map((i) => (
          <Dot key={i} delay={i * 180} color={c.textMuted} />
        ))}
      </View>
    </View>
  );
}

function Dot({ delay, color }: { delay: number; color: string }) {
  const opacity = useSharedValue(0.35);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 360, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.35, { duration: 360, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.25, { duration: 360, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 360, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[styles.dot, { backgroundColor: color }, animStyle]} />;
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    marginVertical: 6,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
