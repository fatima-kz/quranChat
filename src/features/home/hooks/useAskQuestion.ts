import { router } from 'expo-router';

import { askQuestion } from '@/store/chat.store';
import { useHaptics } from '@/hooks/useHaptics';

export function useAskQuestion() {
  const haptic = useHaptics();
  return (question: string) => {
    haptic('light');
    askQuestion(question);
    router.navigate('/(tabs)/chat');
  };
}
