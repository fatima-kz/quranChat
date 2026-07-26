import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  onboardingDone: '@quranchat:onboarding',
  themePreference: '@quranchat:theme',
  pendingProfile: '@quranchat:pendingProfile',
  onboardingAnswers: '@quranchat:onboardingAnswers',
} as const;

export const storage = {
  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async setJSON(key: string, value: unknown): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
  KEYS,
};
