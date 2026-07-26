import { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Image,
  Text,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { useThemeColors } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { Screen } from '@/components/layout';
import { CText, Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { useOnboardingStore } from '@/store/onboarding.store';
import { upsertProfile } from '@/services/auth.service';
import type { Gender } from '@/types';

const GENDERS: { id: Gender; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
];

const TERMS_URL = 'https://example.com/terms';

function openLegal() {
  Linking.openURL(TERMS_URL);
}

type FormValues = { full_name: string; age: string };

export default function ProfileSetupScreen() {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const haptic = useHaptics();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender | ''>('');
  const [genderModal, setGenderModal] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { full_name: '', age: '' },
  });

  const persistImage = async (uri: string): Promise<string> => {
    const filename = uri.split('/').pop() ?? `avatar-${Date.now()}.jpg`;
    const dest = `${FileSystem.documentDirectory}avatars/${filename}`;
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}avatars`, { intermediates: true });
    await FileSystem.copyAsync({ from: uri, to: dest });
    return dest;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access photos is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      try {
        const permanentUri = await persistImage(result.assets[0].uri);
        setAvatar(permanentUri);
        setErrorMsg(null);
      } catch {
        setAvatar(result.assets[0].uri);
      }
    }
  };

  const onSubmit = async (values: FormValues) => {
    setErrorMsg(null);
    if (!gender) {
      setErrorMsg('Please select a gender');
      return;
    }
    setSubmitting(true);
    try {
      const { goal, topics } = useOnboardingStore.getState().answers;
      const session = useAuthStore.getState().session;
      const localProfile = useAuthStore.getState().profile;
      let userId: string;
      let email: string;
      if (session?.user) {
        userId = session.user.id;
        email = session.user.email ?? localProfile?.email ?? '';
      } else {
        userId = localProfile?.id ?? 'local-user';
        email = localProfile?.email ?? '';
      }
      await upsertProfile(userId, email, {
        full_name: values.full_name.trim(),
        age: Number(values.age),
        gender,
        avatar_url: avatar,
        goal,
        topics,
      });
      haptic('success');
      useOnboardingStore.getState().setDone(true);
      router.replace('/(tabs)/home');
    } catch (e) {
      haptic('error');
      setErrorMsg(e instanceof Error ? e.message : 'Could not save your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen noPadding style={{ backgroundColor: c.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32, paddingTop: insets.top + 12 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar with progress */}
          <View style={{ flexDirection: 'row', alignItems: 'center', height: 52, marginBottom: 8 }}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="chevron-back" size={26} color={c.text} />
            </Pressable>
            <View style={{ flex: 1, height: 6, borderRadius: 3, marginHorizontal: 16, overflow: 'hidden', backgroundColor: c.border }}>
              <View style={{ height: '100%', borderRadius: 3, backgroundColor: '#064E3B', width: '75%' }} />
            </View>
            <View style={{ width: 44 }} />
          </View>

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <Pressable onPress={pickImage} style={[styles.avatar, { backgroundColor: c.surfaceMuted, borderColor: c.border }]}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="image-outline" size={36} color={c.textMuted} />
              )}
            </Pressable>
            <CText variant="h1" style={styles.title}>
              {"Welcome to Qur'an Chat"}
            </CText>
            <CText variant="body" muted style={{ textAlign: 'center', marginTop: 8 }}>
              Let&apos;s create your profile to begin your journey of spiritual reflection.
            </CText>
          </Animated.View>

          {/* Form card */}
          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.cardWrap}>
            <View style={[styles.card, { backgroundColor: c.surface, shadowColor: c.text }]}>
              {/* Full name */}
              <Controller
                control={control}
                name="full_name"
                rules={{ validate: (v) => v.trim().length >= 2 || 'Please enter your name (min 2 characters)' }}
                render={({ field: { onChange, onBlur, value }, fieldState }) => (
                  <Input
                    label="FULL NAME"
                    placeholder="E.g. Adam Gabriel"
                    autoComplete="name"
                    textContentType="name"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={fieldState.error?.message}
                    iconRight={<Ionicons name="person-outline" size={20} color={c.textMuted} />}
                  />
                )}
              />

              {/* Age + Gender row */}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name="age"
                    rules={{
                      validate: (v) => {
                        const n = Number(v);
                        if (!v.trim()) return 'Please enter your age';
                        if (!/^\d+$/.test(v.trim())) return 'Enter a valid number';
                        if (n < 10 || n > 120) return 'Age must be between 10 and 120';
                        return true;
                      },
                    }}
                    render={({ field: { onChange, onBlur, value }, fieldState }) => (
                      <Input
                        label="AGE"
                        placeholder="25"
                        keyboardType="numeric"
                        maxLength={3}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </View>
                <View style={{ flex: 1.2 }}>
                  <CText variant="caption" muted style={{ marginLeft: 4, marginBottom: 6 }}>
                    GENDER
                  </CText>
                  <Pressable
                    onPress={() => { haptic('light'); setGenderModal(true); }}
                    style={[styles.select, { backgroundColor: c.surfaceMuted, borderColor: c.border }]}
                  >
                    <CText variant="body" style={{ color: gender ? c.text : c.textMuted }}>
                      {gender ? GENDERS.find((g) => g.id === gender)?.label : 'Select'}
                    </CText>
                    <Ionicons name="chevron-down" size={18} color={c.textMuted} />
                  </Pressable>
                </View>
              </View>

              {/* Photo picker */}
              <Pressable
                onPress={pickImage}
                style={[styles.photoRow, { borderColor: c.border, borderStyle: 'dashed' }]}
              >
                <View style={[styles.photoIcon, { backgroundColor: c.surfaceMuted }]}>
                  <Ionicons name="camera-outline" size={22} color={c.primary} />
                </View>
                <View>
                  <CText variant="bodyMedium" style={{ color: c.text }}>
                    Add profile photo
                  </CText>
                  <CText variant="caption" muted>
                    OPTIONAL
                  </CText>
                </View>
              </Pressable>

              {errorMsg ? (
                <CText variant="small" style={{ color: c.danger, textAlign: 'center' }}>
                  {errorMsg}
                </CText>
              ) : null}

              <View
                style={{
                  width: '100%',
                  height: 56,
                  borderRadius: 14,
                  backgroundColor: '#064E3B',
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 4,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  disabled={submitting}
                  activeOpacity={0.85}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 17, marginRight: 10 }}>
                        Start Exploring
                      </Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <CText variant="caption" muted style={{ textAlign: 'center', marginTop: 14 }}>
                Step 3 of 3
              </CText>
            </View>
          </Animated.View>

          <CText variant="caption" style={{ color: c.textMuted, textAlign: 'center', marginTop: 8 }} onPress={openLegal}>
            Privacy Policy & Terms
          </CText>
        </ScrollView>
      </KeyboardAvoidingView>

      <GenderModal visible={genderModal} onClose={() => setGenderModal(false)} onSelect={(g) => { setGender(g); setGenderModal(false); }} />
    </Screen>
  );
}

function GenderModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (g: Gender) => void;
}) {
  const c = useThemeColors();
  const haptic = useHaptics();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.modalOverlay, { backgroundColor: 'rgba(31,41,55,0.45)' }]} onPress={onClose}>
        <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
          <CText variant="h3" style={{ marginBottom: 16, textAlign: 'center' }}>
            Select Gender
          </CText>
          {GENDERS.map((g) => (
            <Pressable
              key={g.id}
              onPress={() => { haptic('selection'); onSelect(g.id); }}
              style={[styles.modalItem, { borderBottomColor: c.border }]}
            >
              <CText variant="body" style={{ color: c.text }}>{g.label}</CText>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 28,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
  },
  cardWrap: { marginBottom: 16 },
  card: {
    borderRadius: 28,
    padding: 24,
    gap: 18,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    marginTop: 4,
  },
  photoIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 20,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
});
