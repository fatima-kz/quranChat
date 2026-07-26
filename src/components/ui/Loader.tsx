import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';

export function Loader(props: ActivityIndicatorProps) {
  const c = useThemeColors();
  return <ActivityIndicator color={c.primary} {...props} />;
}
