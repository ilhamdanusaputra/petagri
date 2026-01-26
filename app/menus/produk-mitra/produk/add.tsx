import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useMitraToko } from "@/hooks/use-mitra-toko";
import { useProduk } from "@/hooks/use-produk";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useUserHasMitra } from "@/hooks/use-user-has-mitra";
import { Href, Stack, useRouter } from "expo-router";

import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

export default function AddProductPage() {
	const router = useRouter();
	const border = useThemeColor({ light: "#E5E7EB", dark: "#374151" }, "cardBorder");
	const text = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const inputBg = useThemeColor({ light: "#F9FAFB", dark: "#1F2937" }, "background");
	const placeholderColor = useThemeColor({ light: "#9CA3AF", dark: "#6B7280" }, "icon");
	const { hasMitra } = useUserHasMitra();
	const { mitraList } = useMitraToko();
	const { createProduct, loading: saving } = useProduk();
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [form, setForm] = useState({
		name: "",
		brand: "",
		category: "",
		description: "",
		dosage: "",
		unit: "",
		base_price: "",
		note: "",
	});

	const handleSave = async () => {
		setErrorMsg(null);
		if (!form.name || !form.unit || !form.base_price) {
			setErrorMsg("Nama produk, satuan, dan harga dasar wajib diisi.");
			return;
		}
		// Ambil mitra_id milik user login (pertama saja)
		const myMitra = mitraList.find((m) => m.user_id);
		if (!myMitra) {
			setErrorMsg("Mitra tidak ditemukan. Silakan buat mitra terlebih dahulu.");
			return;
		}
		const res = await createProduct({
			...form,
			mitra_id: myMitra.id,
		});
		if (res.success) {
			router.replace("/menus/produk-mitra/produk/" as Href);
		} else {
			setErrorMsg(res.error || "Gagal menambah produk");
		}
	};

	return (
		<ThemedView style={styles.container}>
			<Stack.Screen
				options={{ title: "Tambah Produk", headerShown: true, presentation: "modal" }}
			/>
			<ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
				{!hasMitra && (
					<View style={styles.badgeWarning}>
						<ThemedText style={{ color: "#B45309", fontWeight: "600" }}>
							Anda belum terdaftar sebagai mitra/toko. Tidak dapat menambah produk.
						</ThemedText>
					</View>
				)}
				{errorMsg && (
					<View style={styles.errorBox}>
						<ThemedText style={{ color: "#DC2626", fontSize: 14 }}>{errorMsg}</ThemedText>
					</View>
				)}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Nama Produk *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan nama produk"
						placeholderTextColor={placeholderColor}
						value={form.name}
						onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
					/>
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Brand</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan brand (opsional)"
						placeholderTextColor={placeholderColor}
						value={form.brand}
						onChangeText={(v) => setForm((f) => ({ ...f, brand: v }))}
					/>
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Kategori</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan kategori (opsional)"
						placeholderTextColor={placeholderColor}
						value={form.category}
						onChangeText={(v) => setForm((f) => ({ ...f, category: v }))}
					/>
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Deskripsi</ThemedText>
					<TextInput
						style={[
							styles.input,
							{ backgroundColor: inputBg, color: text, borderColor: border, minHeight: 60 },
						]}
						placeholder="Deskripsi produk (opsional)"
						placeholderTextColor={placeholderColor}
						value={form.description}
						onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
						multiline
					/>
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Dosis</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Contoh: 2 ml / liter air"
						placeholderTextColor={placeholderColor}
						value={form.dosage}
						onChangeText={(v) => setForm((f) => ({ ...f, dosage: v }))}
					/>
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Satuan *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="kg, liter, botol, sak, dll"
						placeholderTextColor={placeholderColor}
						value={form.unit}
						onChangeText={(v) => setForm((f) => ({ ...f, unit: v }))}
					/>
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Harga Dasar Mitra *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan harga dasar"
						placeholderTextColor={placeholderColor}
						value={form.base_price}
						onChangeText={(v) => setForm((f) => ({ ...f, base_price: v }))}
						keyboardType="numeric"
					/>
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Catatan Internal</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Catatan internal (opsional)"
						placeholderTextColor={placeholderColor}
						value={form.note}
						onChangeText={(v) => setForm((f) => ({ ...f, note: v }))}
					/>
				</View>
				<View style={styles.buttonRow}>
					<Pressable
						style={[styles.button, styles.cancelButton, { borderColor: border }]}
						onPress={() => router.back()}>
						<ThemedText style={styles.cancelButtonText}>Batal</ThemedText>
					</Pressable>
					<Pressable
						style={[styles.button, styles.saveButton, (saving || !hasMitra) && { opacity: 0.6 }]}
						onPress={handleSave}
						disabled={saving || !hasMitra}>
						<ThemedText style={styles.saveButtonText}>
							{saving ? "Menyimpan..." : "Simpan"}
						</ThemedText>
					</Pressable>
				</View>
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	form: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
	fieldGroup: { marginBottom: 20 },
	label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
	input: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 16,
		marginBottom: 10,
	},
	buttonRow: { flexDirection: "row", gap: 12, marginTop: 12, marginBottom: 32 },
	button: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
	cancelButton: { borderWidth: 1, backgroundColor: "transparent" },
	cancelButtonText: { fontSize: 16, fontWeight: "600" },
	saveButton: { backgroundColor: "#1B5E20" },
	saveButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
	badgeWarning: {
		backgroundColor: "#FEF3C7",
		borderRadius: 8,
		padding: 10,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#F59E42",
	},
	errorBox: {
		marginBottom: 16,
		padding: 12,
		backgroundColor: "#FEE2E2",
		borderRadius: 8,
	},
});
