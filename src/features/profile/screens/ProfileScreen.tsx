import { useEffect, useState } from 'react';
import {
  View,
  Switch,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { useThemeColors } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useThemeStore } from '@/store/theme.store';
import { CText, Button, Input, Chip } from '@/components/ui';
import { Screen } from '@/components/layout';
import { useAuthStore } from '@/store/auth.store';
import { signOut, upsertProfile } from '@/services/auth.service';
import { listConversations } from '@/services/chat.service';
import {
  scheduleDailyReminder,
  cancelDailyReminder,
  isReminderScheduled,
  hasNotificationPermission,
} from '@/services/notifications.service';
import { getGoalSubtitle } from '@/constants/prompts';
import type { Gender } from '@/types';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

type FormValues = {
  full_name: string;
  age: string;
  gender: Gender;
};

const APP_VERSION = `VERSION ${Constants.expoConfig?.version ?? '1.0.0'}`;

function genderLabel(g: Gender | null): string {
  if (!g) return 'Not specified';
  return g.charAt(0).toUpperCase() + g.slice(1);
}

export default function ProfileScreen() {
  const c = useThemeColors();
  const haptic = useHaptics();
  const isDark = useThemeStore((s) => s.resolved) === 'dark';

  const profile = useAuthStore((s) => s.profile);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [remindersOn, setRemindersOn] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [editAvatar, setEditAvatar] = useState<string | null>(null);

  const userId = profile?.id ?? null;
  const { data: conversations } = useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => listConversations(userId as string),
    enabled: !!userId,
  });

  const conversationCount = conversations?.length ?? 0;
  const daysSinceJoin = profile?.created_at
    ? Math.max(1, Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000))
    : 1;
  const subtitle = getGoalSubtitle(profile?.goal ?? null);

  useEffect(() => {
    (async () => {
      const perm = await hasNotificationPermission();
      const scheduled = await isReminderScheduled();
      setRemindersOn(perm && scheduled);
    })();
  }, []);

  const handleToggleReminders = async (value: boolean) => {
    haptic('selection');
    if (value) {
      const ok = await scheduleDailyReminder({ hour: 9, minute: 0 });
      setRemindersOn(ok);
      if (!ok) {
        alert('Please allow notifications in Settings to receive daily reminders.');
      }
    } else {
      await cancelDailyReminder();
      setRemindersOn(false);
    }
  };

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { full_name: '', age: '', gender: 'unspecified' },
  });

  if (!profile) {
    return (
      <Screen noPadding>
        <View style={styles.loadingWrap}>
          <Ionicons name="refresh" size={32} color={c.primary} />
        </View>
      </Screen>
    );
  }

  const displayName = profile.full_name?.trim() || profile.email;

  const openModal = () => {
    haptic('light');
    reset({
      full_name: profile.full_name ?? '',
      age: profile.age != null ? String(profile.age) : '',
      gender: profile.gender ?? 'unspecified',
    });
    setEditAvatar(profile.avatar_url ?? null);
    setModalVisible(true);
  };

  const closeModal = () => {
    haptic('light');
    setModalVisible(false);
  };

  const handleToggleDark = () => {
    haptic('selection');
    useThemeStore.getState().setPreference(isDark ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    haptic('medium');
    await signOut();
    router.replace('/(auth)/login');
  };

  const onSave = async (values: FormValues) => {
    try {
      setSaving(true);
      await upsertProfile(profile.id, profile.email, {
        full_name: values.full_name.trim(),
        age: Number(values.age),
        gender: values.gender,
        avatar_url: editAvatar,
        goal: profile.goal,
        topics: profile.topics ?? [],
      });
      haptic('success');
      setModalVisible(false);
    } catch {
      haptic('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen noPadding style={{ backgroundColor: c.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.background }}>
        <View style={styles.header}>
          <Pressable hitSlop={12} style={styles.iconBtn} onPress={() => { haptic('light'); router.push('/(tabs)/home'); }}>
            <Ionicons name="chevron-back" size={26} color={c.text} />
          </Pressable>
          <CText variant="h3" style={{ color: c.text }}>
            Profile
          </CText>
          <View style={styles.iconBtn} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { borderColor: c.accent, backgroundColor: c.surface }]}>
              {profile.avatar_url && !avatarError ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatarImage}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <CText variant="h1" style={{ color: c.primary }}>
                  {displayName.charAt(0).toUpperCase()}
                </CText>
              )}
            </View>
            <Pressable onPress={openModal} style={[styles.editBadge, { backgroundColor: c.primary, borderColor: c.background }]}>
              <Ionicons name="pencil" size={14} color="#FFFFFF" />
            </Pressable>
          </View>

          <CText variant="h1" style={styles.profileName}>
            {profile.full_name ?? 'New User'}
          </CText>
          <CText variant="body" muted>
            {subtitle}
          </CText>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: c.surface, shadowColor: c.text }]}>
            <CText variant="h1" style={{ color: c.accent, fontSize: 28, lineHeight: 34 }}>
              {conversationCount}
            </CText>
            <CText variant="caption" muted style={{ letterSpacing: 1 }}>
              CONVERSATIONS
            </CText>
          </View>
          <View style={[styles.statCard, { backgroundColor: c.surface, shadowColor: c.text }]}>
            <CText variant="h1" style={{ color: c.accent, fontSize: 28, lineHeight: 34 }}>
              {daysSinceJoin}
            </CText>
            <CText variant="caption" muted style={{ letterSpacing: 1 }}>
              DAYS WITH APP
            </CText>
          </View>
        </View>

        {/* Account Settings */}
        <CText variant="caption" muted style={styles.sectionLabel}>
          ACCOUNT SETTINGS
        </CText>
        <View style={[styles.card, { backgroundColor: c.surface, shadowColor: c.text }]}>
          <SettingRow
            icon="person-outline"
            label="Edit Profile"
            onPress={openModal}
            showChevron
          />

          <SettingRow
            icon="moon-outline"
            label="Dark Mode"
            right={<Switch value={isDark} onValueChange={handleToggleDark} trackColor={{ false: c.border, true: c.primary }} />}
          />

          <SettingRow
            icon="notifications-outline"
            label="Notifications"
            right={<Switch value={remindersOn} onValueChange={handleToggleReminders} trackColor={{ false: c.border, true: c.primary }} />}
            isLast
          />
        </View>

        {/* More */}
        <CText variant="caption" muted style={styles.sectionLabel}>
          MORE
        </CText>
        <View style={[styles.card, { backgroundColor: c.surface, shadowColor: c.text }]}>
          <SettingRow
            icon="information-circle-outline"
            label="About Al-Qur'an"
            onPress={() => {
              haptic('light');
              Alert.alert(
                "Al-Qur'an",
                "A compassionate AI companion to help you understand the Qur'an. Answers are grounded in the Qur'an with citations. For religious rulings, please consult a qualified scholar.\n\nVersion 1.0.0",
                [{ text: 'Close' }]
              );
            }}
            showChevron
          />

          <Pressable onPress={handleLogout} style={[styles.logoutRow, { borderTopColor: c.border }]}>
            <View style={[styles.iconCircle, { backgroundColor: c.danger + '12' }]}>
              <Ionicons name="log-out-outline" size={22} color={c.danger} />
            </View>
            <CText variant="bodyMedium" style={{ color: c.danger }}>
              Logout
            </CText>
          </Pressable>
        </View>

        <CText variant="caption" muted style={{ textAlign: 'center', marginTop: 24, letterSpacing: 1 }}>
          {APP_VERSION}
        </CText>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={false} onRequestClose={closeModal}>
        <SafeAreaView style={[styles.modalRoot, { backgroundColor: c.background }]}>
          <View style={styles.modalBar}>
            <Pressable onPress={closeModal} hitSlop={12}>
              <Ionicons name="chevron-down" size={26} color={c.text} />
            </Pressable>
            <CText variant="h3">Edit Profile</CText>
            <View style={styles.modalBarRight} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            {/* Avatar picker */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity
                onPress={async () => {
                  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert('Permission needed', 'Please allow access to your photos.');
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
                      const uri = result.assets[0].uri;
                      const filename = uri.split('/').pop() ?? `avatar-${Date.now()}.jpg`;
                      const dest = `${FileSystem.documentDirectory}avatars/${filename}`;
                      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}avatars`, { intermediates: true });
                      await FileSystem.copyAsync({ from: uri, to: dest });
                      setEditAvatar(dest);
                    } catch {
                      setEditAvatar(result.assets[0].uri);
                    }
                  }
                }}
                activeOpacity={0.8}
                style={{ alignItems: 'center' }}
              >
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    backgroundColor: c.surfaceMuted,
                    borderWidth: 2,
                    borderColor: c.primaryDeep,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {editAvatar ? (
                    <Image source={{ uri: editAvatar }} style={{ width: 100, height: 100 }} />
                  ) : (
                    <Ionicons name="person" size={40} color="#9CA3AF" />
                  )}
                </View>
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: -4,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: c.primaryDeep,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: c.surface,
                  }}
                >
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <CText variant="caption" muted style={{ marginTop: 10 }}>
                Tap to change photo
              </CText>
            </View>

            <Controller
              control={control}
              name="full_name"
              rules={{ required: 'Name is required' }}
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Full Name"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Your name"
                />
              )}
            />

            <Controller
              control={control}
              name="age"
              rules={{
                required: 'Age is required',
                validate: (v) => (!isNaN(Number(v)) && Number(v) > 0) || 'Enter a valid age',
              }}
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Age"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="e.g. 25"
                  keyboardType="numeric"
                />
              )}
            />

            <View style={styles.genderField}>
              <CText variant="caption" muted style={styles.fieldLabel}>
                Gender
              </CText>
              <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.chipRow}>
                    {(['male', 'female', 'other'] as Gender[]).map((g) => (
                      <Chip
                        key={g}
                        label={genderLabel(g)}
                        multi={false}
                        selected={value === g}
                        onSelect={() => onChange(g)}
                        style={styles.chip}
                      />
                    ))}
                  </View>
                )}
              />
            </View>

            <View
              style={{
                marginTop: 8,
                width: '100%',
                height: 56,
                borderRadius: 14,
                backgroundColor: c.primaryDeep,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 4,
                opacity: saving ? 0.7 : 1,
              }}
            >
              <TouchableOpacity
                onPress={handleSubmit(onSave)}
                disabled={saving}
                activeOpacity={0.85}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <CText variant="body" style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 17 }}>
                    Save
                  </CText>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}

function SettingRow({
  icon,
  label,
  onPress,
  right,
  showChevron,
  isLast,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  showChevron?: boolean;
  isLast?: boolean;
}) {
  const c = useThemeColors();
  const content = (
    <View style={[styles.settingRow, !isLast && { borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={[styles.iconCircle, { backgroundColor: c.surfaceMuted }]}>
        <Ionicons name={icon} size={22} color={c.primary} />
      </View>
      <CText variant="body" style={{ flex: 1, color: c.text }}>
        {label}
      </CText>
      {right ? (
        right
      ) : showChevron ? (
        <Ionicons name="chevron-forward" size={20} color={c.textMuted} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  editBadge: {
    position: 'absolute',
    right: -4,
    bottom: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileName: { marginTop: 16, fontSize: 28, lineHeight: 34 },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionLabel: {
    marginBottom: 12,
    letterSpacing: 1,
  },
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 28,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  modalRoot: { flex: 1 },
  modalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
  },
  modalBarRight: { width: 26 },
  modalScroll: { padding: 24, gap: 18 },
  genderField: { gap: 8 },
  fieldLabel: { marginLeft: 4 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1 },
  saveBtn: { marginTop: 8 },
});
