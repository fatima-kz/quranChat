import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const CHANNEL_ID = 'daily-reminders';
const SCHEDULABLE_ID = 'daily-quran-reminder';
const STORAGE_KEY = '@quranchat:reminderTime';

type ReminderTime = { hour: number; minute: number };

const DEFAULT_TIME: ReminderTime = { hour: 9, minute: 0 };

const REMINDER_MESSAGES = [
  { title: 'Assalamu Alaikum 🌙', body: 'A new verse is waiting for you. Take a moment to reflect today.' },
  { title: 'Your daily reflection ✨', body: 'Pause for a moment of peace with the Qur\'an.' },
  { title: 'A verse for your day 📖', body: 'Start your morning with guidance from the Qur\'an.' },
  { title: 'Bismillah 🤍', body: 'A few seconds of reflection can shift your whole day.' },
  { title: 'Time to reconnect 🕊️', body: 'The Qur\'an is here whenever you\'re ready. Open it today.' },
];

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

async function ensureChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#064E3B',
    });
  }
}

export async function scheduleDailyReminder(time: ReminderTime = DEFAULT_TIME): Promise<boolean> {
  await ensureChannel();
  const granted = await requestNotificationPermissions();
  if (!granted) return false;

  await cancelDailyReminder();

  const message = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      sound: true,
      data: { screen: 'home' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: time.hour,
      minute: time.minute,
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  });

  await saveReminderTime(time);
  return true;
}

export async function cancelDailyReminder(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.identifier === SCHEDULABLE_ID || n.content.data?.screen === 'home') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

export async function isReminderScheduled(): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((n) => n.content.data?.screen === 'home');
}

async function saveReminderTime(time: ReminderTime): Promise<void> {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(time));
}

export async function getReminderTime(): Promise<ReminderTime> {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as ReminderTime;
    } catch {
      return DEFAULT_TIME;
    }
  }
  return DEFAULT_TIME;
}

export async function sendTestReminder(): Promise<void> {
  await ensureChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Assalamu Alaikum 🌙',
      body: 'Daily reminders are on. This is a test notification.',
      sound: true,
      data: { screen: 'home' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  });
}

export { DEFAULT_TIME };
export type { ReminderTime };
