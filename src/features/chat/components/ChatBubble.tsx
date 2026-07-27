import { Pressable, StyleSheet, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

import { CText, Icon } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useSavedStore } from '@/store/saved.store';
import type { Message } from '@/types';
import { formatTime } from '@/utils/formatDate';

import { CitationFooter } from './CitationFooter';

type Props = {
  message: Message;
  onCopy: (content: string) => void;
  onBookmark: (message: Message) => void;
  error?: boolean;
};

export function ChatBubble({ message, onCopy, onBookmark, error }: Props) {
  const c = useThemeColors();
  const haptic = useHaptics();
  const saveAiResponse = useSavedStore((s) => s.saveAiResponse);
  const unsaveAiResponse = useSavedStore((s) => s.unsaveAiResponse);
  const isAiSaved = useSavedStore((s) => s.isAiResponseSaved);

  const isSaved = message.role === 'assistant' && isAiSaved(message.id);

  const handleSaveToCollection = () => {
    haptic('light');
    if (isSaved) {
      unsaveAiResponse(message.id);
    } else {
      saveAiResponse({
        id: message.id,
        content: message.content,
        citation: message.citation ?? null,
        timestamp: Date.now(),
      });
    }
  };

  const handleShare = async () => {
    haptic('light');
    const shareText = message.citation
      ? `${message.content}\n\nQur'an ${message.citation.surah}:${message.citation.ayah}`
      : message.content;
    const available = await Sharing.isAvailableAsync();
    if (available) {
      await Sharing.shareAsync(shareText);
    } else {
      await Clipboard.setStringAsync(shareText);
    }
  };

  if (message.role === 'user') {
    return (
      <View style={styles.userWrap}>
        <View style={[styles.userBubble, { backgroundColor: c.primary }]}>
          <CText style={{ color: '#FFFFFF', flexShrink: 1, lineHeight: 22 }}>{message.content}</CText>
        </View>
        <CText variant="caption" muted style={styles.userTime}>
          {formatTime(message.created_at)}
        </CText>
      </View>
    );
  }

  return (
    <View style={styles.assistantWrap}>
      <View
        style={[
          styles.assistantBubble,
          { backgroundColor: c.surface, borderColor: c.border, borderLeftColor: c.primary },
        ]}
      >
        <CText style={{ flexShrink: 1, color: error ? c.danger : c.text, lineHeight: 22 }}>
          {message.content}
        </CText>
        <CitationFooter citation={message.citation} />
      </View>

      {!error && (
        <View style={styles.actions}>
          <Action icon="copy-outline" label="Copy" onPress={() => { haptic('light'); onCopy(message.content); }} />
          <Action icon={message.bookmarked ? 'bookmark' : 'bookmark-outline'} label="Bookmark" onPress={() => { haptic('light'); onBookmark(message); }} />
          <Action
            icon={isSaved ? 'heart' : 'heart-outline'}
            label="Save"
            onPress={handleSaveToCollection}
            highlight={isSaved}
          />
          <Action icon="share-outline" label="Share" onPress={handleShare} />
        </View>
      )}

      <CText variant="caption" muted style={styles.assistantTime}>
        {formatTime(message.created_at)}
      </CText>
    </View>
  );
}

function Action({ icon, label, onPress, highlight }: { icon: React.ComponentProps<typeof Icon>['name']; label: string; onPress: () => void; highlight?: boolean }) {
  const c = useThemeColors();
  const haptic = useHaptics();
  return (
    <Pressable
      onPress={() => { haptic('light'); onPress(); }}
      style={({ pressed }) => [
        styles.actionBtn,
        { backgroundColor: c.surfaceMuted },
        pressed && { opacity: 0.8 },
      ]}
      accessibilityLabel={label}
    >
      <Icon name={icon} size={16} color={highlight ? c.accent : c.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  userWrap: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    marginVertical: 6,
    maxWidth: '88%',
  },
  userBubble: {
    borderRadius: 22,
    borderBottomRightRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  userTime: {
    marginTop: 6,
    marginRight: 4,
  },
  assistantWrap: {
    alignSelf: 'flex-start',
    maxWidth: '92%',
    marginVertical: 8,
  },
  assistantBubble: {
    borderRadius: 22,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderLeftWidth: 4,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginLeft: 6,
    gap: 10,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantTime: {
    marginTop: 6,
    marginLeft: 6,
  },
});
