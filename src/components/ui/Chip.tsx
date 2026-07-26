import { Pressable, Text, type PressableProps } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { radius } from '@/theme';

type Props = PressableProps & {
  selected?: boolean;
  emoji?: string;
  label: string;
  multi?: boolean;
  onSelect: () => void;
};

export function Chip({ selected, emoji, label, multi, onSelect, style, ...props }: Props) {
  const c = useThemeColors();
  const haptic = useHaptics();

  return (
    <Pressable
      onPress={() => {
        haptic('selection');
        onSelect();
      }}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: radius.md,
          borderWidth: 1.5,
          borderColor: selected ? c.primary : c.border,
          backgroundColor: selected ? c.primary + '18' : c.surface,
        },
        style,
      ] as any}
      {...props}
    >
      {emoji ? <Text style={{ fontSize: 18 }}>{emoji}</Text> : null}
      <Text
        style={{
          fontSize: 15,
          fontWeight: '500',
          color: selected ? c.primary : c.text,
          flexShrink: 1,
        }}
        numberOfLines={2}
      >
        {label}
      </Text>
      {multi && selected ? <Text style={{ color: c.primary, fontSize: 16 }}>✓</Text> : null}
    </Pressable>
  );
}
