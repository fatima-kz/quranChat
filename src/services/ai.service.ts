import { api } from '@/config/api';
import { QURAN_SYSTEM_PROMPT, buildSystemPromptWithContext } from '@/constants/prompts';
import { stripMarkdown } from '@/utils/stripMarkdown';
import type { ChatResponse, Role } from '@/types';

const CITATION_RE = /Qur'?an\s+(\d+):(\d+)\s*$/i;

function parseCitation(content: string) {
  const match = content.match(CITATION_RE);
  if (!match) return { content, citation: null };
  const surah = Number(match[1]);
  const ayah = Number(match[2]);
  if (!Number.isFinite(surah) || !Number.isFinite(ayah)) return { content, citation: null };
  const cleaned = content.replace(CITATION_RE, '').trim();
  return {
    content: cleaned,
    citation: { surah, ayah } as NonNullable<ChatResponse['citation']>,
  };
}

export type UserContext = {
  name?: string | null;
  goal?: string | null;
  topics?: string[] | null;
};

export async function sendChatMessage(
  history: { role: Role; content: string }[],
  userContext?: UserContext,
): Promise<ChatResponse> {
  const systemPrompt = userContext
    ? buildSystemPromptWithContext(userContext)
    : QURAN_SYSTEM_PROMPT;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch(api.chatUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Chat request failed (${res.status}). ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { content?: string; reply?: string };
  const raw = data.content ?? data.reply ?? '';
  const { content: parsed, citation } = parseCitation(raw);
  const content = stripMarkdown(parsed);

  return {
    content,
    citation,
    conversationId: '',
    messageId: '',
  };
}
