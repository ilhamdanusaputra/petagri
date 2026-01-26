import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Href, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function ProdukMenu() {
	const router = useRouter();
	const cardBg = useThemeColor({}, "card");
	const borderColor = useThemeColor({}, "cardBorder");
	const textColor = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const iconTint = useThemeColor({}, "tint");
	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">PRODUK & TOKO</ThemedText>
			<ThemedText>Halaman manajemen produk dan toko.</ThemedText>

			<View style={{ height: 12 }} />

			<Pressable
				onPress={() => router.push("/menus/produk-mitra/mitra" as Href)}
				style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
				<View style={[styles.iconWrap, { backgroundColor: iconTint + "22" }]}>
					<IconSymbol name="person.fill" size={22} color={iconTint} />
				</View>
				<View style={styles.cardBody}>
					<ThemedText type="subtitle" style={[styles.cardTitle, { color: textColor }]}>
						Kelola Mitra/Toko
					</ThemedText>
					<ThemedText style={[styles.cardDesc, { color: textColor }]}>
						Manajemen data mitra, toko, dan distributor. Tambah, edit, dan kelola status mitra/toko.
					</ThemedText>
				</View>
			</Pressable>

			<Pressable
				onPress={() => router.push("/menus/konsultasi/konsultan")}
				style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
				<View style={[styles.iconWrap, { backgroundColor: iconTint + "22" }]}>
					<IconSymbol name="bag.fill" size={22} color={iconTint} />
				</View>
				<View style={styles.cardBody}>
					<ThemedText type="subtitle" style={[styles.cardTitle, { color: textColor }]}>
						Kelola Produk
					</ThemedText>
					<ThemedText style={[styles.cardDesc, { color: textColor }]}>
						Manajemen data produk, stok, dan harga. Tambah, edit, dan kelola produk yang dijual.
					</ThemedText>
				</View>
			</Pressable>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, gap: 8 },
	card: {
		borderRadius: 12,
		padding: 12,
		flexDirection: "row",
		alignItems: "flex-start",
		borderWidth: 1,
	},
	iconWrap: {
		width: 44,
		height: 44,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	cardBody: {
		flex: 1,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 6,
	},
	cardDesc: {
		fontSize: 13,
		lineHeight: 18,
		opacity: 0.9,
	},
});
