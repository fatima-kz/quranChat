import metadata from '@/assets/quran/metadata.json';

export type Verse = {
  id: number;
  text: string;
  translation: string;
  transliteration: string;
};

export type SurahData = {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: string;
  total_verses: number;
  verses: Verse[];
};

export type SurahMeta = {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: string;
  total_verses: number;
};

export const allSurahs: SurahMeta[] = metadata as SurahMeta[];

const surahCache: Record<number, SurahData> = {};

export function loadSurahData(id: number): SurahData {
  if (surahCache[id]) return surahCache[id];

  const surahMap: Record<number, any> = {
    1: require('@/assets/quran/1.json'),
    2: require('@/assets/quran/2.json'),
    3: require('@/assets/quran/3.json'),
    4: require('@/assets/quran/4.json'),
    5: require('@/assets/quran/5.json'),
    6: require('@/assets/quran/6.json'),
    7: require('@/assets/quran/7.json'),
    8: require('@/assets/quran/8.json'),
    9: require('@/assets/quran/9.json'),
    10: require('@/assets/quran/10.json'),
    11: require('@/assets/quran/11.json'),
    12: require('@/assets/quran/12.json'),
    13: require('@/assets/quran/13.json'),
    14: require('@/assets/quran/14.json'),
    15: require('@/assets/quran/15.json'),
    16: require('@/assets/quran/16.json'),
    17: require('@/assets/quran/17.json'),
    18: require('@/assets/quran/18.json'),
    19: require('@/assets/quran/19.json'),
    20: require('@/assets/quran/20.json'),
    21: require('@/assets/quran/21.json'),
    22: require('@/assets/quran/22.json'),
    23: require('@/assets/quran/23.json'),
    24: require('@/assets/quran/24.json'),
    25: require('@/assets/quran/25.json'),
    26: require('@/assets/quran/26.json'),
    27: require('@/assets/quran/27.json'),
    28: require('@/assets/quran/28.json'),
    29: require('@/assets/quran/29.json'),
    30: require('@/assets/quran/30.json'),
    31: require('@/assets/quran/31.json'),
    32: require('@/assets/quran/32.json'),
    33: require('@/assets/quran/33.json'),
    34: require('@/assets/quran/34.json'),
    35: require('@/assets/quran/35.json'),
    36: require('@/assets/quran/36.json'),
    37: require('@/assets/quran/37.json'),
    38: require('@/assets/quran/38.json'),
    39: require('@/assets/quran/39.json'),
    40: require('@/assets/quran/40.json'),
    41: require('@/assets/quran/41.json'),
    42: require('@/assets/quran/42.json'),
    43: require('@/assets/quran/43.json'),
    44: require('@/assets/quran/44.json'),
    45: require('@/assets/quran/45.json'),
    46: require('@/assets/quran/46.json'),
    47: require('@/assets/quran/47.json'),
    48: require('@/assets/quran/48.json'),
    49: require('@/assets/quran/49.json'),
    50: require('@/assets/quran/50.json'),
    51: require('@/assets/quran/51.json'),
    52: require('@/assets/quran/52.json'),
    53: require('@/assets/quran/53.json'),
    54: require('@/assets/quran/54.json'),
    55: require('@/assets/quran/55.json'),
    56: require('@/assets/quran/56.json'),
    57: require('@/assets/quran/57.json'),
    58: require('@/assets/quran/58.json'),
    59: require('@/assets/quran/59.json'),
    60: require('@/assets/quran/60.json'),
    61: require('@/assets/quran/61.json'),
    62: require('@/assets/quran/62.json'),
    63: require('@/assets/quran/63.json'),
    64: require('@/assets/quran/64.json'),
    65: require('@/assets/quran/65.json'),
    66: require('@/assets/quran/66.json'),
    67: require('@/assets/quran/67.json'),
    68: require('@/assets/quran/68.json'),
    69: require('@/assets/quran/69.json'),
    70: require('@/assets/quran/70.json'),
    71: require('@/assets/quran/71.json'),
    72: require('@/assets/quran/72.json'),
    73: require('@/assets/quran/73.json'),
    74: require('@/assets/quran/74.json'),
    75: require('@/assets/quran/75.json'),
    76: require('@/assets/quran/76.json'),
    77: require('@/assets/quran/77.json'),
    78: require('@/assets/quran/78.json'),
    79: require('@/assets/quran/79.json'),
    80: require('@/assets/quran/80.json'),
    81: require('@/assets/quran/81.json'),
    82: require('@/assets/quran/82.json'),
    83: require('@/assets/quran/83.json'),
    84: require('@/assets/quran/84.json'),
    85: require('@/assets/quran/85.json'),
    86: require('@/assets/quran/86.json'),
    87: require('@/assets/quran/87.json'),
    88: require('@/assets/quran/88.json'),
    89: require('@/assets/quran/89.json'),
    90: require('@/assets/quran/90.json'),
    91: require('@/assets/quran/91.json'),
    92: require('@/assets/quran/92.json'),
    93: require('@/assets/quran/93.json'),
    94: require('@/assets/quran/94.json'),
    95: require('@/assets/quran/95.json'),
    96: require('@/assets/quran/96.json'),
    97: require('@/assets/quran/97.json'),
    98: require('@/assets/quran/98.json'),
    99: require('@/assets/quran/99.json'),
    100: require('@/assets/quran/100.json'),
    101: require('@/assets/quran/101.json'),
    102: require('@/assets/quran/102.json'),
    103: require('@/assets/quran/103.json'),
    104: require('@/assets/quran/104.json'),
    105: require('@/assets/quran/105.json'),
    106: require('@/assets/quran/106.json'),
    107: require('@/assets/quran/107.json'),
    108: require('@/assets/quran/108.json'),
    109: require('@/assets/quran/109.json'),
    110: require('@/assets/quran/110.json'),
    111: require('@/assets/quran/111.json'),
    112: require('@/assets/quran/112.json'),
    113: require('@/assets/quran/113.json'),
    114: require('@/assets/quran/114.json'),
  };

  const data = surahMap[id] as SurahData;
  if (data) surahCache[id] = data;
  return data;
}

export function lookupVerse(surahNum: number, ayahNum: number): {
  surahName: string;
  surahTransliteration: string;
  verseText: string;
  verseTranslation: string;
  isValid: boolean;
} {
  try {
    const surah = loadSurahData(surahNum);
    if (!surah) return { surahName: '', surahTransliteration: '', verseText: '', verseTranslation: '', isValid: false };

    const verse = surah.verses.find((v) => v.id === ayahNum);
    if (!verse) return { surahName: surah.transliteration, surahTransliteration: surah.transliteration, verseText: '', verseTranslation: '', isValid: false };

    return {
      surahName: surah.transliteration,
      surahTransliteration: surah.transliteration,
      verseText: verse.text,
      verseTranslation: verse.translation,
      isValid: true,
    };
  } catch {
    return { surahName: '', surahTransliteration: '', verseText: '', verseTranslation: '', isValid: false };
  }
}
