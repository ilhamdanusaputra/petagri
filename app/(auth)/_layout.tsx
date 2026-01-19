import { useAuth } from "@/hooks/use-auth";
import { Redirect, Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

export default function AuthLayout() {
	const { isAuthenticated, isInitialized } = useAuth();

	// Show loading while checking auth state
	if (!isInitialized) {
		return (
			<View className="flex-1 bg-black items-center justify-center">
				<ActivityIndicator size="large" color="#3B82F6" />
			</View>
		);
	}

	// Redirect to tabs if already authenticated
	if (isAuthenticated) {
		return <Redirect href="/(tabs)" />;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="login" />
			<Stack.Screen name="register" />
			<Stack.Screen name="forgot-password" />
		</Stack>
	);
}
