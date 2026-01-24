import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useKonsultan } from "@/hooks/use-konsultan";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";

export default function KonsultanList() {
	const router = useRouter();
	const { konsultans, loading, error } = useKonsultan();
	const cardBg = useThemeColor({}, "card");
	const border = useThemeColor({ light: "#E5E7EB", dark: "#374151" }, "cardBorder");
	const text = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");

	if (loading) {
		return (
			<ThemedView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
				<ActivityIndicator size="large" color="#1B5E20" />
				<ThemedText style={{ marginTop: 12, color: muted }}>Memuat data konsultan...</ThemedText>
			</ThemedView>
		);
	}

	if (error) {
		return (
			<ThemedView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
				<IconSymbol name="person.fill" size={48} color={muted} />
				<ThemedText style={{ marginTop: 12, color: "#EF4444" }}>Error: {error}</ThemedText>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<View style={styles.headerRow}>
				<ThemedText type="title">Kelola Konsultan</ThemedText>
				<Pressable
					style={{
						backgroundColor: "#1B5E20",
						paddingHorizontal: 16,
						paddingVertical: 8,
						borderRadius: 8,
						flexDirection: "row",
						alignItems: "center",
						gap: 6,
					}}
					onPress={() => router.push("./konsultan/add")}>
					<IconSymbol name="bell.fill" size={18} color="#fff" />
					<ThemedText style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Tambah</ThemedText>
				</Pressable>
			</View>

			<ThemedText style={{ marginBottom: 12, color: muted }}>
				Daftar konsultan lapangan ({konsultans.length}). Ketuk untuk melihat detail.
			</ThemedText>

			{konsultans.length === 0 ? (
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<IconSymbol name="person.fill" size={48} color={muted} />
					<ThemedText style={{ marginTop: 12, color: muted }}>Belum ada konsultan</ThemedText>
				</View>
			) : (
				<FlatList
					data={konsultans}
					keyExtractor={(i) => i.id}
					renderItem={({ item }) => (
						<Pressable
							style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
							onPress={() => router.push(`./konsultan/${item.id}`)}>
							<View style={styles.cardLeft}>
								<ThemedText style={[styles.cardTitle, { color: text }]}>
									{item.full_name || "Nama belum diatur"}
								</ThemedText>
								<ThemedText style={{ color: muted, fontSize: 13 }}>{item.email}</ThemedText>
								{item.phone && (
									<ThemedText style={{ color: muted, fontSize: 13 }}>{item.phone}</ThemedText>
								)}
							</View>
							<View style={styles.cardRight}>
								<IconSymbol name="chevron.right" size={20} color={muted} />
							</View>
						</Pressable>
					)}
				/>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	card: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderRadius: 10,
		borderWidth: 1,
		marginBottom: 10,
	},
	cardLeft: { flex: 1, gap: 4 },
	cardRight: { alignItems: "center", justifyContent: "center" },
	cardTitle: { fontSize: 16, fontWeight: "600" },
});
