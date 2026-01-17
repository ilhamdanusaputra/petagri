# Petagri - AI Coding Instructions

## Project Overview
React Native + Expo mobile app using file-based routing (expo-router), NativeWind for styling, and Supabase for backend services. Supports iOS, Android, and web with the new React Native architecture enabled.

## Tech Stack
- **Framework**: Expo SDK 54 with React 19.1.0 and React Native 0.81.5
- **Routing**: expo-router v6 with file-based routing and typed routes (experimental)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native) + theme system for dark/light mode
- **Backend**: Supabase with AsyncStorage for session persistence
- **Navigation**: React Navigation v7 with custom haptic feedback tabs
- **Animation**: react-native-reanimated v4 with React Compiler enabled (experimental)

## Architecture Patterns

### File-Based Routing
- Routes are defined by file structure in `app/` directory
- `app/_layout.tsx` is the root layout with theme provider
- `app/(tabs)/` is a route group for tab navigation (parentheses hide from URL)
- `app/menus.tsx` is the main menu page at `/menus` showing all available features
- `app/menus/*.tsx` are individual menu pages (e.g., `/menus/core`, `/menus/produk`)
- `app/modal.tsx` is a modal route accessible via `href="/modal"`
- The anchor is set to `(tabs)` in root layout via `unstable_settings`

### Import Path Aliases
Use `@/*` for absolute imports from project root:
```tsx
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/utils/supabase';
```

### Theming System
Two theming approaches coexist:
1. **Themed Components** (`ThemedView`, `ThemedText`): Use `useThemeColor` hook with color constants from `@/constants/theme`
2. **NativeWind Classes**: Use Tailwind classes in className prop (global.css imported in root layout)

Example themed component pattern from [components/themed-view.tsx](components/themed-view.tsx):
```tsx
export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};
```

### Supabase Integration
Client configured in [utils/supabase.ts](utils/supabase.ts) with:
- AsyncStorage for auth persistence
- Environment variables: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`
- `react-native-url-polyfill/auto` imported for URL support

### Platform-Specific Code
- Use `Platform.select()` for conditional values (see [constants/theme.ts](constants/theme.ts) for font examples)
- Use `process.env.EXPO_OS` for runtime checks (see [components/haptic-tab.tsx](components/haptic-tab.tsx))
- Haptic feedback only on iOS: `Haptics.impactAsync()` wrapped in iOS check

## Development Workflows

### Running the App
```bash
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run web            # Run in web browser
```

### Developer Tools
- iOS: `cmd + d` for dev menu
- Android: `cmd + m` for dev menu  
- Web: `F12` for browser dev tools

### Code Quality
```bash
npm run lint           # Run ESLint (expo lint)
```

## Component Patterns

### MenuGrid Component
[components/menu-grid.tsx](components/menu-grid.tsx) renders a 4-column grid of menu tiles:
- Each tile has an icon, label, and onPress handler
- Default behavior: navigates to `/menus` using `useRouter` if no `onPress` provided
- Used on Home screen with specific routes and on `/menus` page for all features
- Example usage:
```tsx
const items = [
  { key: 'core', label: 'CORE', icon: 'house.fill', onPress: () => router.push('/menus/core') },
  { key: 'all', label: 'SEMUA MENU', icon: 'chevron.right', onPress: () => router.push('/menus') },
];
<MenuGrid items={items} />
```

### Custom Tab Button
[components/haptic-tab.tsx](components/haptic-tab.tsx) wraps `PlatformPressable` to add iOS haptic feedback on tab press

### Icon System
- iOS: Uses SF Symbols via `IconSymbol` component ([components/ui/icon-symbol.ios.tsx](components/ui/icon-symbol.ios.tsx))
- Other platforms: Uses MaterialIcons fallback via [components/ui/icon-symbol.tsx](components/ui/icon-symbol.tsx)
- SF Symbol names must be mapped to Material Icons in `MAPPING` constant
- Icons in tab bar: `<IconSymbol size={28} name="house.fill" color={color} />`
- Menu icons available: `house.fill`, `leaf.fill`, `bag.fill`, `gavel`, `cart.fill`, `truck`, `archivebox.fill`, `dollarsign.circle.fill`, `chart.bar.fill`, `bell.fill`, `gear`, `book`, `chevron.right`, `chevron.left.forwardslash.chevron.right`

## Configuration Files

### app.json
- `newArchEnabled: true` - Using new React Native architecture
- `experiments.typedRoutes: true` - Type-safe routing
- `experiments.reactCompiler: true` - React Compiler enabled
- Custom URI scheme: `petagri://`

### tsconfig.json
- Strict mode enabled
- Path alias `@/*` maps to project root

## Conventions
- Use `.tsx` extension for all React components
- Prefer functional components with hooks
- Component files use kebab-case: `haptic-tab.tsx`, `themed-view.tsx`, `menu-grid.tsx`
- Constants use SCREAMING_SNAKE_CASE exports: `Colors`, `Fonts`
- Environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in app
- Navigation: Use `useRouter()` from `expo-router` for programmatic navigation
- Menu structure: 13 main features (CORE, KONSULTASI & KEBUN, PRODUK & TOKO, TENDER & PENAWARAN, PENJUALAN, DISTRIBUSI & LOGISTIK, GUDANG & STOK, KEUANGAN, LAPORAN & ANALITIK, NOTIFIKASI & SISTEM, PENGATURAN, DEVELOPER TOOLS, DOKUMENTASI)

## Actionable guidance for AI coding agents

- Keep changes minimal and local: prefer small, focused edits to files under `app/` and `components/`.
- When adding routes: create files under `app/` following existing file-based routing. Example: add a new tab route at `app/menus/myfeature.tsx` or a param route like `app/menus/konsultasi/kebun/[id].tsx`.
- Use `useRouter()` from `expo-router` for programmatic navigation and follow typed routes when available.
- For styles prefer NativeWind classes in `className` for quick UI changes; use Themed components (ThemedView/ThemedText) when you need theme-aware colors from `constants/theme.ts` and `use-theme-color.ts`.
- Icons: prefer `IconSymbol` abstraction. For platform-specific icon handling see `components/ui/icon-symbol.ios.tsx` and `components/ui/icon-symbol.tsx` and the MAPPING constant.

## Integration & runtime notes

- Supabase: client is configured in [utils/supabase.ts](utils/supabase.ts). Auth persistence uses AsyncStorage and requires environment variables `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY`.
- Reanimated + React Compiler: the project uses `experiments.reactCompiler` and `react-native-reanimated` v4. Keep components using Reanimated as functional components and avoid class components for animated screens.
- App configuration: `app.json` enables `newArchEnabled: true` and typedRoutes; check there before adding native modules.

## Suggested PRs and edit patterns

- When modifying navigation or adding a menu tile, update `components/menu-grid.tsx` and the relevant `app/menus/*.tsx` page. Keep tile definitions keyed by `key` and route logic in one place when possible.
- When changing theme tokens, edit [constants/theme.ts](constants/theme.ts) and prefer adding new token names rather than changing usages across many files.
- For small UI adjustments, change Tailwind classes in-place. For cross-screen visual changes, add or update Themed components.

## Debugging & running locally

- Start developer server: `npm start` (Expo). To run specific platforms: `npm run ios`, `npm run android`, `npm run web` (iOS simulator requires macOS).
- Lint: `npm run lint`.
- If you add native packages, update `app.json` and follow Expo prebuild or EAS build flows; verify `metro.config.js` and `babel.config.js` for any extra plugin needs.

## Files to inspect for common tasks

- Routes and layout: [app/_layout.tsx](app/_layout.tsx), [app/(tabs)/_layout.tsx](app/(tabs)/_layout.tsx)
- Menus: [app/menus.tsx](app/menus.tsx) and files under [app/menus/](app/menus/)
- Components: [components/menu-grid.tsx](components/menu-grid.tsx), [components/haptic-tab.tsx](components/haptic-tab.tsx), [components/themed-view.tsx](components/themed-view.tsx)
- Utilities: [utils/supabase.ts](utils/supabase.ts)
- Theme constants: [constants/theme.ts](constants/theme.ts)

## Quick examples

- Add a simple route file `app/menus/hello.tsx` exporting a default functional component that uses `useRouter()` to navigate.
- Persisting auth is handled in `utils/supabase.ts` — when adding auth flows, call `supabase.auth` and rely on AsyncStorage for session persistence.

## Final notes for AI agents

- Preserve project style: kebab-case component filenames, functional components with hooks, and minimal scope changes.
- Prefer reading related files before editing (layout → menus → components) so changes follow existing patterns.
- Ask the human for clarification when a change touches native modules, CI, or environment variables.

---

If any part of this needs to be expanded (examples, CI, or native build notes), tell me what you'd like clarified.
