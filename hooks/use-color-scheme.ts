import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useThemePreference } from './use-theme-preference';

export function useColorScheme() {
	const systemColorScheme = useNativeColorScheme();
	const { colorScheme } = useThemePreference();

	// Prefer explicit user preference; fall back to system theme
	return (colorScheme ?? systemColorScheme) as 'light' | 'dark' | null;
}
