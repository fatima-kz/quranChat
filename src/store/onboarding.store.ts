import { create } from 'zustand';

import { storage } from '@/lib/storage';
import type { Gender } from '@/types';

type OnboardingAnswers = {
  goal: string | null;
  topics: string[];
};

type OnboardingState = {
  answers: OnboardingAnswers;
  done: boolean;
  setGoal: (goal: string) => void;
  toggleTopic: (topic: string) => void;
  setDone: (done: boolean) => void;
  hydrate: () => Promise<void>;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  answers: { goal: null, topics: [] },
  done: false,
  setGoal: (goal) => set((s) => ({ answers: { ...s.answers, goal } })),
  toggleTopic: (topic) =>
    set((s) => {
      const has = s.answers.topics.includes(topic);
      const topics = has
        ? s.answers.topics.filter((t) => t !== topic)
        : [...s.answers.topics, topic];
      return { answers: { ...s.answers, topics } };
    }),
  setDone: (done) => {
    set({ done });
    storage.setJSON(storage.KEYS.onboardingDone, done);
  },
  hydrate: async () => {
    const [done, answers] = await Promise.all([
      storage.getJSON<boolean>(storage.KEYS.onboardingDone),
      storage.getJSON<OnboardingAnswers>(storage.KEYS.onboardingAnswers),
    ]);
    set({ done: Boolean(done), answers: answers ?? get().answers });
  },
}));

export type PendingProfile = {
  full_name: string;
  age: string;
  gender: Gender | '';
};

export async function saveOnboardingAnswers(answers: OnboardingAnswers) {
  await storage.setJSON(storage.KEYS.onboardingAnswers, answers);
}

export async function getPendingProfile(): Promise<PendingProfile | null> {
  return storage.getJSON<PendingProfile>(storage.KEYS.pendingProfile);
}

export async function savePendingProfile(profile: PendingProfile) {
  await storage.setJSON(storage.KEYS.pendingProfile, profile);
}
