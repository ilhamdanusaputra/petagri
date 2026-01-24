import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { useKebun } from "@/hooks/use-kebun";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";

export default function KebunList() {
	const router = useRouter();
	const { kebuns, loading, error } = useKebun();
	const { user } = useAuth();
	const [profile, setProfile] = useState<any>(null);
	const [loadingProfile, setLoadingProfile] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			if (user) {
				const { data } = await supabase.from("profiles").select("roles").eq("id", user.id).single();
				setProfile(data || {});
			}
			setLoadingProfile(false);
		};
		fetchProfile();
	}, [user]);

	const cardBg = useThemeColor({}, "card");
	const border = useThemeColor({ light: "#E5E7EB", dark: "#374151" }, "cardBorder");
	const text = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");

	return (
		<ThemedView style={styles.container}>
			<View style={styles.headerRow}>
				<ThemedText type="title">Kelola Kebun</ThemedText>
				{/* Only show add button for owner_platform, admin_platform and developer roles */}
				{(profile?.roles === "owner_platform" ||
					profile?.roles === "developer" ||
					profile?.roles === "admin_platform") && (
					<Pressable
						style={[styles.addButton, { backgroundColor: "#1B5E20" }]}
						onPress={() => router.push("./kebun/add")}>
						<IconSymbol name="leaf.fill" size={18} color="#fff" />
					</Pressable>
				)}
			</View>

			<ThemedText style={{ marginBottom: 8 }}>
				Daftar kebun dan ringkasan data. Ketuk nama untuk detail kebun.
			</ThemedText>

			{loading || loadingProfile ? (
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40 }}>
					<ActivityIndicator size="large" color="#1B5E20" />
					<ThemedText style={{ marginTop: 12, color: muted }}>Memuat data...</ThemedText>
				</View>
			) : error ? (
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40 }}>
					<ThemedText style={{ color: "#EF4444", marginBottom: 8 }}>Error: {error}</ThemedText>
					<ThemedText style={{ color: muted }}>Gagal memuat data kebun</ThemedText>
				</View>
			) : kebuns.length === 0 ? (
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40 }}>
					<IconSymbol name="leaf.fill" size={48} color={muted} />
					<ThemedText style={{ marginTop: 12, color: muted }}>Belum ada kebun</ThemedText>
					<ThemedText style={{ color: muted, fontSize: 14 }}>
						Tap tombol + untuk menambah
					</ThemedText>
				</View>
			) : (
				<FlatList
					data={kebuns}
					keyExtractor={(i) => i.id}
					renderItem={({ item }) => (
						<Pressable style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
							<View style={styles.cardLeft}>
								<ThemedText style={[styles.cardTitle, { color: text }]}>{item.name}</ThemedText>
								<ThemedText style={{ color: muted }}>
									{item.location} • {item.commodity} • {item.area_ha} ha
								</ThemedText>
							</View>
							<View style={styles.cardRight}>
								<ThemedText style={{ color: item.status === "Aktif" ? "#10B981" : "#EF4444" }}>
									{item.status}
								</ThemedText>
								<Pressable
									style={styles.smallButton}
									onPress={() => router.push(`./kebun/${item.id}/visits`)}>
									<ThemedText style={{ color: "#0a7ea4" }}>Riwayat</ThemedText>
								</Pressable>
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
	addButton: {
		width: 40,
		height: 40,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	card: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderRadius: 10,
		borderWidth: 1,
		marginBottom: 10,
	},
	cardLeft: { flex: 1 },
	cardRight: { alignItems: "flex-end", gap: 8 },
	cardTitle: { fontSize: 16, fontWeight: "600" },
	smallButton: { marginTop: 6 },
});
