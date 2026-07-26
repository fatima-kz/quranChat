import Svg, { Path, G } from 'react-native-svg';

import { useThemeColors } from '@/hooks/useTheme';

type Props = {
  size?: number;
  primary?: string;
  accent?: string;
};

export function Logo({ size = 120, primary, accent }: Props) {
  const c = useThemeColors();
  const p = primary ?? c.primary;
  const a = accent ?? c.accent;

  return (
    <Svg width={size} height={size} viewBox="0 0 200 160">
      <G strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Back cover / left spine */}
        <Path d="M 46 128 L 46 44" stroke={p} strokeWidth={7} />
        {/* Page 1 (gold) */}
        <Path d="M 68 126 L 68 50" stroke={a} strokeWidth={5} />
        {/* Page 2 (green) */}
        <Path d="M 90 124 L 90 56" stroke={p} strokeWidth={5} />
        {/* Right page morphing into chat bubble (green outer) */}
        <Path
          d="M 112 122
             C 112 80, 112 48, 148 48
             C 180 48, 186 74, 186 96
             C 186 116, 172 128, 152 124
             L 135 140
             L 130 120
             C 122 121, 112 122, 112 122 Z"
          stroke={p}
          strokeWidth={7}
        />
        {/* Inner gold accent line */}
        <Path
          d="M 118 116
             C 118 82, 120 58, 148 58
             C 168 58, 174 78, 174 96"
          stroke={a}
          strokeWidth={4}
        />
      </G>
    </Svg>
  );
}
