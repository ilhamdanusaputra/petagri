import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useDriver } from "@/hooks/use-driver";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

export default function DriverPage() {
	const router = useRouter();
	const cardBg = useThemeColor({}, "card");
	const borderColor = useThemeColor({}, "cardBorder");
	const textColor = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const tint = useThemeColor({}, "tint");
	const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");

	const { drivers, loading, fetchDrivers } = useDriver();
	const vehicleTypeLabel: Record<string, string> = {
		car: "Mobil",
		motorcycle: "Motor",
		truck: "Truck",
		van: "Van",
	};

	const handleAdd = () => {
		router.push("/menus/distribusi/driver/add");
	};

	const handleEdit = (item: any) => {
		router.push({
			pathname: "/menus/distribusi/driver/edit/[id]",
			params: { id: item.id },
		});
	};

	return (
		<ThemedView style={styles.container}>
			<Stack.Screen options={{ title: "Kelola Driver", headerShown: true }} />

			{/* Tombol tambah driver */}
			<TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
				<IconSymbol name="plus" size={20} color={tint} />
				<ThemedText style={{ color: tint, fontWeight: "600", marginLeft: 6 }}>
					Tambah Driver
				</ThemedText>
			</TouchableOpacity>

			<FlatList
				data={drivers}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{ gap: 12, paddingTop: 8 }}
				refreshing={loading}
				onRefresh={fetchDrivers}
				renderItem={({ item }) => (
					<ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
						<View style={styles.cardIconWrap}>
							<IconSymbol name="car.fill" size={28} color={tint} />
						</View>
						<View style={styles.cardBody}>
							<ThemedText type="subtitle" style={[styles.cardTitle, { color: textColor }]}>
								{item.name ?? "-"}
							</ThemedText>
							<ThemedText style={[styles.cardDesc, { color: muted }]}>
								Kode Driver: {item.driver_code ?? "-"}
							</ThemedText>
							<ThemedText style={[styles.cardDesc, { color: muted }]}>
								No. HP: {item.phone ?? "-"}
							</ThemedText>
							<ThemedText style={[styles.cardDesc, { color: muted }]}>
								Status: {item.status ?? "-"}
							</ThemedText>
							<ThemedText style={[styles.cardDesc, { color: muted }]}>
								Plat Nomor: {item.vehicle_plate_number ?? "-"}
							</ThemedText>
							<ThemedText style={[styles.cardDesc, { color: muted }]}>
								Tipe Kendaraan: {item.vehicle_type ? vehicleTypeLabel[item.vehicle_type] ?? "-" : "-"}
							</ThemedText>
							<View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
								<TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
									<IconSymbol name="pencil" size={16} color={tint} />
								</TouchableOpacity>
							</View>
						</View>
					</ThemedView>
				)}
				ListEmptyComponent={
					<ThemedText style={{ color: muted, textAlign: "center", marginTop: 32 }}>
						{loading ? "Memuat driver..." : "Belum ada driver."}
					</ThemedText>
				}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
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
});
