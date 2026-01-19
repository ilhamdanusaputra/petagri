import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export const unstable_settings = {
	anchor: "(tabs)",
};

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const { isInitialized } = useAuth();

	// Show loading screen while auth is initializing
	if (!isInitialized) {
		return (
			<View className="flex-1 bg-black items-center justify-center">
				<ActivityIndicator size="large" color="#3B82F6" />
			</View>
		);
	}

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<Stack screenOptions={{ headerShown: true }}>
				<Stack.Screen name="(auth)" />
				<Stack.Screen name="login" />
				<Stack.Screen name="register" />
				<Stack.Screen name="forgot-password" />
				<Stack.Screen name="(tabs)" />
				<Stack.Screen name="menus" />
				<Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
			</Stack>
			<StatusBar style="auto" />
		</ThemeProvider>
	);
}
