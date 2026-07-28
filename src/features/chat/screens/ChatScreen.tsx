import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

import { CText, Loader, LogoImage } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme.store';
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
import { useQuranStore } from '@/store/quran.store';
import { getPersonalizedQuestions } from '@/constants/prompts';
import { formatDate } from '@/utils/formatDate';
import type { Message, Role } from '@/types';
import { truncate } from '@/utils/truncate';

import { ChatBubble } from '../components/ChatBubble';
import { MessageInput } from '../components/MessageInput';
import { TypingIndicator } from '../components/TypingIndicator';
import { ChatSidebar } from '../components/ChatSidebar';

const ERROR_TEXT = "I couldn't reach the server. Please try again.";

function toStrParam(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default function ChatScreen() {
  const c = useThemeColors();
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  const haptic = useHaptics();

  const params = useLocalSearchParams<{ id?: string; reset?: string }>();
  const routeId = toStrParam(params.id);
  const resetToken = toStrParam(params.reset);

  // On the index route (no id), `createdId` tracks a conversation started here.
  // On the [id] route, `routeId` is the source of truth.
  const [createdId, setCreatedId] = useState<string | null>(null);
  const activeConvId = routeId ?? createdId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const userId = session?.user?.id ?? profile?.id ?? null;
  const recordActivity = useQuranStore((s) => s.recordActivity);

  const typing = useChatStore((s) => s.typing);
  const setTyping = useChatStore((s) => s.setTyping);
  const pendingQuestion = useChatStore((s) => s.pendingQuestion);
  const setPendingQuestion = useChatStore((s) => s.setPendingQuestion);

  const messagesQuery = useQuery({
    queryKey: ['messages', activeConvId],
    queryFn: () => listMessages(activeConvId as string),
    enabled: !!activeConvId,
  });

  const flatListRef = useRef<FlatList<Message>>(null);
  const messagesRef = useRef<Message[]>([]);
  const sendingRef = useRef(false);
  const justCreatedRef = useRef<string | null>(null);
  const lastSyncedId = useRef<string | null>(null);
  const lastResetToken = useRef<string | null>(null);
  const processedPendingRef = useRef<string | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Keep createdId clear whenever we are on a [id] route (URL is the truth there)
  useEffect(() => {
    if (routeId) setCreatedId(null);
  }, [routeId]);

  // Sync messages from the DB once per conversation id (never overwrite mid-send)
  useEffect(() => {
    const syncId = activeConvId;
    if (syncId === lastSyncedId.current) return;
    if (!syncId) {
      lastSyncedId.current = null;
      setMessages([]);
      return;
    }
    // A conversation we just created — local state already holds the messages
    if (syncId === justCreatedRef.current) {
      lastSyncedId.current = syncId;
      justCreatedRef.current = null;
      return;
    }
    if (messagesQuery.data) {
      lastSyncedId.current = syncId;
      setMessages(messagesQuery.data);
    }
  }, [activeConvId, messagesQuery.data]);

  // "New chat" signal: reset the index state when navigated with a reset token
  useEffect(() => {
    if (routeId) return;
    if (!resetToken || resetToken === lastResetToken.current) return;
    lastResetToken.current = resetToken;
    setCreatedId(null);
    setMessages([]);
    setInput('');
    lastSyncedId.current = null;
    sendingRef.current = false;
    setSending(false);
    setTyping(false);
    queryClient.removeQueries({ queryKey: ['messages'] });
  }, [routeId, resetToken, setTyping]);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, typing, sending]);

  const showEmptyState = messages.length === 0 && !activeConvId;
  const loadingConversation = !!activeConvId && messagesQuery.isLoading && messages.length === 0;
  const showTyping = typing && sending;

  const sendMessage = useCallback(
    async (raw: string) => {
      recordActivity();
      const text = raw.trim();
      if (!text || !userId || sendingRef.current) return;

      haptic('light');
      sendingRef.current = true;
      setSending(true);
      setTyping(true);
      setInput('');

      let convId = activeConvId;
      let createdNew = false;

      try {
        if (!convId) {
          const conv = await createConversation(userId, truncate(text, 40));
          convId = conv.id;
          createdNew = true;
          justCreatedRef.current = conv.id;
          lastSyncedId.current = conv.id;
          setCreatedId(conv.id);
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
          ...messagesRef.current
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

        queryClient.invalidateQueries({ queryKey: ['messages', convId] });
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
        sendingRef.current = false;
        setSending(false);
        setTyping(false);
        if (createdNew && userId) {
          queryClient.invalidateQueries({ queryKey: ['conversations', userId] });
        }
      }
    },
    [activeConvId, userId, profile, recordActivity, haptic, setTyping],
  );

  // Consume a pending question asked from another tab — only on the new-chat index
  useFocusEffect(
    useCallback(() => {
      if (routeId) return; // only the index (new chat) handles pending questions
      if (!pendingQuestion) return;
      if (pendingQuestion.id === processedPendingRef.current) return;
      processedPendingRef.current = pendingQuestion.id;
      const q = pendingQuestion.text;
      // Clear synchronously so no other mounted ChatScreen can reprocess it
      setPendingQuestion(null);

      // Reset to a fresh new chat before sending
      setCreatedId(null);
      setMessages([]);
      setInput('');
      lastSyncedId.current = null;
      sendingRef.current = false;
      setSending(false);
      setTyping(false);
      queryClient.removeQueries({ queryKey: ['messages'] });

      sendMessage(q);
    }, [routeId, pendingQuestion, setPendingQuestion, setTyping, sendMessage]),
  );

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

  const handleSelectConversation = (convId: string) => {
    setSidebarOpen(false);
    setMessages([]);
    lastSyncedId.current = null;
    setCreatedId(null);
    if (routeId) {
      router.setParams({ id: convId });
    } else {
      router.push({ pathname: '/(tabs)/chat/[id]', params: { id: convId } });
    }
  };

  const handleNewChat = () => {
    haptic('light');
    router.navigate({ pathname: '/(tabs)/chat', params: { reset: String(Date.now()) } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ChatSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userId={userId ?? ''}
        activeId={activeConvId}
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
            <View style={[styles.logoCircle, { backgroundColor: isDark ? '#000000' : c.surface }]}>
              <LogoImage size={24} />
            </View>
            <CText variant="h3" style={{ color: c.text }}>
              {"Qur'an Chat"}
            </CText>
          </View>
          <Pressable
            hitSlop={12}
            style={styles.iconBtn}
            onPress={handleNewChat}
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

        <View style={{ backgroundColor: c.background }}>
          <View style={styles.inputBar}>
            <MessageInput
              value={input}
              onChange={setInput}
              onSend={() => sendMessage(input)}
              disabled={sending}
            />
          </View>
        </View>
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
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  const questions = getPersonalizedQuestions(userTopics);

  return (
    <ScrollView
      contentContainerStyle={styles.emptyContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.circle, { borderColor: isDark ? '#000000' : c.border, backgroundColor: isDark ? '#000000' : c.surface }]}>
        <LogoImage size={52} />
      </View>
      <CText serif variant="h3" style={styles.welcomeTitle}>
        {"How can I help you understand the Qur'an today?"}
      </CText>
      <View style={styles.chips}>
        {questions.map((q: string) => (
          <View
            key={q}
            style={[
              styles.chip,
              {
                backgroundColor: isDark ? c.surfaceMuted : '#E6F4EE',
                borderColor: isDark ? c.border : '#C8E6D8',
              }
            ]}
          >
            <TouchableOpacity
              onPress={() => onPick(q)}
              activeOpacity={0.7}
            >
              <CText variant="small" style={{ flexShrink: 1, color: isDark ? c.text : '#064E3B', fontWeight: '500' }}>
                {q}
              </CText>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
});
