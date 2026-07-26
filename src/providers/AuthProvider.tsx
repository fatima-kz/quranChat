import { useEffect } from 'react';

import { supabase, supabaseReady } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { useOnboardingStore } from '@/store/onboarding.store';
import { ensureLocalSession } from '@/services/auth.service';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setReady = useAuthStore((s) => s.setReady);
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const hydrateOnboarding = useOnboardingStore((s) => s.hydrate);

  useEffect(() => {
    let active = true;

    async function init() {
      await Promise.all([hydrateTheme(), hydrateOnboarding()]);

      if (supabaseReady && supabase) {
        const { data } = await supabase.auth.getSession();
        if (active && data.session) {
          setSession(data.session);
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
          if (active) setProfile(prof as any);
        }
        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!active) return;
          setSession(session);
          if (session) {
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (active) setProfile(prof as any);
          } else {
            setProfile(null);
          }
        });
        if (active) setReady(true);
        return () => {
          active = false;
          sub.subscription.unsubscribe();
        };
      }

      const local = await ensureLocalSession();
      if (active) {
        setSession(local.session);
        setProfile(local.profile);
        setReady(true);
      }
    }

    const cleanup = init();
    return () => {
      active = false;
      cleanup?.then((fn) => fn?.());
    };
  }, [setSession, setProfile, setReady, hydrateTheme, hydrateOnboarding]);

  return <>{children}</>;
}
