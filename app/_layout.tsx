import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useThemePreference } from "@/hooks/use-theme-preference";
import AuthMiddleware from "./_middleware";

export const unstable_settings = {
	anchor: "(tabs)",
};

export default function RootLayout() {
	const { colorScheme } = useThemePreference();

	return (
		<AuthMiddleware>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<Stack>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
				</Stack>
				<StatusBar style="auto" />
			</ThemeProvider>
		</AuthMiddleware>
	);
}
