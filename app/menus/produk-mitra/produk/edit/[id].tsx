import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useProduk } from "@/hooks/use-produk";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from "react-native";

export default function EditProdukPage() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const border = useThemeColor({ light: "#E5E7EB", dark: "#374151" }, "cardBorder");
	const text = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const inputBg = useThemeColor({ light: "#F9FAFB", dark: "#1F2937" }, "background");
	const placeholderColor = useThemeColor({ light: "#9CA3AF", dark: "#6B7280" }, "icon");
	const { products, updateProduct, loading } = useProduk();
	const [form, setForm] = useState<any>({});
	const [error, setError] = useState<string>("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const produk = products.find((p) => p.id === id);
		if (produk) setForm(produk);
	}, [id, products]);

	const handleChange = (key: string, value: any) => {
		setForm((prev: any) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = async () => {
		setSubmitting(true);
		setError("");
		const res = await updateProduct(form);
		if (res?.error) {
			const msg = typeof res.error === "string" ? res.error : "Gagal update produk";
			setError(msg);
		} else router.back();
		setSubmitting(false);
	};

	if (loading) return <ActivityIndicator style={{ marginTop: 32 }} />;

	return (
		<ThemedView style={styles.container}>
			<Stack.Screen options={{ title: "Edit Produk", headerShown: true, presentation: "modal" }} />
			<ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
				{error && (
					<View style={styles.errorBox}>
						<ThemedText style={{ color: "#DC2626", fontSize: 14 }}>{error}</ThemedText>
					</View>
				)}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Nama Produk *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan nama produk"
						placeholderTextColor={placeholderColor}
						value={form.name || ""}
						onChangeText={(v) => handleChange("name", v)}
					/>
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Brand</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan brand (opsional)"
						placeholderTextColor={placeholderColor}
						value={form.brand || ""}
						onChangeText={(v) => handleChange("brand", v)}
					/>
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Kategori</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan kategori (opsional)"
						placeholderTextColor={placeholderColor}
						value={form.category || ""}
						onChangeText={(v) => handleChange("category", v)}
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
						value={form.description || ""}
						onChangeText={(v) => handleChange("description", v)}
						multiline
					/>
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Dosis</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Contoh: 2 ml / liter air"
						placeholderTextColor={placeholderColor}
						value={form.dosage || ""}
						onChangeText={(v) => handleChange("dosage", v)}
					/>
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Satuan *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="kg, liter, botol, sak, dll"
						placeholderTextColor={placeholderColor}
						value={form.unit || ""}
						onChangeText={(v) => handleChange("unit", v)}
					/>
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Harga Dasar Mitra *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan harga dasar"
						placeholderTextColor={placeholderColor}
						value={form.base_price ? String(form.base_price) : ""}
						onChangeText={(v) => handleChange("base_price", Number(v))}
						keyboardType="numeric"
					/>
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Catatan Internal</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Catatan internal (opsional)"
						placeholderTextColor={placeholderColor}
						value={form.note || ""}
						onChangeText={(v) => handleChange("note", v)}
					/>
				</View>
				<View style={styles.buttonRow}>
					<Pressable
						style={[styles.button, styles.cancelButton, { borderColor: border }]}
						onPress={() => router.back()}>
						<ThemedText style={styles.cancelButtonText}>Batal</ThemedText>
					</Pressable>
					<Pressable
						style={[styles.button, styles.saveButton, submitting && { opacity: 0.6 }]}
						onPress={handleSubmit}
						disabled={submitting}>
						<ThemedText style={styles.saveButtonText}>
							{submitting ? "Menyimpan..." : "Simpan Perubahan"}
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
	errorBox: {
		marginBottom: 16,
		padding: 12,
		backgroundColor: "#FEE2E2",
		borderRadius: 8,
	},
});
