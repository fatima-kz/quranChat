import { useLocalSearchParams } from 'expo-router';

import ChatScreen from '@/features/chat/screens/ChatScreen';

export default function ConversationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Array.isArray(id) ? id[0] : id;
  return <ChatScreen conversationId={conversationId} />;
}
