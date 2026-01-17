# Petagri Codebase Guide for AI Agents

## Project Architecture

**Petagri** is an Expo-based React Native mobile app with web support, built with TypeScript and styled using NativeWind (Tailwind CSS for React Native).

### Tech Stack

- **Framework**: Expo 54+ with React Router v6 for file-based routing
- **Language**: TypeScript 5.9+ (strict mode enabled)
- **Styling**: NativeWind 4.2 (Tailwind CSS) + React Navigation theming
- **Backend**: Supabase (PostgreSQL, Auth, AsyncStorage sync)
- **State**: React hooks + platform-specific color scheme detection

### Directory Structure

- `app/` - Entry point with file-based routing via Expo Router. Root layout wraps all routes with theme provider.
  - `(tabs)/` - Tab-based navigation (currently Home tab only in `index.tsx`)
  - `modal.tsx` - Modal presentation example
- `components/` - Reusable UI components
  - `ui/` - Base UI components (collapsible, icon-symbol)
  - `role-dashboards/` - Role-specific dashboard layouts
  - Theme wrappers: `themed-text.tsx`, `themed-view.tsx`
- `constants/theme.ts` - Theme colors and fonts (light/dark modes); Colors object used throughout
- `hooks/` - Custom hooks for color scheme, theme colors; platform-specific variants (`.web.ts`)
- `utils/supabase.ts` - Supabase client singleton with AsyncStorage auth persistence

## Key Patterns & Conventions

### File-Based Routing (Expo Router)

- File structure in `app/` maps directly to routes
- `_layout.tsx` files define layout wrappers and navigation structure
- Group folders `(tabs)/` define navigation groups without URL segments
- Use `@/` path alias (configured in tsconfig) for imports: `import { Colors } from "@/constants/theme"`

### Styling & Theming

- **Color System**: Import `Colors` from `constants/theme.ts` for light/dark color objects
  - Access: `Colors[colorScheme ?? "light"].tint`, `Colors[colorScheme].background`
- **NativeWind**: Use className strings directly; Tailwind utilities work cross-platform
- **Platform Detection**: Use `Platform.select()` (react-native) for platform-specific code; see `theme.ts` for Fonts example
- Use `useColorScheme()` hook to get current scheme ("light" | "dark" | undefined)

### Component Patterns

- **Themed Components**: Wrap with `ThemedView`/`ThemedText` for automatic theme color inheritance
- **Icons**: Use `IconSymbol` component (wraps react-native-heroicons for web, native icons for platforms)
- **Haptic Feedback**: `HapticTab` component provides haptic feedback on tab press
- **Layout Components**: `ParallaxScrollView` for scroll animations, `Collapsible` for expandable sections

### Authentication & Data

- Supabase initialized in `utils/supabase.ts` with AsyncStorage persistence
- Auto-refresh tokens enabled; session persisted across app restarts
- Use environment variables: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`

## Development Workflows

### Building & Running

```bash
npm run start          # Start dev server (choose target: Android/iOS/web)
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator
npm run web            # Run web version (Metro bundler)
npm run lint           # ESLint check (Expo config preset)
npm run reset-project  # Reset to blank state (moves example to app-example/)
```

### Adding New Routes

1. Create file in `app/` directory (e.g., `app/profile.tsx`)
2. Export default React component; Expo Router auto-generates route
3. Use `useRouter()` for programmatic navigation
4. Grouped routes in `(parentGroup)/` don't add URL segments

### Adding Components

- Place reusable components in `components/` with platform-specific variants as needed (`.web.ts`, `.ios.tsx`, etc.)
- For UI primitives, keep in `components/ui/`; for domain-specific, create subdirectory
- Import path alias: `@/components/...`

### TypeScript & Strict Mode

- Strict mode enabled; all implicit `any` flagged as errors
- Use `expo-env.d.ts` and `nativewind-env.d.ts` for type augmentation
- Check errors with `npm run lint` before committing

## Important Integration Points

### Platform Differences

- Web, iOS, Android have different capabilities (e.g., haptics unavailable on web)
- Use `Platform.select()` or separate `.web.ts` files for platform-specific implementations
- NativeWind handles CSS-to-native-style translation automatically

### Expo Constants & System UI

- `expo-constants` provides app version, Expo SDK version, notification permissions
- `expo-system-ui` integrates with platform system UI preferences
- New Arch enabled in `app.json` (React Compiler experiments on)

### React Navigation Integration

- App uses React Navigation with Expo Router on top
- Dark/Default themes from `@react-navigation/native` applied at root layout
- Theme colors synchronized with `useColorScheme()` hook

## Code Quality Standards

- **Linting**: Runs Expo ESLint config (strict rules)
- **No implicit returns**: Explicit returns required due to strict TS mode
- **Path imports**: Always use `@/` alias, never relative imports across directories
- **Component exports**: Default export required for route files in `app/`

## External Resources for Deep Dives

- [Expo Router Docs](https://docs.expo.dev/router/introduction/) - file-based routing details
- [NativeWind Docs](https://www.nativewind.dev/) - Tailwind CSS on React Native
- [Supabase JS SDK](https://supabase.com/docs/reference/javascript) - auth and data operations
- [React Native Platform Module](https://reactnative.dev/docs/platform-specific-code) - platform detection
