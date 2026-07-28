import { create } from 'zustand';

import type { Message } from '@/types';

type PendingQuestion = {
  id: string;
  text: string;
};

type ChatState = {
  pendingMessages: Record<string, Message[]>;
  typing: boolean;
  pendingQuestion: PendingQuestion | null;
  setTyping: (typing: boolean) => void;
  setPending: (conversationId: string, messages: Message[]) => void;
  clearPending: (conversationId: string) => void;
  setPendingQuestion: (q: PendingQuestion | null) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  pendingMessages: {},
  typing: false,
  pendingQuestion: null,
  setTyping: (typing) => set((s) => (s.typing === typing ? s : { typing })),
  setPending: (conversationId, messages) =>
    set((s) => ({ pendingMessages: { ...s.pendingMessages, [conversationId]: messages } })),
  clearPending: (conversationId) =>
    set((s) => {
      const next = { ...s.pendingMessages };
      delete next[conversationId];
      return { pendingMessages: next };
    }),
  setPendingQuestion: (pendingQuestion) => set({ pendingQuestion }),
}));

export function askQuestion(text: string) {
  useChatStore.getState().setPendingQuestion({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text,
  });
}
