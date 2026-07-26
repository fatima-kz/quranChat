import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import { CText, Skeleton } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { listConversations } from '@/services/chat.service';
import { formatRelative } from '@/utils/formatDate';
import { truncate } from '@/utils/truncate';
import type { Conversation } from '@/types';

type Props = {
  userId: string;
};

export function ConversationList({ userId }: Props) {
  const c = useThemeColors();
  const { data, isLoading } = useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => listConversations(userId),
  });

  const items = (data ?? []).slice(0, 6);

  if (!isLoading && items.length === 0) return null;

  return (
    <View style={styles.container}>
      <CText variant="caption" muted style={styles.heading}>
        Recent conversations
      </CText>
      {isLoading ? (
        <View style={styles.skeletons}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={44} />
          ))}
        </View>
      ) : (
        <FlatList<Conversation>
          data={items}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/chat/[id]', params: { id: item.id } })
              }
              style={({ pressed }) => [
                styles.row,
                { borderColor: c.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <CText numberOfLines={1} style={styles.title}>
                {truncate(item.title, 40)}
              </CText>
              <CText variant="caption" muted>
                {formatRelative(item.created_at)}
              </CText>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 28,
  },
  heading: {
    marginBottom: 10,
  },
  skeletons: {
    gap: 10,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  title: {
    flexShrink: 1,
    marginBottom: 2,
  },
});
