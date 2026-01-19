import { Redirect, Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { ActivityIndicator, View } from "react-native";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const { isAuthenticated, isInitialized } = useAuth();

	// Show loading while checking auth state
	if (!isInitialized) {
		return (
			<View className="flex-1 bg-black items-center justify-center">
				<ActivityIndicator size="large" color="#3B82F6" />
			</View>
		);
	}

	// Redirect to login if not authenticated
	if (!isAuthenticated) {
		return <Redirect href="/login" />;
	}

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				headerShown: false,
				tabBarButton: HapticTab,
			}}>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
				}}
			/>
		</Tabs>
	);
}
