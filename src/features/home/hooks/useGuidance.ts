import { useQuery } from '@tanstack/react-query';

import { api } from '@/config/api';
import { ONBOARDING_TOPICS } from '@/constants/prompts';

function getDayOfYear() {
  return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
}

const FALLBACK_QUESTIONS = [
  "What does the Qur'an say about finding inner peace?",
  'How can I strengthen my connection with Allah?',
  'What lessons can I learn from the Prophets?',
];

export type GuidanceItem = {
  icon: 'bulb-outline' | 'heart-outline' | 'people-outline';
  question: string;
  label: string;
};

const ICONS: GuidanceItem['icon'][] = ['bulb-outline', 'heart-outline', 'people-outline'];

export function useGuidance(topics: string[] | null) {
  return useQuery({
    queryKey: ['guidance', topics ?? [], getDayOfYear()],
    queryFn: async (): Promise<GuidanceItem[]> => {
      const topicLabels = (topics ?? [])
        .map((t) => ONBOARDING_TOPICS.find((x) => x.id === t)?.label)
        .filter(Boolean);

      try {
        const res = await fetch(`${api.baseUrl.replace(/\/$/, '')}/api/guidance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topics: topicLabels, day: getDayOfYear() }),
        });

        if (!res.ok) throw new Error('Failed to fetch guidance');

        const data = (await res.json()) as { questions?: string[] };
        const questions = data.questions?.slice(0, 3) ?? FALLBACK_QUESTIONS;

        return questions.map((q, i) => ({
          icon: ICONS[i % ICONS.length],
          question: q,
          label: q.length > 50 ? q.slice(0, 47) + '...' : q,
        }));
      } catch {
        return FALLBACK_QUESTIONS.map((q, i) => ({
          icon: ICONS[i % ICONS.length],
          question: q,
          label: q.length > 50 ? q.slice(0, 47) + '...' : q,
        }));
      }
    },
    staleTime: 1000 * 60 * 60,
  });
}
