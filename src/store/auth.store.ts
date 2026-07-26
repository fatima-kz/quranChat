import { create } from 'zustand';

import type { Session } from '@supabase/supabase-js';

import type { Profile } from '@/types';

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  ready: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setReady: (ready: boolean) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  ready: false,
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setReady: (ready) => set({ ready }),
  clear: () => set({ session: null, profile: null, ready: true }),
}));
