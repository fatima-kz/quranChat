import { Pressable, Text, type PressableProps, ActivityIndicator } from 'react-native';
import React from 'react';

import { useThemeColors } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { radius } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'google';
type Size = 'md' | 'lg';

type Props = Omit<PressableProps, 'onPress'> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  full?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  onPress?: () => void;
  children: React.ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  full,
  icon,
  iconRight,
  onPress,
  children,
  style,
  disabled,
  ...props
}: Props) {
  const c = useThemeColors();
  const haptic = useHaptics();

  const handlePress = () => {
    if (disabled || loading) return;
    haptic('light');
    onPress?.();
  };

  const heights = { md: 52, lg: 56 };
  const fonts = { md: 16, lg: 17 };
  const iconSize = size === 'lg' ? 20 : 18;

  const base = {
    minHeight: heights[size],
    borderRadius: radius.lg,
    paddingHorizontal: 24,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    alignSelf: full ? ('stretch' as const) : ('auto' as const),
    opacity: disabled || loading ? 0.5 : 1,
  };

  const variants: Record<Variant, Record<string, any>> = {
    primary: {
      backgroundColor: c.primary,
      shadowColor: c.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    secondary: {
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
      shadowColor: c.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    ghost: { backgroundColor: 'transparent' },
    outline: {
      backgroundColor: c.surface,
      borderWidth: 2,
      borderColor: c.primary,
    },
    google: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1.5,
      borderColor: '#E5E5E5',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
  };

  const labelColor =
    variant === 'primary' ? '#FFFFFF' :
    variant === 'google' ? '#1F2937' :
    variant === 'outline' ? c.primary :
    c.text;

  const label = typeof children === 'string' || typeof children === 'number'
    ? <Text style={{ color: labelColor, fontSize: fonts[size], fontWeight: '700', letterSpacing: 0.2 }}>{children}</Text>
    : children;

  return (
    <Pressable
      style={({ pressed }) =>
        [base, variants[variant], pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] }, style] as any
      }
      onPress={handlePress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} size={iconSize} />
      ) : (
        <>
          {icon}
          {label}
          {iconRight}
        </>
      )}
    </Pressable>
  );
}
