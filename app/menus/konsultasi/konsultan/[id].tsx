import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useKonsultan, type Konsultan } from "@/hooks/use-konsultan";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function KonsultanDetail() {
	const params = useLocalSearchParams();
	const router = useRouter();
	const { getKonsultanById } = useKonsultan();
	const id = params?.id as string;

	const [konsultan, setKonsultan] = useState<Konsultan | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const bg = useThemeColor({ light: "#F9FAFB", dark: "#111827" }, "background");
	const cardBg = useThemeColor({}, "card");
	const border = useThemeColor({}, "cardBorder");
	const text = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");
	const tint = useThemeColor({}, "tint");
	const danger = useThemeColor({}, "danger");

	useEffect(() => {
		const fetchData = async () => {
			if (!id) {
				setError("ID konsultan tidak ditemukan");
				setLoading(false);
				return;
			}

			setLoading(true);
			const result = await getKonsultanById(id);
			if (result.success && result.data) {
				setKonsultan(result.data);
				setError(null);
			} else {
				setError(result.error || "Gagal memuat data");
			}
			setLoading(false);
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	if (loading) {
		return (
			<ThemedView style={[styles.container, { backgroundColor: bg }]}>
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<ActivityIndicator size="large" color="#1B5E20" />
					<ThemedText style={{ marginTop: 12, color: muted }}>Memuat data konsultan...</ThemedText>
				</View>
			</ThemedView>
		);
	}

	if (error || !konsultan) {
		return (
			<ThemedView style={[styles.container, { backgroundColor: bg }]}>
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
					<IconSymbol name="person.fill" size={48} color={muted} />
					<ThemedText style={{ marginTop: 12, color: danger }}>
						Error: {error || "Data tidak ditemukan"}
					</ThemedText>
					<Pressable
						style={{
							marginTop: 16,
							paddingHorizontal: 20,
							paddingVertical: 10,
							backgroundColor: tint,
							borderRadius: 8,
						}}
						onPress={() => router.back()}>
						<ThemedText style={{ color: "#fff", fontWeight: "600" }}>Kembali</ThemedText>
					</Pressable>
				</View>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={[styles.container, { backgroundColor: bg }]}>
			<ScrollView contentContainerStyle={{ padding: 16 }}>
				<View style={[styles.header, { backgroundColor: cardBg, borderColor: border }]}>
					<ThemedText type="title" style={{ marginBottom: 6 }}>
						{konsultan.full_name || "Nama belum diatur"}
					</ThemedText>
					<ThemedText style={{ color: muted }}>{konsultan.email}</ThemedText>
				</View>

				<View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
					<ThemedText type="subtitle" style={{ marginBottom: 8 }}>
						Informasi Kontak
					</ThemedText>
					<View style={styles.row}>
						<ThemedText style={{ color: muted }}>Email</ThemedText>
						<ThemedText style={{ color: text }}>{konsultan.email}</ThemedText>
					</View>
					<View style={styles.row}>
						<ThemedText style={{ color: muted }}>Telepon</ThemedText>
						<ThemedText style={{ color: text }}>{konsultan.phone || "-"}</ThemedText>
					</View>
				</View>

				<View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
					<ThemedText type="subtitle" style={{ marginBottom: 8 }}>
						Aksi
					</ThemedText>
					<View style={{ flexDirection: "row", gap: 8 }}>
						<Pressable
							style={[styles.actionBtn, { backgroundColor: tint, flex: 1 }]}
							onPress={() => router.push(`./edit/${konsultan.id}`)}>
							<IconSymbol name="gear" size={16} color="#fff" />
							<ThemedText style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>
								Edit
							</ThemedText>
						</Pressable>
					</View>
				</View>

				<View style={{ height: 40 }} />
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {
		padding: 14,
		borderRadius: 10,
		borderWidth: 1,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 1,
	},
	section: {
		padding: 12,
		borderRadius: 10,
		borderWidth: 1,
		marginBottom: 12,
		backgroundColor: "transparent",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		shadowRadius: 3,
		elevation: 1,
	},
	row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
	actionBtn: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
	},
});
