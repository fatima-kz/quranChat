import { Text, type TextProps } from 'react-native';

import { typography, serifFamily, type TypographyKey } from '@/theme';
import { useThemeColors } from '@/hooks/useTheme';

type Props = TextProps & {
  variant?: TypographyKey;
  muted?: boolean;
  serif?: boolean;
};

export function CText({ variant = 'body', muted, serif, style, ...props }: Props) {
  const c = useThemeColors();
  return (
    <Text
      style={[
        typography[variant],
        serif ? { fontFamily: serifFamily(variant) } : undefined,
        { color: muted ? c.textMuted : c.text },
        style,
      ]}
      {...props}
    />
  );
}
