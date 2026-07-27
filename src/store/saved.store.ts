import { create } from 'zustand';
import { storage } from '@/lib/storage';

export type SavedVerse = {
  id: string; // unique key: `${surahId}-${verseId}`
  surahId: number;
  surahName: string;
  surahTransliteration: string;
  verseId: number;
  arabicText: string;
  translation: string;
  timestamp: number;
};

export type SavedAiResponse = {
  id: string; // message id
  content: string;
  citation: { surah: number; ayah: number } | null;
  timestamp: number;
};

type SavedState = {
  verses: SavedVerse[];
  aiResponses: SavedAiResponse[];
  hydrated: boolean;

  hydrate: () => Promise<void>;
  saveVerse: (verse: SavedVerse) => void;
  unsaveVerse: (surahId: number, verseId: number) => void;
  isVerseSaved: (surahId: number, verseId: number) => boolean;
  saveAiResponse: (response: SavedAiResponse) => void;
  unsaveAiResponse: (id: string) => void;
  isAiResponseSaved: (id: string) => boolean;
};

const STORAGE_KEY_VERSES = 'saved_verses';
const STORAGE_KEY_AI = 'saved_ai_responses';

export const useSavedStore = create<SavedState>((set, get) => ({
  verses: [],
  aiResponses: [],
  hydrated: false,

  hydrate: async () => {
    const [verses, aiResponses] = await Promise.all([
      storage.getJSON<SavedVerse[]>(STORAGE_KEY_VERSES),
      storage.getJSON<SavedAiResponse[]>(STORAGE_KEY_AI),
    ]);
    set({
      verses: verses ?? [],
      aiResponses: aiResponses ?? [],
      hydrated: true,
    });
  },

  saveVerse: (verse) => {
    const current = get().verses;
    const exists = current.some((v) => v.id === verse.id);
    if (exists) return;
    const updated = [verse, ...current];
    set({ verses: updated });
    storage.setJSON(STORAGE_KEY_VERSES, updated);
  },

  unsaveVerse: (surahId, verseId) => {
    const key = `${surahId}-${verseId}`;
    const updated = get().verses.filter((v) => v.id !== key);
    set({ verses: updated });
    storage.setJSON(STORAGE_KEY_VERSES, updated);
  },

  isVerseSaved: (surahId, verseId) => {
    const key = `${surahId}-${verseId}`;
    return get().verses.some((v) => v.id === key);
  },

  saveAiResponse: (response) => {
    const current = get().aiResponses;
    const exists = current.some((r) => r.id === response.id);
    if (exists) return;
    const updated = [response, ...current];
    set({ aiResponses: updated });
    storage.setJSON(STORAGE_KEY_AI, updated);
  },

  unsaveAiResponse: (id) => {
    const updated = get().aiResponses.filter((r) => r.id !== id);
    set({ aiResponses: updated });
    storage.setJSON(STORAGE_KEY_AI, updated);
  },

  isAiResponseSaved: (id) => {
    return get().aiResponses.some((r) => r.id === id);
  },
}));
