import { useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CText } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useAskQuestion } from '@/features/home/hooks/useAskQuestion';
import { getPersonalizedQuestions } from '@/constants/prompts';

export function SuggestedQuestions({ userTopics }: { userTopics?: string[] | null }) {
  const c = useThemeColors();
  const ask = useAskQuestion();

  const questions = useMemo(() => getPersonalizedQuestions(userTopics), [userTopics]);

  const open = (q: string) => {
    ask(q);
  };

  const icons = ['book', 'heart', 'person', 'help-circle'];

  return (
    <View style={{ gap: 12 }}>
      <CText variant="h3">For you</CText>
      {questions.map((q, i) => (
        <Pressable
          key={q}
          onPress={() => open(q)}
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: c.surface,
              borderColor: c.border,
              shadowColor: c.text,
            },
            pressed && { opacity: 0.9 },
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: c.primary + '14' }]}>
            <Ionicons name={icons[i % icons.length] as any} size={18} color={c.primary} />
          </View>
          <CText style={{ flex: 1, fontSize: 15, fontWeight: '500', color: c.text }} numberOfLines={2}>{q}</CText>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
