import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

import { CText, Loader, LogoImage } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { queryClient } from '@/lib/queryClient';
import {
  createConversation,
  insertMessage,
  listMessages,
  toggleBookmark,
} from '@/services/chat.service';
import { sendChatMessage } from '@/services/ai.service';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { getPersonalizedQuestions } from '@/constants/prompts';
import { formatDate } from '@/utils/formatDate';
import type { Message, Role } from '@/types';
import { truncate } from '@/utils/truncate';

import { ChatBubble } from '../components/ChatBubble';
import { MessageInput } from '../components/MessageInput';
import { TypingIndicator } from '../components/TypingIndicator';
import { ChatSidebar } from '../components/ChatSidebar';

type Props = {
  conversationId?: string;
};

const ERROR_TEXT = "I couldn't reach the server. Please try again.";

export default function ChatScreen({ conversationId }: Props) {
  const c = useThemeColors();
  const haptic = useHaptics();

  const params = useLocalSearchParams<{ id?: string }>();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const routeId = conversationId ?? idParam ?? null;

  const [createdId, setCreatedId] = useState<string | null>(null);
  const currentId = routeId ?? createdId;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const userId = session?.user?.id ?? profile?.id ?? null;

  const typing = useChatStore((s) => s.typing);
  const setTyping = useChatStore((s) => s.setTyping);
  const pendingQuestion = useChatStore((s) => s.pendingQuestion);
  const setPendingQuestion = useChatStore((s) => s.setPendingQuestion);

  const messagesQuery = useQuery({
    queryKey: ['messages', currentId],
    queryFn: () => listMessages(currentId as string),
    enabled: !!currentId,
  });

  const flatListRef = useRef<FlatList<Message>>(null);
  const sendMessageRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    if (messagesQuery.data) {
      setMessages(messagesQuery.data);
    }
  }, [messagesQuery.data]);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, typing, sending]);

  const showEmptyState = messages.length === 0 && !currentId;
  const loadingConversation = !!currentId && messagesQuery.isLoading && messages.length === 0;
  const showTyping = typing && sending;

  const sendMessage = async (raw: string) => {
    const text = raw.trim();
    if (!text || !userId || sending) return;

    haptic('light');
    setSending(true);
    setTyping(true);
    setInput('');

    let convId = currentId;
    let createdNew = false;

    try {
      if (!convId) {
        const conv = await createConversation(userId, truncate(text, 40));
        convId = conv.id;
        setCreatedId(conv.id);
        createdNew = true;
      }

      const userMessage: Message = {
        id: `temp-u-${Date.now()}`,
        conversation_id: convId,
        role: 'user',
        content: text,
        citation: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      const history = [
        ...messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as Role, content: text },
      ];

      const res = await sendChatMessage(history, {
        name: profile?.full_name,
        goal: profile?.goal,
        topics: profile?.topics,
      });

      await insertMessage(convId, 'user', text, null);
      await insertMessage(convId, 'assistant', res.content, res.citation);

      const assistantMessage: Message = {
        id: res.messageId || `temp-a-${Date.now()}`,
        conversation_id: convId,
        role: 'assistant',
        content: res.content,
        citation: res.citation,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        conversation_id: convId ?? '',
        role: 'assistant',
        content: ERROR_TEXT,
        citation: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
      setTyping(false);
      if (convId) {
        queryClient.invalidateQueries({ queryKey: ['messages', convId] });
      }
      if (createdNew && userId) {
        queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
      }
    }
  };

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  useEffect(() => {
    if (pendingQuestion) {
      setPendingQuestion(null);
      sendMessageRef.current(pendingQuestion);
    }
  }, [pendingQuestion, setPendingQuestion]);

  const handleCopy = async (content: string) => {
    await Clipboard.setStringAsync(content);
  };

  const handleBookmark = async (message: Message) => {
    if (!userId) return;
    try {
      const bookmarked = await toggleBookmark(userId, message);
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, bookmarked } : m)),
      );
    } catch {
      haptic('error');
    }
  };

  const handleSelectConversation = (id: string, title: string) => {
    setSidebarOpen(false);
    setMessages([]);
    setCreatedId(id);
    if (idParam) {
      router.setParams({ id });
    } else {
      router.push({ pathname: '/chat/[id]', params: { id } });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ChatSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userId={userId ?? ''}
        activeId={currentId}
        onSelect={handleSelectConversation}
      />

      <SafeAreaView edges={['top']} style={{ backgroundColor: c.background }}>
        <View style={styles.header}>
          <Pressable
            hitSlop={12}
            style={styles.iconBtn}
            onPress={() => { haptic('light'); setSidebarOpen(true); }}
          >
            <Ionicons name="menu" size={26} color={c.text} />
          </Pressable>
          <View style={styles.titleWrap}>
            <View style={[styles.logoCircle, { backgroundColor: c.surface }]}>
              <LogoImage size={24} />
            </View>
            <CText variant="h3" style={{ color: c.text }}>
              {"Qur'an Chat"}
            </CText>
          </View>
          <Pressable
            hitSlop={12}
            style={styles.iconBtn}
            onPress={() => { haptic('light'); setMessages([]); setCreatedId(null); }}
          >
            <Ionicons name="create-outline" size={24} color={c.text} />
          </Pressable>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          {showEmptyState ? (
            <EmptyState onPick={sendMessage} userId={userId} userTopics={profile?.topics ?? null} />
          ) : loadingConversation ? (
            <View style={styles.center}>
              <Loader />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ChatBubble
                  message={item}
                  onCopy={handleCopy}
                  onBookmark={handleBookmark}
                  error={item.id.startsWith('err-')}
                />
              )}
              contentContainerStyle={{ paddingVertical: 12, paddingBottom: 24 }}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={<DatePill />}
              ListFooterComponent={showTyping ? <TypingIndicator /> : null}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}
        </View>

        <SafeAreaView edges={['bottom']} style={{ backgroundColor: c.background }}>
          <View style={styles.inputBar}>
            <MessageInput
              value={input}
              onChange={setInput}
              onSend={() => sendMessage(input)}
              disabled={sending}
            />
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

function DatePill() {
  const c = useThemeColors();
  return (
    <View style={{ alignItems: 'center', marginVertical: 8 }}>
      <View style={[styles.pill, { backgroundColor: c.surfaceMuted }]}>
        <CText variant="caption" style={{ color: c.textMuted }}>
          {formatDate(new Date())}
        </CText>
      </View>
    </View>
  );
}

function EmptyState({
  onPick,
  userId,
  userTopics,
}: {
  onPick: (q: string) => void;
  userId: string | null;
  userTopics: string[] | null;
}) {
  const c = useThemeColors();
  const questions = getPersonalizedQuestions(userTopics);

  return (
    <ScrollView
      contentContainerStyle={styles.emptyContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.circle, { borderColor: c.border, backgroundColor: c.surface }]}>
        <LogoImage size={52} />
      </View>
      <CText serif variant="h3" style={styles.welcomeTitle}>
        {"How can I help you understand the Qur'an today?"}
      </CText>
      <View style={styles.chips}>
        {questions.map((q: string) => (
          <Pressable
            key={q}
            onPress={() => onPick(q)}
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: c.surface, borderColor: c.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <CText variant="small" style={{ flexShrink: 1 }}>{q}</CText>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  circle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 16,
    overflow: 'hidden',
  },
  welcomeTitle: {
    textAlign: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginTop: 16,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
});
