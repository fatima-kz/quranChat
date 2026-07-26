import { TextInput, Text, View, type TextInputProps, type ViewStyle } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';
import { radius } from '@/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  iconRight?: React.ReactNode;
  iconLeft?: React.ReactNode;
  containerStyle?: ViewStyle;
};

export function Input({
  label,
  error,
  iconRight,
  iconLeft,
  containerStyle,
  style,
  ...props
}: Props) {
  const c = useThemeColors();

  return (
    <>
      {label ? (
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: c.textMuted,
            marginBottom: 6,
            marginLeft: 4,
          }}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: c.inputBg,
            borderRadius: radius.lg,
            borderWidth: 1.5,
            borderColor: error ? c.danger : c.border,
          },
          containerStyle,
        ]}
      >
        {iconLeft ? <View style={{ paddingLeft: 14 }}>{iconLeft}</View> : null}
        <TextInput
          placeholderTextColor={c.textMuted}
          style={[
            {
              flex: 1,
              paddingHorizontal: iconLeft || iconRight ? 10 : 16,
              paddingVertical: 14,
              fontSize: 16,
              color: c.text,
            },
            style,
          ]}
          {...props}
        />
        {iconRight ? <View style={{ paddingRight: 14 }}>{iconRight}</View> : null}
      </View>
      {error ? (
        <Text style={{ color: c.danger, fontSize: 13, marginTop: 6, marginLeft: 4 }}>
          {error}
        </Text>
      ) : null}
    </>
  );
}
