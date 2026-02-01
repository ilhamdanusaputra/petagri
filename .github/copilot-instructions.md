# Copilot / AI Agent Instructions — Petagri

# Copilot / AI Agent Instructions — Petagri

Quick, focused guidance for AI coding agents working in this repo.

- Big picture: Expo (React Native + web) app using `expo-router` for file-based routing in `app/`. Supabase is the primary backend (client in `utils/supabase.ts`), with serverless functions under `supabase/functions/` (Deno-based) and SQL migrations under `supabase/migrations/`.

- Where to read first:
  - App entry & route layout: [app/\_layout.tsx](app/_layout.tsx)
  - Auth enforcement: [app/\_middleware.tsx](app/_middleware.tsx)
  - Supabase client + storage selection: [utils/supabase.ts](utils/supabase.ts)
  - Domain hooks: [hooks/use-auth.ts](hooks/use-auth.ts), [hooks/use-kebun.ts](hooks/use-kebun.ts), [hooks/use-konsultan.ts](hooks/use-konsultan.ts)
  - UI primitives: [components/](components/) and [components/ui/](components/ui/)
  - Example serverless functions: [supabase/functions/create-konsultan/index.ts](supabase/functions/create-konsultan/index.ts)

- Core conventions (follow these):
  - Routing: `app/` folder structure maps to routes via `expo-router` — nested folders ⇢ nested routes.
  - Auth: use `use-auth.ts` and middleware in `app/_middleware.tsx`. Do not reimplement session handling; call `supabase.auth` helpers when needed.
  - Supabase access: always import the shared client from `utils/supabase.ts` (handles platform storage and env vars).
  - Domain logic lives in small `use-` hooks; UI is thin and composed from `components/`.
  - Styling: uses `nativewind` (Tailwind-like utilities). Prefer existing utility classes in `tailwind.config.js`.

- Developer workflows & commands:
  - Start: `npm start` (runs `expo start`). Platform shortcuts: `npm run android`, `npm run ios`, `npm run web`.
  - Reset starter content: `npm run reset-project` (moves current app to `app-example`, creates a blank `app`). See `scripts/reset-project.js`.
  - Regenerate DB types (update `database.types.ts`):

```bash
npx supabase gen types typescript --project-id <PROJECT_ID> --schema public > database.types.ts
```

- Deploy / test serverless functions via the Supabase CLI or Dashboard; function folders include `deno.json` (Deno runtime).

- Integration notes & gotchas:
  - Env vars: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY` are required for local dev.
  - Storage: `utils/supabase.ts` switches to `AsyncStorage` on native and `localStorage` on web — mock appropriately in tests or headless runs.
  - Routing redirects: many pages use `router.replace(...)` (in hooks/middleware); changing routes may require updating those redirects.
  - Migrations: add SQL files to `supabase/migrations/` and then regenerate `database.types.ts`.

- Quick examples (copy/paste):
  - Check session: `const { data } = await supabase.auth.getSession();` (used in [app/\_middleware.tsx](app/_middleware.tsx)).
  - Listen to auth events: `supabase.auth.onAuthStateChange(...)` (used in [hooks/use-auth.ts](hooks/use-auth.ts)).

If anything here is unclear or you want more examples (route patterns, a sample function deployment, or common refactors), tell me which area to expand.
