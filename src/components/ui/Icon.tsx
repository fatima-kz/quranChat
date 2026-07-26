import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useTheme';

type Props = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: string;
};

export function Icon({ name, size = 24, color }: Props) {
  const c = useThemeColors();
  return <Ionicons name={name} size={size} color={color ?? c.text} />;
}
