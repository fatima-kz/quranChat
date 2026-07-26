import Constants from 'expo-constants';

type Env = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiUrl: string;
  openaiApiKey: string;
};

function read(name: string): string {
  const proc = (typeof process !== 'undefined' && process.env?.[name]) || '';
  if (proc) return proc;
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;
  return extra[name] ?? '';
}

export const env: Env = {
  supabaseUrl: read('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: read('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  apiUrl: read('EXPO_PUBLIC_API_URL') || 'http://localhost:3000',
  openaiApiKey: read('OPENAI_API_KEY'),
};

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
