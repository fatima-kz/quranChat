import { supabase, supabaseReady } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import { useAuthStore } from '@/store/auth.store';
import type { Profile, Gender } from '@/types';
import type { Session } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system/legacy';

type LocalSession = { session: Session | null; profile: Profile | null };

const LOCAL_SESSION_KEY = '@quranchat:localSession';
const LOCAL_PROFILE_KEY = '@quranchat:localProfile';

function syncStore(profile: Profile | null, session: Session | null) {
  useAuthStore.getState().setSession(session);
  useAuthStore.getState().setProfile(profile);
  useAuthStore.getState().setReady(true);
}

function localSessionFromProfile(profile: Profile): Session {
  return { user: { id: profile.id, email: profile.email } } as unknown as Session;
}

export async function ensureLocalSession(): Promise<LocalSession> {
  const profile = await storage.getJSON<Profile>(LOCAL_PROFILE_KEY);
  if (profile) {
    return { session: localSessionFromProfile(profile), profile };
  }
  return { session: null, profile: null };
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return;
  }
  await localSignIn(email);
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  if (supabaseReady && supabase) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return;
  }
  await localSignIn(email);
}

async function localSignIn(email: string): Promise<void> {
  const id = `local-${email.toLowerCase()}`;
  const profile: Profile = {
    id,
    email,
    full_name: null,
    age: null,
    gender: null,
    avatar_url: null,
    goal: null,
    topics: null,
    created_at: new Date().toISOString(),
  };
  await storage.setJSON(LOCAL_PROFILE_KEY, profile);
  await storage.setJSON(LOCAL_SESSION_KEY, { userId: id, email });
  syncStore(profile, localSessionFromProfile(profile));
}

export async function signInWithGoogle(): Promise<void> {
  if (!(supabaseReady && supabase)) {
    throw new Error('Google sign-in requires Supabase to be configured.');
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'quranchat://auth' },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  if (supabaseReady && supabase) {
    await supabase.auth.signOut();
  }
  await storage.remove(LOCAL_SESSION_KEY);
  useAuthStore.getState().clear();
}

async function convertToBase64(localUri: string): Promise<string | null> {
  try {
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const ext = localUri.split('.').pop()?.toLowerCase() || 'jpg';
    const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

export async function upsertProfile(
  userId: string,
  email: string,
  data: {
    full_name: string;
    age: number;
    gender: Gender;
    avatar_url?: string | null;
    goal: string | null;
    topics: string[];
  },
): Promise<Profile> {
  let avatarUrl = data.avatar_url ?? null;

  if (avatarUrl && (avatarUrl.startsWith('file:') || avatarUrl.startsWith('content:') || avatarUrl.startsWith('ph:'))) {
    const base64 = await convertToBase64(avatarUrl);
    avatarUrl = base64 ?? avatarUrl;
  }

  const profile: Profile = {
    id: userId,
    email,
    full_name: data.full_name,
    age: data.age,
    gender: data.gender,
    avatar_url: avatarUrl,
    goal: data.goal,
    topics: data.topics,
    created_at: new Date().toISOString(),
  };

  if (supabaseReady && supabase) {
    const { data: row, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw new Error(`Profile save failed: ${error.message}`);
    const saved = row as Profile;
    syncStore(saved, useAuthStore.getState().session);
    return saved;
  }

  await storage.setJSON(LOCAL_PROFILE_KEY, profile);
  syncStore(profile, localSessionFromProfile(profile));
  return profile;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (supabaseReady && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as Profile;
  }
  return storage.getJSON<Profile>(LOCAL_PROFILE_KEY);
}
