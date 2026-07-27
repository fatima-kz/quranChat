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
  streakCount: number;
  lastActiveDate: string | null;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  setLastRead: (progress: ReadingProgress) => void;
  addRecentSurah: (surah: RecentSurah) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (surahId: number, verseId: number) => void;
  isBookmarked: (surahId: number, verseId: number) => boolean;
  recordActivity: () => void;
};

const STORAGE_KEY_LAST_READ = 'quran_last_read';
const STORAGE_KEY_RECENT = 'quran_recent_surahs';
const STORAGE_KEY_BOOKMARKS = 'quran_bookmarks';
const STORAGE_KEY_STREAK = 'quran_streak';

export const useQuranStore = create<QuranState>((set, get) => ({
  lastRead: null,
  recentSurahs: [],
  bookmarks: [],
  streakCount: 0,
  lastActiveDate: null,
  hydrated: false,

  hydrate: async () => {
    const [lastRead, recentSurahs, bookmarks, streakData] = await Promise.all([
      storage.getJSON<ReadingProgress>(STORAGE_KEY_LAST_READ),
      storage.getJSON<RecentSurah[]>(STORAGE_KEY_RECENT),
      storage.getJSON<Bookmark[]>(STORAGE_KEY_BOOKMARKS),
      storage.getJSON<{streakCount: number, lastActiveDate: string}>(STORAGE_KEY_STREAK),
    ]);
    set({
      lastRead: lastRead ?? null,
      recentSurahs: recentSurahs ?? [],
      bookmarks: bookmarks ?? [],
      streakCount: streakData?.streakCount ?? 0,
      lastActiveDate: streakData?.lastActiveDate ?? null,
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
    const updated = [bookmark];
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

  recordActivity: () => {
    const { streakCount, lastActiveDate } = get();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    
    if (lastActiveDate === todayStr) return; // already recorded today
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;
    
    const newStreak = lastActiveDate === yesterdayStr ? streakCount + 1 : 1;
    
    set({ streakCount: newStreak, lastActiveDate: todayStr });
    storage.setJSON(STORAGE_KEY_STREAK, { streakCount: newStreak, lastActiveDate: todayStr });
  },
}));
