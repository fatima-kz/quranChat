import { create } from 'zustand';
import { storage } from '@/lib/storage';

type Bookmark = {
  surahId: number;
  verseId: number;
  surahName: string;
  verseText: string;
  timestamp: number;
};

type ReadingProgress = {
  surahId: number;
  surahName: string;
  surahTransliteration: string;
  verseId: number;
  timestamp: number;
};

type RecentSurah = {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: string;
  total_verses: number;
  timestamp: number;
};

type QuranState = {
  lastRead: ReadingProgress | null;
  recentSurahs: RecentSurah[];
  bookmarks: Bookmark[];
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setLastRead: (progress: ReadingProgress) => void;
  addRecentSurah: (surah: RecentSurah) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (surahId: number, verseId: number) => void;
  isBookmarked: (surahId: number, verseId: number) => boolean;
};

const STORAGE_KEY_LAST_READ = 'quran_last_read';
const STORAGE_KEY_RECENT = 'quran_recent_surahs';
const STORAGE_KEY_BOOKMARKS = 'quran_bookmarks';

export const useQuranStore = create<QuranState>((set, get) => ({
  lastRead: null,
  recentSurahs: [],
  bookmarks: [],
  hydrated: false,

  hydrate: async () => {
    const [lastRead, recentSurahs, bookmarks] = await Promise.all([
      storage.getJSON<ReadingProgress>(STORAGE_KEY_LAST_READ),
      storage.getJSON<RecentSurah[]>(STORAGE_KEY_RECENT),
      storage.getJSON<Bookmark[]>(STORAGE_KEY_BOOKMARKS),
    ]);
    set({
      lastRead: lastRead ?? null,
      recentSurahs: recentSurahs ?? [],
      bookmarks: bookmarks ?? [],
      hydrated: true,
    });
  },

  setLastRead: (progress) => {
    set({ lastRead: progress });
    storage.setJSON(STORAGE_KEY_LAST_READ, progress);
  },

  addRecentSurah: (surah) => {
    const current = get().recentSurahs.filter((s) => s.id !== surah.id);
    const updated = [surah, ...current].slice(0, 10);
    set({ recentSurahs: updated });
    storage.setJSON(STORAGE_KEY_RECENT, updated);
  },

  addBookmark: (bookmark) => {
    const current = get().bookmarks;
    // Don't duplicate
    const exists = current.some(
      (b) => b.surahId === bookmark.surahId && b.verseId === bookmark.verseId,
    );
    if (exists) return;
    const updated = [bookmark, ...current];
    set({ bookmarks: updated });
    storage.setJSON(STORAGE_KEY_BOOKMARKS, updated);
  },

  removeBookmark: (surahId, verseId) => {
    const updated = get().bookmarks.filter(
      (b) => !(b.surahId === surahId && b.verseId === verseId),
    );
    set({ bookmarks: updated });
    storage.setJSON(STORAGE_KEY_BOOKMARKS, updated);
  },

  isBookmarked: (surahId, verseId) => {
    return get().bookmarks.some(
      (b) => b.surahId === surahId && b.verseId === verseId,
    );
  },
}));
