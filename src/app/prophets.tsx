import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { CText } from '@/components/ui';
import { useThemeColors } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme.store';
import { useHaptics } from '@/hooks/useHaptics';
import { useChatStore } from '@/store/chat.store';

type Prophet = {
  id: string;
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const PROPHETS: Prophet[] = [
  { id: 'adam', name: 'Adam (AS)', title: 'The First Man', icon: 'person-outline' },
  { id: 'idris', name: 'Idris (AS)', title: 'The Educated', icon: 'book-outline' },
  { id: 'nuh', name: 'Nuh (AS)', title: 'The Great Ark', icon: 'boat-outline' },
  { id: 'hud', name: 'Hud (AS)', title: "Prophet to 'Ad", icon: 'partly-sunny-outline' },
  { id: 'salih', name: 'Salih (AS)', title: 'The She-Camel', icon: 'cloud-outline' },
  { id: 'ibrahim', name: 'Ibrahim (AS)', title: 'Friend of Allah (Khalilullah)', icon: 'star-outline' },
  { id: 'lut', name: 'Lut (AS)', title: 'Prophet to Sodom', icon: 'business-outline' },
  { id: 'ismail', name: 'Ismail (AS)', title: 'The Well of Zamzam', icon: 'water-outline' },
  { id: 'ishaq', name: 'Ishaq (AS)', title: 'Son of Ibrahim (AS)', icon: 'people-outline' },
  { id: 'yaqub', name: 'Yaqub (AS)', title: 'Father of Yusuf (AS)', icon: 'eye-outline' },
  { id: 'yusuf', name: 'Yusuf (AS)', title: 'The Interpreter of Dreams', icon: 'bulb-outline' },
  { id: 'ayoub', name: 'Ayoub (AS)', title: 'The Patient', icon: 'heart-half-outline' },
  { id: 'shuaib', name: 'Shuaib (AS)', title: 'The Speaker', icon: 'megaphone-outline' },
  { id: 'musa', name: 'Musa (AS)', title: 'The One Who Spoke to Allah', icon: 'flash-outline' },
  { id: 'harun', name: 'Harun (AS)', title: 'Brother of Musa (AS)', icon: 'people-circle-outline' },
  { id: 'dawud', name: 'Dawud (AS)', title: 'The King and Prophet', icon: 'shield-outline' },
  { id: 'sulaiman', name: 'Sulaiman (AS)', title: 'Ruler of Jinn and Men', icon: 'key-outline' },
  { id: 'ilyas', name: 'Ilyas (AS)', title: 'Prophet to Baal', icon: 'flame-outline' },
  { id: 'al-yasa', name: 'Al-Yasa (AS)', title: 'Successor of Ilyas', icon: 'leaf-outline' },
  { id: 'yunus', name: 'Yunus (AS)', title: 'Companion of the Whale', icon: 'fish-outline' },
  { id: 'zakariyya', name: 'Zakariyya (AS)', title: 'Guardian of Maryam', icon: 'lock-closed-outline' },
  { id: 'yahya', name: 'Yahya (AS)', title: 'The Chaste Prophet', icon: 'water-outline' },
  { id: 'isa', name: 'Isa (AS)', title: 'The Messiah', icon: 'medical-outline' },
  { id: 'muhammad', name: 'Muhammad (SAW)', title: 'The Final Messenger', icon: 'moon-outline' },
];

export default function ProphetsScreen() {
  const c = useThemeColors();
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  const haptic = useHaptics();

  const [search, setSearch] = useState('');
  const [selectedProphet, setSelectedProphet] = useState<Prophet | null>(null);

  const filteredProphets = PROPHETS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectProphet = (prophet: Prophet) => {
    haptic('light');
    setSelectedProphet(prophet);
  };

  const handleSendToChat = () => {
    if (!selectedProphet) return;
    haptic('light');
    const question = `Tell me about Prophet ${selectedProphet.name} and his story in the Qur'an`;
    useChatStore.getState().setPendingQuestion(question);
    setSelectedProphet(null);
    router.navigate('/(tabs)/chat');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={() => { haptic('light'); router.back(); }} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={26} color={c.text} />
          </Pressable>
          <CText serif variant="h2" style={{ color: c.text, marginLeft: 8 }}>
            Prophet Stories
          </CText>
        </View>
        <Ionicons name="compass-outline" size={24} color={c.primary} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={[styles.searchWrap, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
          <Ionicons name="search" size={20} color={c.textMuted} />
          <TextInput
            style={[styles.input, { color: c.text }]}
            placeholder="Search for a messenger..."
            placeholderTextColor={c.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: isDark ? '#064E3B' : '#065F46' }]}>
          <CText variant="caption" style={{ color: '#A7F3D0', letterSpacing: 1, marginBottom: 8, fontWeight: '700' }}>
            DAILY WISDOM
          </CText>
          <CText serif style={{ color: '#fff', fontSize: 20, lineHeight: 28, fontStyle: 'italic', marginBottom: 12 }}>
            "Indeed, in their stories, there is a lesson for people of understanding."
          </CText>
          <CText style={{ color: '#A7F3D0', fontSize: 13 }}>
            — Surah Yusuf, 12:111
          </CText>
        </View>

        {/* Prophets List */}
        <View style={styles.list}>
          {filteredProphets.map((prophet) => (
            <Pressable
              key={prophet.id}
              style={({ pressed }) => [
                styles.prophetCard,
                { backgroundColor: c.surface, borderColor: isDark ? '#374151' : '#F3F4F6' },
                pressed && { backgroundColor: c.surfaceMuted },
              ]}
              onPress={() => handleSelectProphet(prophet)}
            >
              <View style={[styles.iconWrap, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
                <Ionicons name={prophet.icon} size={20} color={isDark ? '#fff' : '#064E3B'} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <CText serif style={{ color: c.text, fontSize: 18, fontWeight: '600', marginBottom: 2 }}>
                  {prophet.name}
                </CText>
                <CText variant="caption" muted>
                  {prophet.title}
                </CText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
            </Pressable>
          ))}
          {filteredProphets.length === 0 && (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <CText muted>No prophets found for "{search}"</CText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Spiritual AI Chat Modal */}
      <Modal
        visible={!!selectedProphet}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedProphet(null)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedProphet(null)} />
          
          <View style={[styles.modalContent, { backgroundColor: c.background }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="sparkles" size={20} color={c.primary} style={{ marginRight: 8 }} />
                <CText serif style={{ color: c.text, fontSize: 18, fontWeight: '700' }}>
                  Spiritual AI Chat
                </CText>
              </View>
              <Pressable onPress={() => { haptic('light'); setSelectedProphet(null); }} hitSlop={12}>
                <Ionicons name="close" size={24} color={c.textMuted} />
              </Pressable>
            </View>

            {/* Chat Preview */}
            <View style={styles.chatPreview}>
              <View style={[styles.chatBubble, { backgroundColor: isDark ? '#1F2937' : '#F4F6F9' }]}>
                <CText style={{ color: c.text, lineHeight: 22 }}>
                  As-salamu alaykum! How can I help you explore the story of <CText style={{ fontWeight: '700', color: c.text }}>{selectedProphet?.name}</CText> today?
                </CText>
              </View>
              <CText variant="caption" style={{ color: c.textMuted, fontSize: 10, marginTop: 4, marginLeft: 4 }}>
                Just now
              </CText>
            </View>

            {/* Input Bar */}
            <View style={[styles.inputBar, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
              <View style={[styles.inputInner, { backgroundColor: c.surface, borderColor: c.border }]}>
                <TextInput
                  style={[styles.input, { color: c.text, height: 44, marginHorizontal: 16 }]}
                  value={`Tell me about Prophet ${selectedProphet?.name}...`}
                  editable={false}
                />
                <Pressable
                  style={[styles.sendBtn, { backgroundColor: isDark ? '#064E3B' : '#065F46' }]}
                  onPress={handleSendToChat}
                >
                  <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginLeft: 2 }} />
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    marginTop: 8,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  heroCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  list: {
    gap: 12,
  },
  prophetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  chatPreview: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  chatBubble: {
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    maxWidth: '90%',
  },
  inputBar: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150,150,150,0.2)',
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingRight: 6,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
