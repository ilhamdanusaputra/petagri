import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import KonsultasiRoleMiddleware from "./konsultasi/_middleware";

export default function KonsultasiMenu() {
	const router = useRouter();
	const cardBg = useThemeColor({}, "card");
	const borderColor = useThemeColor({}, "cardBorder");
	const textColor = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const iconTint = useThemeColor({}, "tint");

	return (
		<KonsultasiRoleMiddleware>
			<ThemedView style={styles.container}>
				<ThemedText type="title">KONSULTASI & KEBUN</ThemedText>
				<ThemedText>Halaman untuk konsultasi dan manajemen kebun.</ThemedText>

				<View style={{ height: 12 }} />

				<Pressable
					onPress={() => router.push("/menus/konsultasi/konsultan")}
					style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
					<View style={[styles.iconWrap, { backgroundColor: iconTint + "22" }]}>
						<IconSymbol name="person.fill" size={22} color={iconTint} />
					</View>
					<View style={styles.cardBody}>
						<ThemedText type="subtitle" style={[styles.cardTitle, { color: textColor }]}>
							Kelola Konsultan
						</ThemedText>
						<ThemedText style={[styles.cardDesc, { color: textColor }]}>
							Kelola data konsultan lapangan: daftar, tambah/edit/nonaktifkan, status aktif, wilayah
							tugas, dan akses riwayat kunjungan kebun.
						</ThemedText>
					</View>
				</Pressable>

				<Pressable
					onPress={() => router.push("/menus/konsultasi/kebun")}
					style={[styles.card, { backgroundColor: cardBg, borderColor, marginTop: 12 }]}>
					<View style={[styles.iconWrap, { backgroundColor: iconTint + "22" }]}>
						<IconSymbol name="leaf.fill" size={22} color={iconTint} />
					</View>
					<View style={styles.cardBody}>
						<ThemedText type="subtitle" style={[styles.cardTitle, { color: textColor }]}>
							Kelola Kebun
						</ThemedText>
						<ThemedText style={[styles.cardDesc, { color: textColor }]}>
							Kelola data kebun: daftar kebun, detail (lokasi, komoditas, luas), status kebun,
							riwayat kunjungan, dan rekomendasi konsultan.
						</ThemedText>
					</View>
				</Pressable>

				<Pressable
					onPress={() => router.push("/menus/konsultasi/visit-assignment")}
					style={[styles.card, { backgroundColor: cardBg, borderColor, marginTop: 12 }]}>
					<View style={[styles.iconWrap, { backgroundColor: iconTint + "22" }]}>
						<IconSymbol name="calendar" size={22} color={iconTint} />
					</View>
					<View style={styles.cardBody}>
						<ThemedText type="subtitle" style={[styles.cardTitle, { color: textColor }]}>
							Kelola Jadwal Kunjungan
						</ThemedText>
						<ThemedText style={[styles.cardDesc, { color: textColor }]}>
							Atur jadwal kunjungan konsultan ke kebun, lihat daftar kunjungan, dan buat kunjungan
							baru.
						</ThemedText>
					</View>
				</Pressable>

				<Pressable
					onPress={() => router.push("./visit-results")}
					style={[styles.card, { backgroundColor: cardBg, borderColor, marginTop: 12 }]}>
					<View style={[styles.iconWrap, { backgroundColor: iconTint + "22" }]}>
						<IconSymbol name="doc.text.fill" size={22} color={iconTint} />
					</View>
					<View style={styles.cardBody}>
						<ThemedText type="subtitle" style={[styles.cardTitle, { color: textColor }]}>
							Kelola Hasil Kunjungan
						</ThemedText>
						<ThemedText style={[styles.cardDesc, { color: textColor }]}>
							Tambah, lihat, dan edit laporan hasil kunjungan lapangan.
						</ThemedText>
					</View>
				</Pressable>
			</ThemedView>
		</KonsultasiRoleMiddleware>
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
