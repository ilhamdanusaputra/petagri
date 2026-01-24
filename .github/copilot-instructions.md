Purpose
This file gives concise, repository-specific guidance for AI coding agents working on Petagri (an Expo + React Native app using Expo Router and Supabase).

Quick Architecture Summary

- App type: Expo app with `expo-router` (file-based routing) and web support via `react-native-web`.
- Entry: `package.json` main is `expo-router/entry` — dev workflows use `npx expo start` (or `npm run android|ios|web`).
- Routing: route files live in the `app/` directory. Grouped folders like `(tabs)` and files like `[id].tsx` implement dynamic routes. Route middleware files use `_middleware.tsx`.
- Backend: Supabase is the primary backend. The Supabase client is created in `utils/supabase.ts` and relies on env vars `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY`.

Key Patterns & Conventions

- File-based routing: add pages under `app/`. Nested folders mirror route paths. Example: `app/(tabs)/profile.tsx` renders `/profile` inside the tabs layout.
- Dynamic routing: use `[id].tsx` and nested `[...]` folders for dynamic segments.
- Middleware: place authorization or route-guarding logic in `_middleware.tsx` inside route folders.
- Hooks for data: reusable data and auth logic live in `hooks/` (e.g., `use-auth.ts`, `use-kebun.ts`, `use-visit.ts`). Prefer creating/updating hooks for shared data flows rather than scattering fetch logic across components.
- Supabase usage: import `supabase` from `utils/supabase.ts`. That file chooses storage per platform (AsyncStorage for native, localStorage for web) and registers auth listeners — follow the same pattern for new auth-aware code.
- UI & styling: uses `nativewind` and `tailwind.config.js`. Themed primitives are in `components/themed-*` and `components/ui/`.

Developer Workflows (explicit commands)

- Install: `npm install`
- Start dev server: `npx expo start` or `npm run start`
- Platform targets: `npm run android`, `npm run ios`, `npm run web`
- Lint: `npm run lint` (uses Expo ESLint preset)
- Reset starter app: `npm run reset-project` (moves starter to `app-example`)

Important Integration Notes

- Environment: code expects `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` available to Expo on runtime. Changes to auth/session logic should consider `utils/supabase.ts` storage choice and `detectSessionInUrl` (web only).
- Native modules: avoid adding or changing native modules without testing via a dev build; this project relies on Expo-managed workflow.
- Maps & WebView: packages such as `react-native-leaflet-map` and `react-native-webview` are present; prefer using existing wrappers in `components/`.

Code Change Guidance (practical rules for an AI agent)

- Prefer edits under `app/`, `components/`, `hooks/`, and `utils/` for UI/data work.
- When adding new pages, follow the naming and folder conventions in `app/` and create matching `_middleware.tsx` when route-level auth is required.
- For backend calls, reuse or extend hooks (e.g., `use-konsultan.ts`) — avoid ad-hoc fetches inside presentational components.
- Run `npm run lint` before creating a PR and test the change with `npx expo start --web` where possible.

References (examples to inspect)

- Supabase client and env usage: `utils/supabase.ts`
- Auth hook pattern: `hooks/use-auth.ts`
- Routing examples: `app/(tabs)/index.tsx`, `app/menus/konsultasi/konsultan/[id].tsx`

If anything here is unclear or you want this expanded (e.g., CI, testing, or PR checklist), ask and I'll iterate.
