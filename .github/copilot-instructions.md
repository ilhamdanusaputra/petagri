# Copilot / AI Agent Instructions — Petagri

Quick orientation for AI coding agents working on this repository.

- **Big picture:** This is an Expo-based universal React app using `expo-router` (file-based routing) inside the `app/` directory. The project targets native (iOS/Android) and web; platform differences are handled at runtime (see `utils/supabase.ts` storage selection).
- **Primary services & data:** Supabase is the backend (client in `utils/supabase.ts`), serverless functions live under `supabase/functions/`, and SQL migrations are in `supabase/migrations/`.

- **Where to look first:**
  - App entry & routes: [app/\_layout.tsx](app/_layout.tsx)
  - Auth middleware: [app/\_middleware.tsx](app/_middleware.tsx)
  - Supabase client: [utils/supabase.ts](utils/supabase.ts)
  - Domain hooks: `hooks/` (e.g., [hooks/use-auth.ts](hooks/use-auth.ts), `use-kebun.ts`, `use-konsultan.ts`)
  - UI primitives: `components/` and `components/ui/`

- **Core conventions & patterns** (do not invent alternatives):
  - Routing follows `expo-router` file-based rules in `app/`. Pages and nested folders map directly to routes.
  - Authentication state is canonicalized via `use-auth.ts` and enforced in `app/_middleware.tsx`. Use these hooks for login/logout/session behavior rather than re-implementing auth checks.
  - Use the provided `supabase` client from `utils/supabase.ts` for all DB and auth interactions. It configures platform-specific storage (AsyncStorage on native, localStorage on web) and sets `EXPO_PUBLIC_SUPABASE_*` env vars.
  - Domain logic lives in small hooks under `hooks/` (prefer reusing `use-` hooks). UI components are lightweight and composed in `components/`.
  - Styling uses `nativewind` (Tailwind-like classes) and `tailwind.config.js` — prefer existing utility classes.

- **Environment & developer workflows**
  - Start dev server: `npm start` (runs `expo start`). Platform targets: `npm run android`, `npm run ios`, `npm run web`.
  - Regenerate DB types (project uses generated TS types in repo root):

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> --schema public > database.types.ts
```

- Supabase functions are declared in `supabase/config.toml` and placed under `supabase/functions/` (example: `create-konsultan`). Use the Supabase CLI / dashboard to deploy or test functions.
- To reset starter content: `npm run reset-project` (moves starter app to `app-example` and creates a blank `app`).

- **Integration notes & gotchas**
  - Environment variables: the client reads `process.env.EXPO_PUBLIC_SUPABASE_URL` and `process.env.EXPO_PUBLIC_SUPABASE_KEY`. For local development, set them in your Expo environment (or use `.env` and your preferred loader).
  - Auth state persistence: `utils/supabase.ts` chooses `window.localStorage` on web and `AsyncStorage` on native; tests or agents emulating web/native should mock storage accordingly.
  - Routing + redirects: pages rely on `router.replace(...)` in hooks/middleware. Respect this behavior when changing auth flow or route structure.

- **Where to update when changing DB or auth surface**
  - Add DB changes to `supabase/migrations/` and regenerate types into `database.types.ts`.
  - If you add serverless endpoints, add them to `supabase/functions/` and update `supabase/config.toml`.

- **Examples to copy/paste**
  - Check session: `const { data } = await supabase.auth.getSession();` (used in `app/_middleware.tsx`).
  - Listen to auth state: `supabase.auth.onAuthStateChange(...)` (used in `hooks/use-auth.ts`).

If any section is unclear or you want more depth on routing patterns, state-management choices, or deployment steps (Supabase functions / CLI), tell me which area to expand.
