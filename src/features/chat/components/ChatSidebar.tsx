import { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { CText } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme.store';
import { useHaptics } from '@/hooks/useHaptics';
import { listConversations } from '@/services/chat.service';
import { formatRelative } from '@/utils/formatDate';

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string;
  activeId: string | null;
  onSelect: (id: string, title: string) => void;
};

const { width: SCREEN_W } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(300, SCREEN_W * 0.78);

export function ChatSidebar({ open, onClose, userId, activeId, onSelect }: Props) {
  const c = useThemeColors();
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  const haptic = useHaptics();
  const insets = useSafeAreaInsets();

  const translateX = useSharedValue(-DRAWER_WIDTH);
  const overlayOpacity = useSharedValue(0);

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => listConversations(userId),
    enabled: !!userId && open,
  });

  useEffect(() => {
    if (open) {
      translateX.value = withTiming(0, { duration: 260 });
      overlayOpacity.value = withTiming(1, { duration: 260 });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 220 });
      overlayOpacity.value = withTiming(0, { duration: 220 });
    }
  }, [open, translateX, overlayOpacity]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!open) return null;

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 100 }]} pointerEvents="box-none">
      {/* Backdrop overlay */}
      <Animated.View
        pointerEvents="auto"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)' }, overlayStyle]}
      >
        <Pressable onPress={onClose} style={StyleSheet.absoluteFillObject} />
      </Animated.View>

      {/* Drawer panel - slides in from left */}
      <Animated.View
        pointerEvents="auto"
        style={[
          {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: DRAWER_WIDTH,
            backgroundColor: c.surface,
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 12,
          },
          drawerStyle,
        ]}
      >
        {/* Top accent bar */}
        <View style={{ height: 4, width: '100%', backgroundColor: c.primaryDeep }} />

        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: insets.top + 12,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
          }}
        >
          <CText variant="h3" style={{ color: c.text }}>Chat History</CText>
          <TouchableOpacity onPress={onClose} hitSlop={12} activeOpacity={0.7}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: c.surfaceMuted,
              }}
            >
              <Ionicons name="close" size={20} color={c.text} />
            </View>
          </TouchableOpacity>
        </View>

        {/* New Chat button */}
        <View
          style={{
            marginHorizontal: 14,
            marginTop: 14,
            marginBottom: 6,
            borderRadius: 16,
            backgroundColor: isDark ? c.surfaceMuted : '#E6F4EE',
            borderWidth: 1,
            borderColor: isDark ? c.border : '#C8E6D8',
            overflow: 'hidden',
          }}
        >
          <TouchableOpacity
            onPress={() => { haptic('light'); onClose(); router.navigate({ pathname: '/(tabs)/chat', params: { reset: String(Date.now()) } }); }}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: c.primaryDeep,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </View>
            <CText variant="bodyMedium" style={{ color: isDark ? c.primary : '#064E3B', fontWeight: '600' }}>New Chat</CText>
          </TouchableOpacity>
        </View>

        {/* Conversation list */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 20 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <ActivityIndicator color={c.primary} />
            </View>
          ) : conversations && conversations.length > 0 ? (
            conversations.map((conv, index) => {
              const isActive = activeId === conv.id;
              return (
                <View
                  key={conv.id}
                  style={{
                    marginTop: index === 0 ? 8 : 6,
                    borderRadius: 14,
                    backgroundColor: isActive ? (isDark ? c.surfaceMuted : '#E6F4EE') : c.surface,
                    borderWidth: 1,
                    borderColor: isActive ? (isDark ? c.primary : '#C8E6D8') : c.border,
                    overflow: 'hidden',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => { haptic('light'); onSelect(conv.id, conv.title); }}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isActive ? (isDark ? c.primaryDeep : '#C8E6D8') : c.surfaceMuted,
                      }}
                    >
                      <Ionicons
                        name={isActive ? 'chatbubble' : 'chatbubble-outline'}
                        size={16}
                        color={isActive ? (isDark ? '#FFFFFF' : '#064E3B') : c.textMuted}
                      />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <CText variant="small" style={{ color: c.text, fontWeight: '500' }} numberOfLines={1}>
                        {conv.title}
                      </CText>
                      <CText variant="caption" style={{ color: c.textMuted }}>
                        {formatRelative(conv.created_at)}
                      </CText>
                    </View>
                    {isActive && (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.primary }} />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={{ paddingVertical: 52, paddingHorizontal: 16, alignItems: 'center' }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: c.surfaceMuted,
                }}
              >
                <Ionicons name="chatbubbles-outline" size={32} color={c.textMuted} />
              </View>
              <CText variant="body" style={{ textAlign: 'center', marginTop: 12, color: c.textMuted }}>
                No conversations yet
              </CText>
              <CText variant="small" style={{ textAlign: 'center', marginTop: 4, color: c.textMuted }}>
                Start a new chat to see your history here.
              </CText>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}
