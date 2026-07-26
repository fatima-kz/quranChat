import { Appearance, AppState } from 'react-native';
import { create } from 'zustand';

import { storage } from '@/lib/storage';
import { colors, type ThemeColors } from '@/theme';

type ThemePref = 'light' | 'dark' | 'system';

type ThemeState = {
  preference: ThemePref;
  resolved: 'light' | 'dark';
  hydrated: boolean;
  setPreference: (pref: ThemePref) => void;
  hydrate: () => Promise<void>;
};

function systemScheme(): 'light' | 'dark' {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

function resolve(pref: ThemePref): 'light' | 'dark' {
  return pref === 'system' ? systemScheme() : pref;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: 'system',
  resolved: 'light',
  hydrated: false,
  setPreference: (preference) => {
    const resolved = resolve(preference);
    set({ preference, resolved });
    storage.setJSON(storage.KEYS.themePreference, preference);
    if (preference !== 'system') {
      Appearance.setColorScheme(preference);
    } else {
      Appearance.setColorScheme(null as any);
    }
  },
  hydrate: async () => {
    const pref = await storage.getJSON<ThemePref>(storage.KEYS.themePreference);
    const preference = pref ?? 'system';
    set({ preference, resolved: resolve(preference), hydrated: true });
  },
}));

export function useThemeColors(): ThemeColors {
  const resolved = useThemeStore((s) => s.resolved);
  return colors[resolved];
}

let appStateListener: { remove: () => void } | null = null;
export function startThemeSync() {
  if (appStateListener) return;
  appStateListener = AppState.addEventListener('change', () => {
    const { preference, resolved } = useThemeStore.getState();
    if (preference === 'system') {
      const newResolved = systemScheme();
      if (newResolved !== resolved) {
        useThemeStore.setState({ resolved: newResolved });
      }
    }
  });
}
