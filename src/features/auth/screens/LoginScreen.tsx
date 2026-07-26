import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Pressable, TouchableOpacity, Platform, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useHaptics } from '@/hooks/useHaptics';
import { Screen } from '@/components/layout';
import { Input, LogoImage, GoogleIcon } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { useOnboardingStore } from '@/store/onboarding.store';
import { useThemeColors } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/theme.store';
import { supabaseReady } from '@/lib/supabase';
import { isValidEmail } from '@/utils/validators';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/services/auth.service';

type LoginForm = { email: string; password: string };
type Mode = 'sign-in' | 'sign-up';

const COLORS = {
  white: '#FFFFFF',
  textDark: '#1F2937',
  textBlack: '#1F2937',
  textMuted: '#6B7280',
  danger: '#B44545',
};

export default function LoginScreen() {
  const haptic = useHaptics();
  const c = useThemeColors();
  const isDark = useThemeStore((s) => s.resolved) === 'dark';
  const [showEmail, setShowEmail] = useState(false);
  const [mode, setMode] = useState<Mode>('sign-in');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginForm) => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      if (mode === 'sign-in') await signInWithEmail(values.email.trim(), values.password);
      else await signUpWithEmail(values.email.trim(), values.password);

      if (mode === 'sign-up') {
        useOnboardingStore.getState().setDone(false);
        router.replace('/(onboarding)/welcome');
      } else {
        const profile = useAuthStore.getState().profile;
        if (!profile?.full_name) router.replace('/(setup)/profile');
        else router.replace('/(tabs)/home');
      }
    } catch (e) {
      haptic('error');
      setErrorMsg(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      const session = useAuthStore.getState().session;
      if (session) {
        const profile = useAuthStore.getState().profile;
        if (!profile?.full_name) router.replace('/(onboarding)/welcome');
        else router.replace('/(tabs)/home');
      }
    } catch (e) {
      haptic('error');
      setErrorMsg(e instanceof Error ? e.message : 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Screen noPadding style={{ backgroundColor: c.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <Animated.View
            entering={FadeInDown.duration(600)}
            style={{ alignItems: 'center', marginTop: 56, marginBottom: 32 }}
          >
            <View style={[styles.logoCard, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
              <LogoImage size={92} />
            </View>
            <Text style={[styles.heroTitle, { color: c.text }]}>{"Qur'an Chat"}</Text>
            <Text style={styles.heroTagline}>Embark on your journey of wisdom</Text>
          </Animated.View>

          {/* Auth card */}
          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={{ marginBottom: 28 }}>
            <View style={[styles.authCard, { backgroundColor: c.surface }]}>
              {supabaseReady && (
                <>
                  {/* Google button - icon LEFT, text RIGHT (side by side, row) */}
                  <Pressable
                    onPress={handleGoogle}
                    disabled={googleLoading}
                    style={({ pressed }) => [
                      styles.authBtn,
                      { backgroundColor: isDark ? c.surfaceMuted : '#FFFFFF', borderColor: c.border },
                      pressed && { opacity: 0.85 },
                      googleLoading && { opacity: 0.7 },
                    ]}
                  >
                    {googleLoading ? (
                      <ActivityIndicator color={c.text} size="small" />
                    ) : (
                      <View style={styles.authBtnRow}>
                        <GoogleIcon size={22} />
                        <Text style={[styles.googleText, { color: c.text }]}>Continue with Google</Text>
                      </View>
                    )}
                  </Pressable>

                  {/* Divider */}
                  <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
                    <Text style={[styles.dividerText, { color: c.textMuted }]}>or</Text>
                    <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
                  </View>
                </>
              )}

              {!showEmail ? (
                /* Email button - icon LEFT, text RIGHT, side by side, white bg, black text */
                <Pressable
                  onPress={() => { haptic('light'); setShowEmail(true); }}
                  style={({ pressed }) => [
                    styles.authBtn,
                    { backgroundColor: isDark ? c.surfaceMuted : '#FFFFFF', borderColor: c.text },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <View style={styles.authBtnRow}>
                    <Ionicons name="mail-outline" size={22} color={c.text} />
                    <Text style={[styles.emailText, { color: c.text }]}>Continue with Email</Text>
                  </View>
                </Pressable>
              ) : (
                <Animated.View entering={FadeInDown.duration(300)} style={styles.formStack}>
                  {/* Mode toggle - centered, each has its own background */}
                  <View style={styles.toggleRow}>
                    {([
                      { id: 'sign-in', label: 'Sign in' },
                      { id: 'sign-up', label: 'Create account' },
                    ] as const).map((m) => {
                      const selected = mode === m.id;
                      return (
                        <Pressable
                          key={m.id}
                          onPress={() => { haptic('selection'); setMode(m.id); setErrorMsg(null); }}
                          style={[
                            styles.toggleBtn,
                            {
                              backgroundColor: selected ? c.primaryDeep : c.surfaceMuted,
                              borderColor: selected ? c.primaryDeep : c.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.toggleText,
                              { color: selected ? '#FFFFFF' : c.text },
                            ]}
                          >
                            {m.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Controller
                    control={control}
                    name="email"
                    rules={{ validate: (v) => isValidEmail(v) || 'Enter a valid email address' }}
                    render={({ field: { onChange, onBlur, value }, fieldState }) => (
                      <Input
                        label="Email"
                        placeholder="you@example.com"
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        autoComplete="email"
                        textContentType="emailAddress"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="password"
                    rules={{ validate: (v) => (v && v.length >= 6) || 'Password must be at least 6 characters' }}
                    render={({ field: { onChange, onBlur, value }, fieldState }) => (
                      <Input
                        label="Password"
                        placeholder="At least 6 characters"
                        secureTextEntry
                        textContentType={mode === 'sign-in' ? 'password' : 'newPassword'}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />

                  {/* Submit button - View carries bg, TouchableOpacity handles press */}
                  <View
                    style={{
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
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 17,
                            fontWeight: '700',
                          }}
                        >
                          {mode === 'sign-in' ? 'Sign in' : 'Create account'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {errorMsg ? (
                    <Text style={[styles.errorText, { color: c.danger }]}>{errorMsg}</Text>
                  ) : null}
                </Animated.View>
              )}

              {!supabaseReady && (
                <Text style={[styles.demoNote, { color: c.textMuted }]}>
                  Demo mode — Supabase not configured. Email sign-in works locally.
                </Text>
              )}

              {/* Terms */}
              <Text style={[styles.terms, { color: c.textMuted }]}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </Animated.View>

          {/* Trust badges */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.badgesRow}>
            {[
              { icon: 'shield-checkmark' as const, label: 'Secure' },
              { icon: 'shield' as const, label: 'Private' },
              { icon: 'heart' as const, label: 'Spiritual' },
            ].map((b) => (
              <View key={b.label} style={styles.badge}>
                <Ionicons name={b.icon} size={22} color={c.primaryDeep} />
                <Text style={[styles.badgeLabel, { color: c.textMuted }]}>{b.label.toUpperCase()}</Text>
              </View>
            ))}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoCard: {
    width: 128,
    height: 128,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 5,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 36,
    lineHeight: 42,
    textAlign: 'center',
    fontWeight: '700',
  },
  heroTagline: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#D4AF37',
    fontStyle: 'italic',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  authCard: {
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 5,
  },
  authBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  authBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    gap: 12,
  },
  googleText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  emailText: {
    color: COLORS.textBlack,
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  formStack: {
    gap: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  toggleBtn: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    width: '100%',
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  submitText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  demoNote: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  terms: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  badge: {
    alignItems: 'center',
  },
  badgeLabel: {
    marginTop: 6,
    letterSpacing: 1,
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
});
