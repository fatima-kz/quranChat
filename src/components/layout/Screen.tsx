import { View, type ViewProps, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/hooks/useTheme';

type Props = ViewProps & {
  safe?: boolean;
  noPadding?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function Screen({ safe = true, noPadding, edges, style, children, ...props }: Props) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();

  const Container = safe ? SafeAreaView : View;

  const padding = !noPadding
    ? { paddingHorizontal: 24, paddingTop: insets.top > 0 ? 8 : 16 }
    : undefined;

  return (
    <Container
      style={[styles.container, { backgroundColor: c.background }, padding, style]}
      edges={edges}
      {...props}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
