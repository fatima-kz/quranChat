import { useQuery } from '@tanstack/react-query';

import { getDailyAyah } from '@/features/home/api/ayah.api';

export function useDailyAyah(userTopics?: string[] | null) {
  return useQuery({
    queryKey: ['dailyAyah', userTopics ?? []],
    queryFn: () => getDailyAyah(userTopics),
  });
}
