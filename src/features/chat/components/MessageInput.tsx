import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useTheme';

type Props = {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export function MessageInput({ value, onChange, onSend, disabled }: Props) {
  const c = useThemeColors();
  const canSend = !disabled && value.trim().length > 0;

  return (
    <View style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Pressable
        style={({ pressed }) => [
          styles.iconBtn,
          { backgroundColor: c.surfaceMuted },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Ionicons name="add" size={22} color={c.primary} />
      </Pressable>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Type your reflection..."
        placeholderTextColor={c.textMuted}
        style={[styles.input, { color: c.text }]}
        multiline
        onSubmitEditing={onSend}
      />
      <Pressable
        disabled={!canSend}
        onPress={onSend}
        style={({ pressed }) => [
          styles.sendBtn,
          { backgroundColor: canSend ? c.primary : c.surfaceMuted },
          pressed && canSend && { opacity: 0.9, transform: [{ scale: 0.96 }] },
        ]}
      >
        <Ionicons name="send" size={18} color={canSend ? '#FFFFFF' : c.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 24,
    paddingVertical: 0,
    paddingHorizontal: 8,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'center',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
