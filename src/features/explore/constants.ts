import { ONBOARDING_TOPICS } from '@/constants/prompts';

export const POPULAR_QUESTIONS = [
  "How can I improve my Khushu in Salah?",
  "How does the Qur'an help with anxiety and worry?",
  "How can I strengthen my iman (faith)?",
  "What does the Qur'an say about dealing with hardship?",
  "How do I seek forgiveness from Allah?",
  "What does the Qur'an teach about patience?",
  "How can I be more grateful in my daily life?",
  "What are the qualities of a believer in the Qur'an?",
];

export function getDailyPopularQuestions(): string[] {
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const shuffled = [...POPULAR_QUESTIONS].sort((a, b) => {
    const ha = (a.charCodeAt(0) * day) % POPULAR_QUESTIONS.length;
    const hb = (b.charCodeAt(0) * day) % POPULAR_QUESTIONS.length;
    return ha - hb;
  });
  return shuffled.slice(0, 4);
}

const ALL_TOPIC_CARDS = [
  { id: 'prayer', title: 'Prayer', icon: 'time-outline' as const, query: 'Prayer and connection with Allah (Salah)' },
  { id: 'patience', title: 'Patience', icon: 'hourglass-outline' as const, query: 'Patience and endurance (Sabr)' },
  { id: 'gratitude', title: 'Gratitude', icon: 'heart-outline' as const, query: 'Gratitude and thankfulness (Shukr)' },
  { id: 'anxiety', title: 'Anxiety', icon: 'leaf-outline' as const, query: 'Anxiety and finding peace' },
  { id: 'family', title: 'Family Ties', icon: 'people-outline' as const, query: 'Family ties and kinship' },
  { id: 'forgiveness', title: 'Forgiveness', icon: 'hand-left-outline' as const, query: 'Forgiveness and mercy' },
  { id: 'prophets', title: 'Prophets', icon: 'book-outline' as const, query: 'Stories of the Prophets' },
  { id: 'habits', title: 'Daily Habits', icon: 'sunny-outline' as const, query: 'Daily habits and spiritual routines' },
  { id: 'mindfulness', title: 'Mindfulness', icon: 'eye-outline' as const, query: 'Mindfulness and presence of heart' },
  { id: 'charity', title: 'Charity', icon: 'wallet-outline' as const, query: 'Charity and giving (Sadaqah)' },
  { id: 'ethics', title: 'Ethics', icon: 'shield-outline' as const, query: 'Good character and ethics (Akhlaq)' },
  { id: 'hope', title: 'Hope', icon: 'star-outline' as const, query: 'Hope and trust in Allah (Tawakkul)' },
];

const DEFAULT_TOPICS = ['patience', 'gratitude', 'family', 'prayer', 'anxiety', 'forgiveness'];

export function getExploreTopics(userTopics: string[] | null): typeof ALL_TOPIC_CARDS {
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  let topicIds: string[];

  if (userTopics && userTopics.length > 0) {
    const rotated = [...userTopics];
    for (let i = 0; i < ALL_TOPIC_CARDS.length; i++) {
      const t = ALL_TOPIC_CARDS[i].id;
      if (!rotated.includes(t)) rotated.push(t);
    }
    const offset = day % rotated.length;
    topicIds = [...rotated.slice(offset), ...rotated.slice(0, offset)].slice(0, 6);
  } else {
    const offset = day % DEFAULT_TOPICS.length;
    topicIds = [...DEFAULT_TOPICS.slice(offset), ...DEFAULT_TOPICS.slice(0, offset)];
  }

  return topicIds
    .map((id) => ALL_TOPIC_CARDS.find((t) => t.id === id))
    .filter(Boolean) as typeof ALL_TOPIC_CARDS;
}
