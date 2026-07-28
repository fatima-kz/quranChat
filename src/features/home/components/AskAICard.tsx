import { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useTheme';
import { useAskQuestion } from '@/features/home/hooks/useAskQuestion';

export function AskAICard() {
  const c = useThemeColors();
  const ask = useAskQuestion();
  const [value, setValue] = useState('');

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    setValue('');
    ask(text);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: c.surface,
        borderRadius: 999,
        paddingHorizontal: 18,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: c.border,
        shadowColor: c.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      <Ionicons name="chevron-back" size={18} color={c.textMuted} style={{ transform: [{ rotate: '-90deg' }] }} />
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Ask anything about the Qur'an..."
        placeholderTextColor={c.textMuted}
        style={{
          flex: 1,
          marginLeft: 10,
          fontSize: 16,
          color: c.text,
          paddingVertical: 12,
        }}
        onSubmitEditing={submit}
      />
      <Pressable
        onPress={submit}
        disabled={!value.trim()}
        style={({ pressed }) => [
          styles.sendBtn,
          { backgroundColor: c.surfaceMuted },
          pressed && value.trim() && { opacity: 0.9, transform: [{ scale: 0.96 }] },
        ]}
      >
        <Ionicons name="send" size={18} color={c.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
