# Quran Chat

A premium, minimalist Qur'an companion app. Chat with an AI assistant that grounds its answers in the Qur'an — with Surah/Ayah citations, daily reflections, and a calm, iOS-style interface with dark mode.

> MVP built with Expo (SDK 57), Expo Router, TypeScript, NativeWind, Reanimated, Supabase, TanStack Query, Zustand, and an OpenAI-backed serverless route.

## App flow

```
Splash → Onboarding (3 screens) → Sign In → Profile Setup → Home ⇄ Chat ⇄ Profile
```

Bottom navigation: **Home · Chat · Profile**.

## Tech stack

**Frontend** — React Native (Expo SDK 57), Expo Router, TypeScript, NativeWind (Tailwind), Reanimated, expo-linear-gradient, expo-blur, react-hook-form, Zustand, TanStack Query.

**Backend** — Supabase (Auth, PostgreSQL, Row Level Security). See `supabase/schema.sql`.

**AI** — OpenAI (GPT-4o-mini by default) via a Vercel serverless route at `api/chat.js`. The system prompt keeps answers grounded in the Qur'an, cites only confident references, never fabricates verses, and directs jurisprudence questions to qualified scholars.

## Project structure

Feature-oriented architecture — `src/app` contains **only routes** (thin re-exports); the real app lives in `src/features`.

```
src/
  app/                  Expo Router only (routes + group layouts)
    (onboarding)/       welcome · interests · loading
    (auth)/             login
    (setup)/            profile
    (tabs)/             home · chat · profile
    chat/[id].tsx       specific conversation
  features/             screens + components + hooks + api per domain
  components/{ui,layout} shared, reusable primitives
  lib/                  supabase · queryClient · storage
  services/             auth · chat · ai (call APIs; fall back to local storage)
  store/                zustand stores (auth · theme · chat · onboarding)
  theme/                colors · typography · spacing · radius · shadows
  hooks/                useTheme · useHaptics
  utils/ · constants/ · config/ · types/
api/chat.js             Vercel serverless AI route
supabase/schema.sql     tables + RLS policies
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

```env
# Client (bundled into the app — prefix with EXPO_PUBLIC_)
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://localhost:3000   # your Vercel/local API URL

# Server only (never exposed to the client)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

### 3. Database (Supabase)

1. Create a new Supabase project.
2. Open the SQL editor and run `supabase/schema.sql`. This creates `profiles`, `conversations`, `messages`, `bookmarks` with Row Level Security and a trigger that auto-creates a profile on signup.
3. (Optional) Enable Google as an auth provider in Supabase → Auth → Providers.

### 4. Run the app

```bash
npm start          # then press i / a / w
```

> **Demo mode:** If Supabase env vars are empty, the app still runs end-to-end — email auth, profile, conversations, and messages are persisted locally via AsyncStorage, and the Google button is hidden. This makes it easy to explore the UI without any backend. The AI chat still calls the server route, so point `EXPO_PUBLIC_API_URL` at a running API (see below) or the chat will show a friendly error.

## The AI server (Vercel)

`api/chat.js` is a Vercel serverless function. Install its deps and run locally, or deploy to Vercel.

```bash
cd api && npm install && cd ..
# local dev (Node) — run any tiny server, or use Vercel CLI:
npx vercel dev
```

Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) in your Vercel project environment variables. The route is `POST /api/chat` with body `{ messages: [{ role, content }] }` and returns `{ content }`. Citations are parsed on the client from the trailing `**Qur'an <s>:<a>**` line the prompt instructs the model to emit.

## The system prompt

```
You are Quran Chat, an AI assistant helping users understand the Qur'an.

Guidelines:
- Base answers on the Qur'an.
- If referencing a verse, only cite it if you are confident it is correct.
- If you are unsure of an exact verse reference, say so rather than guessing.
- Do not fabricate Surah or Ayah numbers.
- Do not issue fatwas or definitive religious rulings.
- Encourage consulting qualified scholars for complex jurisprudence.
- Be compassionate, clear, and concise.
```

## Scripts

```bash
npm start        # expo start
npm run ios      # expo start --ios
npm run android  # expo start --android
npm run web      # expo start --web
npm run lint     # eslint (flat config, expo rules)
npx tsc --noEmit # typecheck
```

## Notes

- Dark mode toggle (Profile) uses NativeWind's color-scheme override, persisted across launches.
- Haptic feedback is wired through taps via `useHaptics`.
- Skeleton loaders appear for the daily ayah and conversation lists.
- Reanimated powers the splash fade, onboarding transitions, typing dots, and home content reveal.
