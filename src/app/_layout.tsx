import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import { RootProvider } from '@/providers/RootProvider';

export default function RootLayout() {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/(tabs)/home');
    });
    return () => sub.remove();
  }, []);

  return (
    <RootProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(setup)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="quran/[id]" />
      </Stack>
    </RootProvider>
  );
}
