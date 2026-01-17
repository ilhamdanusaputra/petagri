import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export type MenuGridItem = {
	key: string;
	label: string;
	icon: string;
	onPress?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MenuGrid({ items }: { items: MenuGridItem[] }) {
	const router = useRouter();

	// Split items into rows of 4 for better alignment
	const rows = [];
	for (let i = 0; i < items.length; i += 4) {
		rows.push(items.slice(i, i + 4));
	}

	return (
		<View style={styles.container}>
			{rows.map((row, rowIndex) => (
				<View key={rowIndex} style={styles.row}>
					{row.map((item) => (
						<MenuTile
							key={item.key}
							item={item}
							onPress={item.onPress ?? (() => router.push("/menus"))}
						/>
					))}
					{/* Fill empty spaces for alignment */}
					{row.length < 4 &&
						Array.from({ length: 4 - row.length }).map((_, i) => (
							<View key={`empty-${i}`} style={styles.tile} />
						))}
				</View>
			))}
		</View>
	);
}

function MenuTile({ item, onPress }: { item: MenuGridItem; onPress: () => void }) {
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<View style={styles.tile}>
			<AnimatedPressable
				style={[styles.tileContent, animatedStyle]}
				onPress={onPress}
				onPressIn={() => {
					scale.value = withSpring(0.96, { damping: 15, mass: 1 });
				}}
				onPressOut={() => {
					scale.value = withSpring(1, { damping: 15, mass: 1 });
				}}>
				<View style={styles.iconContainer}>
					<View style={styles.iconWrap}>
						<IconSymbol name={item.icon as any} size={28} color="#2563EB" />
					</View>
				</View>
				<View style={styles.labelContainer}>
					<ThemedText type="default" style={styles.label} numberOfLines={2}>
						{item.label}
					</ThemedText>
				</View>
			</AnimatedPressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingVertical: 4,
		paddingHorizontal: 12,
	},
	row: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "stretch",
		marginBottom: 12,
		gap: 8,
	},
	tile: {
		flex: 1,
		maxWidth: "25%",
		minWidth: 75,
		alignItems: "center",
	},
	tileContent: {
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 16,
		paddingHorizontal: 8,
		borderRadius: 20,
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#F1F5F9",
		shadowColor: "#64748B",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 12,
		elevation: 2,
		width: "100%",
		height: 105, // Fixed height instead of minHeight
	},
	iconContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	iconWrap: {
		width: 48,
		height: 48,
		borderRadius: 14,
		backgroundColor: "#EFF6FF",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 0.5,
		borderColor: "#DBEAFE",
	},
	labelContainer: {
		height: 32, // Fixed height for label area
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 4,
	},
	label: {
		textAlign: "center",
		fontSize: 11,
		fontWeight: "600",
		lineHeight: 13,
		color: "#1F2937",
		letterSpacing: 0.1,
	},
});
