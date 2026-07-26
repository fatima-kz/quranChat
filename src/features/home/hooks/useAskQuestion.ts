import { router } from 'expo-router';

import { useChatStore } from '@/store/chat.store';
import { useHaptics } from '@/hooks/useHaptics';

export function useAskQuestion() {
  const haptic = useHaptics();
  return (question: string) => {
    haptic('light');
    useChatStore.getState().setPendingQuestion(question);
    router.push('/(tabs)/chat');
  };
}
