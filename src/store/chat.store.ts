import { create } from 'zustand';

import type { Message } from '@/types';

type ChatState = {
  pendingMessages: Record<string, Message[]>;
  typing: boolean;
  pendingQuestion: string | null;
  setTyping: (typing: boolean) => void;
  setPending: (conversationId: string, messages: Message[]) => void;
  clearPending: (conversationId: string) => void;
  setPendingQuestion: (q: string | null) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  pendingMessages: {},
  typing: false,
  pendingQuestion: null,
  setTyping: (typing) => set({ typing }),
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
