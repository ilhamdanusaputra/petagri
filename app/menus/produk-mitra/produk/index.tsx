import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useProduk } from "@/hooks/use-produk";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useUserHasMitra } from "@/hooks/use-user-has-mitra";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

export default function ProdukListPage() {
	const router = useRouter();
	const border = useThemeColor({ light: "#E5E7EB", dark: "#374151" }, "cardBorder");
	const cardBg = useThemeColor({}, "card");
	const text = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");
	const { hasMitra, loading: mitraLoading } = useUserHasMitra();
	const { products, loading: loadingProduk, deleteProduct } = useProduk();

	const handleEdit = (id: string) => {
		router.push({ pathname: "/menus/produk-mitra/produk/edit/[id]", params: { id } });
	};

	const handleDelete = async (id: string) => {
		await deleteProduct(id);
	};

	return (
		<ThemedView style={{ flex: 1 }}>
			<Stack.Screen options={{ title: "Daftar Produk", headerShown: true }} />
			<View style={{ padding: 16, flex: 1 }}>
				{!mitraLoading && !hasMitra && (
					<View style={styles.badgeWarning}>
						<ThemedText style={{ color: "#B45309", fontWeight: "600" }}>
							Anda belum terdaftar sebagai mitra/toko. Silakan buat mitra terlebih dahulu untuk
							dapat menambah produk.
						</ThemedText>
					</View>
				)}
				<Pressable
					style={[styles.addBtn, (!hasMitra || mitraLoading) && { opacity: 0.5 }]}
					onPress={() => hasMitra && !mitraLoading && router.push("/menus/produk-mitra/produk/add")}
					disabled={!hasMitra || mitraLoading}>
					<ThemedText style={styles.addBtnText}>+ Tambah Produk</ThemedText>
				</Pressable>
				<FlatList
					data={products}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ paddingBottom: 32 }}
					refreshing={loadingProduk}
					renderItem={({ item }) => (
						<View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
							<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
								<ThemedText style={styles.name}>{item.name}</ThemedText>
								<ThemedText style={styles.price}>
									Rp {item.base_price?.toLocaleString("id-ID")}
								</ThemedText>
							</View>
							<ThemedText style={styles.brandCat}>
								{item.brand ? item.brand + " • " : ""}
								{item.category}
							</ThemedText>
							<ThemedText style={styles.desc} numberOfLines={2}>
								{item.description}
							</ThemedText>
							<View style={styles.rowInfo}>
								<ThemedText style={styles.infoLabel}>Dosis:</ThemedText>
								<ThemedText style={styles.infoValue}>{item.dosage || "-"}</ThemedText>
								<ThemedText style={styles.infoLabel}>Satuan:</ThemedText>
								<ThemedText style={styles.infoValue}>{item.unit}</ThemedText>
							</View>
							{item.note ? <ThemedText style={styles.note}>{item.note}</ThemedText> : null}
							<View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}>
								<Pressable style={{ marginRight: 12 }} onPress={() => handleEdit(item.id)}>
									<Ionicons name="create-outline" size={20} color={text} />
								</Pressable>
								<Pressable onPress={() => handleDelete(item.id)}>
									<Ionicons name="trash-outline" size={20} color="#DC2626" />
								</Pressable>
							</View>
						</View>
					)}
					ListEmptyComponent={
						<ThemedText style={{ color: muted, textAlign: "center", marginTop: 32 }}>
							{loadingProduk ? "Memuat produk..." : "Belum ada produk."}
						</ThemedText>
					}
				/>
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	addBtn: {
		backgroundColor: "#1B5E20",
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: 18,
	},
	addBtnText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
	card: {
		borderWidth: 1,
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 1,
	},
	name: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
	price: { fontSize: 15, fontWeight: "600", color: "#1B5E20" },
	brandCat: { color: "#6B7280", fontSize: 13, marginBottom: 4 },
	desc: { color: "#374151", fontSize: 13, marginBottom: 8 },
	rowInfo: { flexDirection: "row", gap: 8, marginBottom: 4, flexWrap: "wrap" },
	infoLabel: { color: "#6B7280", fontSize: 12 },
	infoValue: { color: "#1F2937", fontSize: 12, marginRight: 8 },
	note: {
		backgroundColor: "#FEF3C7",
		color: "#B45309",
		fontSize: 12,
		borderRadius: 6,
		paddingHorizontal: 8,
		paddingVertical: 4,
		marginTop: 6,
		alignSelf: "flex-start",
		fontWeight: "600",
	},
	badgeWarning: {
		backgroundColor: "#FEF3C7",
		borderRadius: 8,
		padding: 10,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#F59E42",
	},
});
