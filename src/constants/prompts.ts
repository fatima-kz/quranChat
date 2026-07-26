export const QURAN_SYSTEM_PROMPT = `You are Quran Chat, an AI assistant helping users understand the Qur'an.

Guidelines:
- Base answers on the Qur'an.
- If referencing a verse, only cite it if you are confident it is correct.
- If you are unsure of an exact verse reference, say so rather than guessing.
- Do not fabricate Surah or Ayah numbers.
- Do not issue fatwas or definitive religious rulings.
- Encourage consulting qualified scholars for complex jurisprudence.
- Be compassionate, clear, and concise.

Formatting rules — VERY IMPORTANT:
- Do NOT use any markdown formatting. No bold, no italics, no headers, no bullet points, no backticks.
- Write in plain text only. Use simple paragraphs separated by blank lines.
- When you cite a verse, put the reference on its own final line in this exact format:
Qur'an <SurahNumber>:<AyahNumber>
- Do not surround the reference in asterisks or any formatting.
- If no specific verse applies, do not include a reference line. Never invent references.`;

export function buildSystemPromptWithContext(userContext: {
  name?: string | null;
  goal?: string | null;
  topics?: string[] | null;
}): string {
  const goalLabel = ONBOARDING_GOALS.find((g) => g.id === userContext.goal)?.label;
  const topicLabels = (userContext.topics ?? [])
    .map((t) => ONBOARDING_TOPICS.find((x) => x.id === t)?.label)
    .filter(Boolean);

  const contextParts: string[] = [];
  if (userContext.name) contextParts.push(`The user's name is ${userContext.name}.`);
  if (goalLabel) contextParts.push(`Their primary goal is: ${goalLabel.toLowerCase()}.`);
  if (topicLabels.length > 0) contextParts.push(`They are especially interested in: ${topicLabels.join(', ').toLowerCase()}.`);

  if (contextParts.length === 0) return QURAN_SYSTEM_PROMPT;

  return `${QURAN_SYSTEM_PROMPT}

User context (keep this subtly in mind — do not make it the focus of every answer, but let it gently shape your responses):
${contextParts.join('\n')}`;
}

export const ONBOARDING_GOALS = [
  { id: 'learn', label: 'Learn about the Qur’an', emoji: '📖' },
  { id: 'faith', label: 'Strengthen my faith', emoji: '❤️' },
  { id: 'peace', label: 'Find inner peace', emoji: '🧘' },
  { id: 'questions', label: 'Ask Islamic questions', emoji: '❓' },
] as const;

export const ONBOARDING_TOPICS = [
  { id: 'prayer', label: 'Prayer' },
  { id: 'patience', label: 'Patience' },
  { id: 'gratitude', label: 'Gratitude' },
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'family', label: 'Family' },
  { id: 'forgiveness', label: 'Forgiveness' },
  { id: 'prophets', label: 'Prophets' },
  { id: 'habits', label: 'Daily Habits' },
] as const;

export const DEFAULT_SUGGESTED_QUESTIONS = [
  'Explain Surah Al-Fatihah',
  'Tell me about Prophet Yusuf',
  'Help me understand this verse',
];

const TOPIC_QUESTIONS: Record<string, string[]> = {
  prayer: ['How can I improve my prayers (salah)?', 'What does the Qur\'an say about prayer?'],
  patience: ['What does Islam say about patience?', 'Which verses help with being patient?'],
  gratitude: ['How can I be more grateful (shukr)?', 'What does the Qur\'an say about gratitude?'],
  anxiety: ['Which verses help with anxiety and worry?', 'How can the Qur\'an calm my heart?'],
  family: ['What does the Qur\'an say about family ties?', 'How to be a better parent in Islam?'],
  forgiveness: ['What does Allah say about forgiveness?', 'How do I seek forgiveness from Allah?'],
  prophets: ['Tell me about Prophet Yusuf', 'What can I learn from Prophet Musa?'],
  habits: ['How to build good daily habits in Islam?', 'What are the best daily adhkar?'],
};

export function getPersonalizedQuestions(topics: string[] | null | undefined): string[] {
  if (!topics || topics.length === 0) return DEFAULT_SUGGESTED_QUESTIONS;

  const picked: string[] = [];
  const shuffled = [...topics].sort(() => Math.random() - 0.5);

  for (const t of shuffled) {
    const qs = TOPIC_QUESTIONS[t];
    if (qs) {
      picked.push(qs[Math.floor(Math.random() * qs.length)]);
    }
    if (picked.length >= 3) break;
  }

  while (picked.length < 3) {
    const fallback = DEFAULT_SUGGESTED_QUESTIONS[picked.length] ?? 'Help me understand a verse';
    if (!picked.includes(fallback)) picked.push(fallback);
    else break;
  }

  return picked.slice(0, 4);
}

export function getGoalSubtitle(goal: string | null | undefined): string {
  switch (goal) {
    case 'learn':
      return "Let's explore the Qur'an together — one verse at a time.";
    case 'faith':
      return 'May every conversation strengthen your iman.';
    case 'peace':
      return 'Find peace and guidance, whenever you need it.';
    case 'questions':
      return 'Ask anything. The Qur\'an has guidance for you.';
    default:
      return 'Guidance from the Qur\'an, whenever you seek it.';
  }
}

export function getTopicEmoji(topicId: string): string {
  const map: Record<string, string> = {
    prayer: '🕌',
    patience: '🌱',
    gratitude: '🤲',
    anxiety: '🕊️',
    family: '👨‍👩‍👧',
    forgiveness: '💚',
    prophets: '📖',
    habits: '✨',
  };
  return map[topicId] ?? '📖';
}
