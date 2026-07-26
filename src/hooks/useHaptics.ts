import * as Haptics from 'expo-haptics';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection';

const impact: Record<HapticPattern, Haptics.ImpactFeedbackStyle> = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
  success: Haptics.ImpactFeedbackStyle.Medium,
  error: Haptics.ImpactFeedbackStyle.Heavy,
  selection: Haptics.ImpactFeedbackStyle.Light,
};

export function useHaptics() {
  return (pattern: HapticPattern = 'light') => {
    if (pattern === 'success' || pattern === 'error') {
      Haptics.notificationAsync(
        pattern === 'success'
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error,
      );
      return;
    }
    Haptics.impactAsync(impact[pattern]);
  };
}
