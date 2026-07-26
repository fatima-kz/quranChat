import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CText } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import type { Citation } from '@/types';

type Props = {
  citation: Citation | null;
};

export function CitationFooter({ citation }: Props) {
  const c = useThemeColors();
  if (!citation) return null;

  return (
    <View style={[styles.card, { backgroundColor: c.background, borderColor: c.border }]}>
      <View style={styles.cardHeader}>
        <View>
          <CText variant="caption" style={{ color: c.accent, letterSpacing: 1.5, fontWeight: '700' }}>
            SURAH AL-BAQARAH
          </CText>
          <CText variant="small" muted style={{ marginTop: 2 }}>
            Ayah {citation.ayah}
          </CText>
        </View>
        <Ionicons name="sparkles" size={22} color={c.accent} />
      </View>

      <View style={[styles.quoteWrap, { borderLeftColor: c.textMuted }]}>
        <CText
          variant="body"
          style={{
            color: c.text,
            fontFamily: 'SourceSerif4Italic',
            fontStyle: 'italic',
            lineHeight: 24,
          }}
        >
          &ldquo;O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.&rdquo;
        </CText>
      </View>

      <View style={styles.tags}>
        <View style={[styles.tag, { backgroundColor: c.surfaceMuted }]}>
          <CText variant="caption" style={{ color: c.primary }}>
            #Patience
          </CText>
        </View>
        <View style={[styles.tag, { backgroundColor: c.surfaceMuted }]}>
          <CText variant="caption" style={{ color: c.primary }}>
            #Prayer
          </CText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  quoteWrap: {
    borderLeftWidth: 3,
    paddingLeft: 12,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
