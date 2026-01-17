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
