import { useEffect } from 'react';

import { useThemeStore, startThemeSync } from '@/store/theme.store';

export function ThemeApplier() {
  const hydrated = useThemeStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated) {
      startThemeSync();
    }
  }, [hydrated]);

  return null;
}
