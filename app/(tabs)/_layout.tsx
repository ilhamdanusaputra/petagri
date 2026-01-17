import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { Platform } from 'react-native';

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
	const colorScheme = useColorScheme();

	// Choose active tint: dark color for light theme, white for dark theme
	const activeTint = useMemo(() => {
		return colorScheme === 'light' || colorScheme == null
			? Colors.light.text
			: Colors.dark.tabIconSelected;
	}, [colorScheme]);

	// Debug: log runtime values to help diagnose theming issues
	console.log('TabLayout colorScheme:', colorScheme, 'activeTint:', activeTint);

	return (
		<Tabs
			key={colorScheme} // Force re-render when theme changes
			screenOptions={{
				tabBarActiveTintColor: activeTint,
				tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
				// Prevent label clipping: increase bar height and add label padding
				tabBarLabelStyle: {
					fontSize: 12,
					lineHeight: 16,
					paddingBottom: Platform.OS === 'android' ? 6 : 10,
				},
				tabBarStyle: {
					height: Platform.OS === 'android' ? 64 : 64,
					paddingTop: 6,
				},
				headerShown: false,
				tabBarButton: HapticTab,
			}}>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ focused }) => {
						const tint = colorScheme === 'light' || colorScheme == null ? Colors.light.text : Colors.dark.tabIconSelected;
						const inactive = Colors[colorScheme ?? 'light'].tabIconDefault;
						return <IconSymbol size={28} name="house.fill" color={focused ? tint : inactive} />;
					},
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ focused }) => {
						const tint = colorScheme === 'light' || colorScheme == null ? Colors.light.text : Colors.dark.tabIconSelected;
						const inactive = Colors[colorScheme ?? 'light'].tabIconDefault;
						return <IconSymbol size={28} name="gearshape.fill" color={focused ? tint : inactive} />;
					},
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ focused }) => {
						const tint = colorScheme === 'light' || colorScheme == null ? Colors.light.text : Colors.dark.tabIconSelected;
						const inactive = Colors[colorScheme ?? 'light'].tabIconDefault;
						return <IconSymbol size={28} name="gear" color={focused ? tint : inactive} />;
					},
				}}
			/>
		</Tabs>
	);
}
