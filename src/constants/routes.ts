export const ROUTES = {
  index: '/',
  onboarding: {
    welcome: '/(onboarding)/welcome',
    interests: '/(onboarding)/interests',
    loading: '/(onboarding)/loading',
  },
  auth: {
    login: '/(auth)/login',
  },
  setup: {
    profile: '/(setup)/profile',
  },
  tabs: {
    home: '/(tabs)/home',
    chat: '/(tabs)/chat',
    profile: '/(tabs)/profile',
  },
  conversation: (id: string) => `/chat/${id}`,
} as const;
