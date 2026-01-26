import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useMitraToko } from "@/hooks/use-mitra-toko";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";

export default function MitraPage() {
	const [activeTab, setActiveTab] = useState("ringkasan");
	const cardBg = useThemeColor({}, "card");
	const borderColor = useThemeColor({}, "cardBorder");
	const textColor = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const tint = useThemeColor({}, "tint");
	const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");
	const statusAktif = useThemeColor({ light: "#10B981", dark: "#10B981" }, "success");
	const statusNonaktif = useThemeColor({ light: "#EF4444", dark: "#EF4444" }, "danger");

	const { mitraList, loading, deleteMitra, fetchMitra } = useMitraToko();
	const router = useRouter();

	const handleOpenAdd = () => {
		router.push("/menus/produk-mitra/mitra/add");
	};

	const handleOpenEdit = (item: any) => {
		router.push({
			pathname: "/menus/produk-mitra/mitra/edit/[id]",
			params: { id: item.id },
		});
	};

	const handleDelete = async (id: string) => {
		await deleteMitra(id);
	};
	return (
		<ThemedView style={styles.container}>
			{/* Tab Bar */}
			<View style={styles.tabBar}>
				<Pressable
					style={[styles.tabBtn, activeTab === "ringkasan" && { backgroundColor: tint + "22" }]}
					onPress={() => setActiveTab("ringkasan")}>
					<ThemedText style={[styles.tabText, activeTab === "ringkasan" && { color: tint }]}>
						Ringkasan Mitra
					</ThemedText>
				</Pressable>
				<Pressable
					style={[styles.tabBtn, activeTab === "laporan" && { backgroundColor: tint + "22" }]}
					onPress={() => setActiveTab("laporan")}>
					<ThemedText style={[styles.tabText, activeTab === "laporan" && { color: tint }]}>
						Laporan Penjualan
					</ThemedText>
				</Pressable>
			</View>

			{/* Tombol tambah mitra */}
			{activeTab === "ringkasan" && (
				<TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
					<IconSymbol name="plus" size={20} color={tint} />
					<ThemedText style={{ color: tint, fontWeight: "600", marginLeft: 6 }}>
						Tambah Mitra/Toko
					</ThemedText>
				</TouchableOpacity>
			)}

			{/* Tab Content */}
			{activeTab === "ringkasan" && (
				<FlatList
					data={mitraList}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ gap: 12, paddingTop: 8 }}
					refreshing={loading}
					onRefresh={fetchMitra}
					renderItem={({ item }) => (
						<ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
							<View style={styles.cardIconWrap}>
								<IconSymbol name="person.fill" size={28} color={tint} />
							</View>
							<View style={styles.cardBody}>
								<ThemedText type="subtitle" style={[styles.cardTitle, { color: textColor }]}>
									{item.name}
								</ThemedText>
								<ThemedText style={[styles.cardDesc, { color: muted }]}>
									Pemilik: {item.owner_name}
								</ThemedText>
								<ThemedText style={[styles.cardDesc, { color: muted }]}>
									Handphone: {item.handphone || "-"}
								</ThemedText>
								<ThemedText style={[styles.cardDesc, { color: muted }]}>
									Alamat: {item.address}
								</ThemedText>
								<ThemedText style={[styles.cardDesc, { color: muted }]}>
									Kota: {item.city}
								</ThemedText>
								<ThemedText style={[styles.cardDesc, { color: muted }]}>
									Provinsi: {item.province}
								</ThemedText>
								<ThemedText
									style={[
										styles.cardDesc,
										{
											color: item.status === "Aktif" ? statusAktif : statusNonaktif,
											fontWeight: "600",
										},
									]}>
									Status: {item.status}
								</ThemedText>
								<View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
									<TouchableOpacity onPress={() => handleOpenEdit(item)} style={styles.actionBtn}>
										<IconSymbol name="pencil" size={16} color={tint} />
									</TouchableOpacity>
									<TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
										<IconSymbol name="trash" size={16} color={statusNonaktif} />
									</TouchableOpacity>
								</View>
							</View>
						</ThemedView>
					)}
				/>
			)}

			{/* Modal Form Add/Edit Mitra */}
			{/* Modal logic removed */}
			{/* Tab laporan penjualan belum diimplementasikan */}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	tabBar: {
		flexDirection: "row",
		gap: 8,
		marginBottom: 16,
	},
	tabBtn: {
		flex: 1,
		paddingVertical: 10,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	tabText: {
		fontSize: 15,
		fontWeight: "600",
		color: "#6B7280",
	},
	addBtn: {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-end",
		marginBottom: 8,
		backgroundColor: "#F3F4F6",
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 8,
	},
	card: {
		flexDirection: "row",
		alignItems: "flex-start",
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		width: "100%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		shadowRadius: 2,
		elevation: 1,
	},
	cardIconWrap: {
		width: 44,
		height: 44,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
		backgroundColor: "#E5E7EB",
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
		marginBottom: 2,
	},
	actionBtn: {
		backgroundColor: "#F3F4F6",
		padding: 8,
		borderRadius: 8,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.18)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		width: "95%",
		borderRadius: 14,
		borderWidth: 1,
		padding: 18,
		maxHeight: "90%",
	},
	input: {
		borderWidth: 1,
		borderColor: "#E5E7EB",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 15,
		marginBottom: 10,
		backgroundColor: "#fff",
		color: "#1F2937",
	},
	saveBtn: {
		backgroundColor: "#1B5E20",
		paddingVertical: 12,
		paddingHorizontal: 18,
		borderRadius: 8,
		alignItems: "center",
		flex: 1,
	},
	cancelBtn: {
		backgroundColor: "#F3F4F6",
		paddingVertical: 12,
		paddingHorizontal: 18,
		borderRadius: 8,
		alignItems: "center",
		flex: 1,
	},
	badgeWarning: {
		backgroundColor: "#FEF3C7",
		borderRadius: 8,
		padding: 10,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: "#F59E42",
	},
});
