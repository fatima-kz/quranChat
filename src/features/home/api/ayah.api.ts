export type DailyAyah = {
  arabic: string;
  english: string;
  text: string;
  surah: string;
  ayahRef: string;
  reflection: string;
  topics?: string[];
};

const AYAHS: DailyAyah[] = [
  {
    arabic: 'إِنَّ فِي ذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    english: 'Indeed, in the remembrance of Allah do hearts find rest.',
    text: 'Indeed, in the remembrance of Allah do hearts find rest.',
    surah: 'Ar-Ra’d',
    ayahRef: "Qur'an 13:28",
    reflection:
      'Peace comes from turning your heart toward remembrance. When the noise of the world feels heavy, a moment of dhikr can quiet everything inside.',
    topics: ['peace', 'anxiety', 'habits'],
  },
  {
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    english: 'For indeed, with hardship comes ease.',
    text: 'For indeed, with hardship comes ease.',
    surah: 'Ash-Sharh',
    ayahRef: "Qur'an 94:6",
    reflection:
      'Ease is promised alongside difficulty, not after it. The struggle and the relief walk together — look for the ease that is already on its way.',
    topics: ['patience', 'anxiety', 'peace'],
  },
  {
    arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ',
    english: 'O you who believe, seek help through patience and prayer.',
    text: 'O you who believe, seek help through patience and prayer.',
    surah: 'Al-Baqarah',
    ayahRef: "Qur'an 2:153",
    reflection:
      'When you feel overwhelmed, the Qur’an points to two anchors: patience with what you cannot change, and prayer to reconnect with the One who can.',
    topics: ['patience', 'prayer'],
  },
  {
    arabic: 'ادْعُونِي أَسْتَجِبْ لَكُمْ',
    english: 'Call upon Me; I will respond to you.',
    text: 'Call upon Me; I will respond to you.',
    surah: 'Ghafir',
    ayahRef: "Qur'an 40:60",
    reflection:
      'Duʿā’ is not about finding the perfect words — it is about turning to Allah sincerely. Your request is heard, even when the answer takes time.',
    topics: ['prayer', 'gratitude', 'peace'],
  },
  {
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
    english: 'And whoever places their trust in Allah, He is sufficient for them.',
    text: 'And whoever places their trust in Allah, He is sufficient for them.',
    surah: 'At-Talaq',
    ayahRef: "Qur'an 65:3",
    reflection:
      'Tawakkul is doing your part, then releasing the outcome. Trust that what is written for you is better than what you planned for yourself.',
    topics: ['anxiety', 'peace', 'patience'],
  },
  {
    arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    english: 'If you are grateful, I will surely increase you.',
    text: 'And [remember] when your Lord proclaimed: If you are grateful, I will surely increase you.',
    surah: 'Ibrahim',
    ayahRef: "Qur'an 14:7",
    reflection:
      'Gratitude is not just a feeling — it is a path to more. When you notice the blessings you already have, Allah promises to multiply them.',
    topics: ['gratitude', 'habits'],
  },
  {
    arabic: 'وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ',
    english: 'And We have certainly honored the children of Adam.',
    text: 'And We have certainly honored the children of Adam.',
    surah: 'Al-Isra',
    ayahRef: "Qur'an 17:70",
    reflection:
      'Your worth is not measured by what people see. Allah honored you before anyone else had a say. Carry that dignity with you today.',
    topics: ['peace', 'anxiety'],
  },
  {
    arabic: 'وَلَمَن صَبَرَ وَغَفَرَ إِنَّ ذَٰلِكَ لَمِنْ عَزْمِ الْأُمُورِ',
    english: 'And those who forgive others and seek forgiveness — Allah loves the doers of good.',
    text: 'And those who forgive others and seek forgiveness — Allah loves the doers of good.',
    surah: 'Ash-Shura',
    ayahRef: "Qur'an 42:43",
    reflection:
      'Forgiveness is not about pretending nothing happened — it is about freeing your heart. Let go of what weighs you down, and Allah will lift you.',
    topics: ['forgiveness', 'family'],
  },
  {
    arabic: 'وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا',
    english: 'And your Lord has decreed that you not worship except Him, and to parents, good treatment.',
    text: 'And your Lord has decreed that you not worship except Him, and to parents, good treatment.',
    surah: 'Al-Isra',
    ayahRef: "Qur'an 17:23",
    reflection:
      'Kindness to family is placed right beside worship of Allah. The small gestures at home are sacred in ways we often forget.',
    topics: ['family', 'habits'],
  },
  {
    arabic: 'فَاصْبِرْ إِنَّ الْعَاقِبَةَ لِلْمُتَّقِينَ',
    english: 'So be patient. Indeed, the best outcome is for those who fear Allah.',
    text: 'So be patient. Indeed, the best outcome is for those who fear Allah.',
    surah: 'Hud',
    ayahRef: "Qur'an 11:49",
    reflection:
      'Patience is not passive waiting — it is active trust. The outcome you hope for may be closer than it feels right now.',
    topics: ['patience', 'peace'],
  },
  {
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ',
    english: 'So remember Me; I will remember you.',
    text: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
    surah: 'Al-Baqarah',
    ayahRef: "Qur'an 2:152",
    reflection:
      'Remembrance is a two-way street. You turn toward Allah, and Allah turns toward you. That is the most grounding habit you can build.',
    topics: ['gratitude', 'habits', 'prayer'],
  },
  {
    arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    english: 'Indeed, Allah is with those who are patient.',
    text: 'Indeed, Allah is with those who are patient.',
    surah: 'Al-Baqarah',
    ayahRef: "Qur'an 2:153",
    reflection:
      'You are not alone in the waiting. The patience that feels heavy to carry is actually a sign of Allah’s nearness to you.',
    topics: ['patience', 'anxiety'],
  },
];

export async function getDailyAyah(userTopics?: string[] | null): Promise<DailyAyah> {
  await new Promise((r) => setTimeout(r, 300));
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  if (userTopics && userTopics.length > 0) {
    const relevant = AYAHS.filter((a) => a.topics?.some((t) => userTopics.includes(t)));
    if (relevant.length > 0) {
      return relevant[dayOfYear % relevant.length];
    }
  }

  return AYAHS[dayOfYear % AYAHS.length];
}
