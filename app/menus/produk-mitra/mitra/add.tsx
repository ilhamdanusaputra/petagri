import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useMitraToko } from "@/hooks/use-mitra-toko";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Picker } from "@react-native-picker/picker";
import { Href, Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

export default function AddMitraPage() {
	const { addMitra } = useMitraToko();
	const router = useRouter();
	const border = useThemeColor({ light: "#E5E7EB", dark: "#374151" }, "cardBorder");
	const text = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");
	const inputBg = useThemeColor({ light: "#F9FAFB", dark: "#1F2937" }, "background");
	const placeholderColor = useThemeColor({ light: "#9CA3AF", dark: "#6B7280" }, "icon");
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({
		email: "",
		password: "",
		name: "",
		owner_name: "",
		phone: "",
		handphone: "",
		address: "",
		city: "",
		province: "",
		status: "Aktif",
	});
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const handleSave = async () => {
		setErrorMsg(null);
		setSaving(true);
		if (!form.name || !form.owner_name || !form.address || !form.city || !form.province) {
			setErrorMsg("Semua field wajib diisi.");
			setSaving(false);
			return;
		}
		if (!form.email || !form.password) {
			setErrorMsg("Email dan password wajib diisi untuk membuat user mitra.");
			setSaving(false);
			return;
		}
		const res = await addMitra(form);
		if (!res.success) {
			setErrorMsg(res.error || "Gagal menambah mitra");
			setSaving(false);
			return;
		}
		setSaving(false);
		if (res.success) {
			if (router.canGoBack()) {
				router.back();
				setTimeout(() => {
					// Use router.replace to force reload if needed
					router.replace(`/menus/produk-mitra/mitra/` as Href);
				}, 100);
			} else {
				router.replace(`/menus/produk-mitra/mitra/` as Href);
			}
		}
	};

	return (
		<ThemedView style={styles.container}>
			<Stack.Screen
				options={{
					presentation: "modal",
					headerShown: true,
					title: "Tambah Mitra/Toko",
					headerBackTitle: "Tutup",
				}}
			/>
			<ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
				{/* Badge warning */}
				<View style={styles.badgeWarning}>
					<ThemedText style={{ color: "#B45309", fontWeight: "600" }}>
						Membuat mitra/toko akan otomatis membuat user baru. Silakan isi email, password, dan
						phone untuk akun mitra/toko.
					</ThemedText>
				</View>
				{/* Email */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Email *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan email"
						placeholderTextColor={placeholderColor}
						value={form.email}
						onChangeText={(val) => setForm((f) => ({ ...f, email: val }))}
						keyboardType="email-address"
						autoCapitalize="none"
					/>
				</View>
				{/* Password */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Password *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Minimal 6 karakter"
						placeholderTextColor={placeholderColor}
						value={form.password}
						onChangeText={(val) => setForm((f) => ({ ...f, password: val }))}
						secureTextEntry
					/>
					<ThemedText style={{ color: muted, fontSize: 12, marginTop: 4 }}>
						Password untuk login pertama kali
					</ThemedText>
				</View>
				{/* Nama Toko/Mitra */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Nama Toko/Mitra *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan nama toko/mitra"
						placeholderTextColor={placeholderColor}
						value={form.name}
						onChangeText={(val) => setForm((f) => ({ ...f, name: val }))}
					/>
				</View>
				{/* Nama Pemilik */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Nama Pemilik *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan nama pemilik"
						placeholderTextColor={placeholderColor}
						value={form.owner_name}
						onChangeText={(val) => setForm((f) => ({ ...f, owner_name: val }))}
					/>
				</View>
				{/* Telepon */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Telepon</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Contoh: 0211234567"
						placeholderTextColor={placeholderColor}
						value={form.phone}
						onChangeText={(val) => setForm((f) => ({ ...f, phone: val }))}
						keyboardType="phone-pad"
					/>
				</View>
				{/* Handphone */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Handphone</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Contoh: 081234567890"
						placeholderTextColor={placeholderColor}
						value={form.handphone}
						onChangeText={(val) => setForm((f) => ({ ...f, handphone: val }))}
						keyboardType="phone-pad"
					/>
				</View>
				{/* Alamat */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Alamat *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan alamat"
						placeholderTextColor={placeholderColor}
						value={form.address}
						onChangeText={(val) => setForm((f) => ({ ...f, address: val }))}
					/>
				</View>
				{/* Kota */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Kota *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan kota"
						placeholderTextColor={placeholderColor}
						value={form.city}
						onChangeText={(val) => setForm((f) => ({ ...f, city: val }))}
					/>
				</View>
				{/* Provinsi */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Provinsi *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan provinsi"
						placeholderTextColor={placeholderColor}
						value={form.province}
						onChangeText={(val) => setForm((f) => ({ ...f, province: val }))}
					/>
				</View>
				{/* Status */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Status</ThemedText>
					<View style={styles.pickerWrapper}>
						<Picker
							selectedValue={form.status}
							onValueChange={(value) => setForm((f) => ({ ...f, status: value }))}
							mode="dropdown"
							style={[styles.picker, { color: text, backgroundColor: inputBg }]}>
							<Picker.Item label="Aktif" value="Aktif" />
							<Picker.Item label="Nonaktif" value="Nonaktif" />
						</Picker>
					</View>
				</View>
				{/* Validation Error */}
				{errorMsg && (
					<View
						style={{ marginBottom: 16, padding: 12, backgroundColor: "#FEE2E2", borderRadius: 8 }}>
						<ThemedText style={{ color: "#DC2626", fontSize: 14 }}>{errorMsg}</ThemedText>
					</View>
				)}
				{/* Buttons */}
				<View style={styles.buttonRow}>
					<Pressable
						style={[styles.button, styles.cancelButton, { borderColor: border }]}
						onPress={() => router.back()}>
						<ThemedText style={styles.cancelButtonText}>Batal</ThemedText>
					</Pressable>
					<Pressable
						style={[styles.button, styles.saveButton, saving && { opacity: 0.6 }]}
						onPress={handleSave}
						disabled={saving}>
						<ThemedText style={styles.saveButtonText}>
							{saving ? "Menyimpan..." : "Tambah Mitra"}
						</ThemedText>
					</Pressable>
				</View>
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	badgeWarning: {
		backgroundColor: "#FEF3C7",
		borderRadius: 8,
		padding: 10,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#F59E42",
	},
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
	pickerWrapper: {
		borderWidth: 1,
		borderRadius: 8,
		borderColor: "#E5E7EB",
		overflow: "hidden",
		marginBottom: 10,
		backgroundColor: "#fff",
	},
	picker: {
		height: 44,
		width: "100%",
		color: "#1F2937",
	},
	buttonRow: { flexDirection: "row", gap: 12, marginTop: 12, marginBottom: 32 },
	button: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
	cancelButton: { borderWidth: 1, backgroundColor: "transparent" },
	cancelButtonText: { fontSize: 16, fontWeight: "600" },
	saveButton: { backgroundColor: "#1B5E20" },
	saveButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
