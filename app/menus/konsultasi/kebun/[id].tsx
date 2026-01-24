import MapAreaView from "@/components/map-area-view";
import ScheduleCalendar from "@/components/schedule-calendar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useKebun, type Kebun } from "@/hooks/use-kebun";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function KebunDetail() {
	const params = useLocalSearchParams();
	const router = useRouter();
	const { getKebunById, updateKebun } = useKebun();
	const id = params?.id as string;

	const [kebun, setKebun] = useState<Kebun | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showCalendar, setShowCalendar] = useState(false);

	const bg = useThemeColor({ light: "#F9FAFB", dark: "#111827" }, "background");
	const cardBg = useThemeColor({}, "card");
	const border = useThemeColor({}, "cardBorder");
	const text = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");
	const tint = useThemeColor({}, "tint");
	const success = useThemeColor({}, "success");
	const danger = useThemeColor({}, "danger");

	useEffect(() => {
		const fetchData = async () => {
			if (!id) {
				setError("ID kebun tidak ditemukan");
				setLoading(false);
				return;
			}

			setLoading(true);
			const result = await getKebunById(id);
			if (result.success && result.data) {
				setKebun(result.data);
				setError(null);
			} else {
				setError(result.error || "Gagal memuat data");
			}
			setLoading(false);
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const handleToggleStatus = async () => {
		if (!kebun) return;

		const newStatus = kebun.status === "Aktif" ? "Nonaktif" : "Aktif";
		const result = await updateKebun(kebun.id, { status: newStatus });
		if (result.success) {
			setKebun({ ...kebun, status: newStatus });
		}
	};

	if (loading) {
		return (
			<ThemedView style={[styles.container, { backgroundColor: bg }]}>
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<ActivityIndicator size="large" color="#1B5E20" />
					<ThemedText style={{ marginTop: 12, color: muted }}>Memuat data kebun...</ThemedText>
				</View>
			</ThemedView>
		);
	}

	if (error || !kebun) {
		return (
			<ThemedView style={[styles.container, { backgroundColor: bg }]}>
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
					<IconSymbol name="leaf.fill" size={48} color={muted} />
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
						{kebun.name}
					</ThemedText>
					<ThemedText style={{ color: kebun.status === "Aktif" ? success : danger }}>
						{kebun.status}
					</ThemedText>
				</View>

				<View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
					<ThemedText type="subtitle" style={{ marginBottom: 8 }}>
						Detail Kebun
					</ThemedText>
					<View style={styles.row}>
						<ThemedText style={{ color: muted }}>Lokasi</ThemedText>
						<ThemedText style={{ color: text }}>{kebun.location}</ThemedText>
					</View>
					<View style={styles.row}>
						<ThemedText style={{ color: muted }}>Komoditas</ThemedText>
						<ThemedText style={{ color: text }}>{kebun.commodity}</ThemedText>
					</View>
					<View style={styles.row}>
						<ThemedText style={{ color: muted }}>Luas</ThemedText>
						<ThemedText style={{ color: text }}>{kebun.area_ha} ha</ThemedText>
					</View>
					{kebun.latitude && kebun.longitude && (
						<View style={styles.row}>
							<ThemedText style={{ color: muted }}>Koordinat</ThemedText>
							<ThemedText style={{ color: text }}>
								{kebun.latitude.toFixed(6)}, {kebun.longitude.toFixed(6)}
							</ThemedText>
						</View>
					)}
				</View>

				<View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
					<ThemedText type="subtitle" style={{ marginBottom: 8 }}>
						Peta & Area (Geospasial)
					</ThemedText>
					<View style={{ gap: 12 }}>
						<View style={[styles.geoCard, { backgroundColor: cardBg, borderColor: border }]}>
							<View style={styles.geoLeft}>
								<IconSymbol name="leaf.fill" size={20} color={text} />
							</View>
							<View style={styles.geoBody}>
								<ThemedText style={{ color: text, fontWeight: "600" }}>Area Kebun</ThemedText>
								<ThemedText style={{ color: muted }}>
									{kebun.area_ha} ha — Poligon dummy tersedia
								</ThemedText>
							</View>
						</View>

						{kebun.latitude && kebun.longitude ? (
							<MapAreaView
								height={200}
								coordinates={[
									[kebun.latitude, kebun.longitude],
									[kebun.latitude + 0.001, kebun.longitude + 0.001],
									[kebun.latitude + 0.001, kebun.longitude - 0.001],
									[kebun.latitude - 0.001, kebun.longitude - 0.001],
								]}
							/>
						) : (
							<View
								style={{
									height: 200,
									borderRadius: 8,
									backgroundColor: cardBg,
									borderWidth: 1,
									borderColor: border,
									justifyContent: "center",
									alignItems: "center",
								}}>
								<ThemedText style={{ color: muted }}>Koordinat belum diatur</ThemedText>
							</View>
						)}
					</View>
				</View>
				<View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
					<ThemedText type="subtitle" style={{ marginBottom: 8 }}>
						Jadwal Kunjungan
					</ThemedText>

					<View style={{ gap: 10 }}>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
							}}>
							<ThemedText style={{ color: muted }}>Menampilkan 3 jadwal terdekat</ThemedText>
							<View style={{ flexDirection: "row", gap: 8 }}>
								<Pressable
									accessibilityLabel={showCalendar ? "Tampilkan daftar" : "Tampilkan kalender"}
									style={[
										styles.actionBtn,
										showCalendar
											? { backgroundColor: tint }
											: { backgroundColor: cardBg, borderWidth: 1, borderColor: border },
									]}
									onPress={() => setShowCalendar((s) => !s)}>
									{showCalendar ? (
										<IconSymbol name="list.bullet" size={18} color="#fff" />
									) : (
										<IconSymbol name="calendar" size={18} color={text} />
									)}
								</Pressable>
							</View>
						</View>

						{showCalendar ? (
							<ScheduleCalendar
								events={[
									{
										id: "s1",
										date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
										note: "Pemeriksaan umum",
									},
									{
										id: "s2",
										date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
										note: "Pemupukan",
									},
									{
										id: "s3",
										date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
										note: "Panen kecil",
									},
								]}
							/>
						) : (
							<>
								{[
									{
										id: "s1",
										date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
										note: "Pemeriksaan umum",
									},
									{
										id: "s2",
										date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
										note: "Pemupukan",
									},
									{
										id: "s3",
										date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
										note: "Panen kecil",
									},
								].map((s) => (
									<View
										key={s.id}
										style={[
											{
												flexDirection: "row",
												alignItems: "center",
												padding: 10,
												borderRadius: 8,
												borderWidth: 1,
											},
											{ backgroundColor: cardBg, borderColor: border },
										]}>
										<View
											style={{
												width: 44,
												height: 44,
												borderRadius: 8,
												alignItems: "center",
												justifyContent: "center",
												marginRight: 12,
											}}>
											<IconSymbol name="book" size={18} color={text} />
										</View>
										<View style={{ flex: 1 }}>
											<ThemedText style={{ color: text, fontWeight: "600" }}>
												{s.date.toLocaleDateString("id-ID")}
											</ThemedText>
											<ThemedText style={{ color: muted }}>{s.note}</ThemedText>
										</View>
									</View>
								))}
							</>
						)}
					</View>
				</View>
				<View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
					<ThemedText type="subtitle" style={{ marginBottom: 8 }}>
						Aksi
					</ThemedText>
					<View style={{ flexDirection: "row", gap: 8 }}>
						<Pressable
							style={[styles.actionBtn, { backgroundColor: tint, flex: 1 }]}
							onPress={() => router.push(`./edit/${kebun.id}`)}>
							<ThemedText style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>
								Edit
							</ThemedText>
						</Pressable>
						<Pressable
							style={[
								styles.actionBtn,
								{ backgroundColor: kebun.status === "Aktif" ? danger : success, flex: 1 },
							]}
							onPress={handleToggleStatus}>
							<ThemedText style={{ color: "#fff", fontWeight: "600" }}>
								{kebun.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
							</ThemedText>
						</Pressable>
					</View>
				</View>

				<View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
					<ThemedText type="subtitle" style={{ marginBottom: 8 }}>
						Riwayat Kunjungan
					</ThemedText>
					<ThemedText style={{ color: muted }}>
						Belum ada data kunjungan. Tekan Riwayat untuk melihat catatan.
					</ThemedText>
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
		// subtle elevation
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
		// soft separation
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
	},
	geoCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		borderRadius: 8,
		borderWidth: 1,
		backgroundColor: "transparent",
	},
	geoLeft: {
		width: 44,
		height: 44,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	geoBody: { flex: 1 },
});
