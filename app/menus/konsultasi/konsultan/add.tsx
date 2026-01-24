import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useKonsultan } from "@/hooks/use-konsultan";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

export default function AddKonsultan() {
	const router = useRouter();
	const { createKonsultan } = useKonsultan();

	const [saving, setSaving] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);

	const border = useThemeColor({ light: "#E5E7EB", dark: "#374151" }, "cardBorder");
	const text = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");
	const inputBg = useThemeColor({ light: "#F9FAFB", dark: "#1F2937" }, "background");
	const placeholderColor = useThemeColor({ light: "#9CA3AF", dark: "#6B7280" }, "icon");

	const [formData, setFormData] = useState({
		email: "",
		password: "",
		fullName: "",
		phone: "",
	});

	const handleSave = async () => {
		// Clear previous validation error
		setValidationError(null);

		// Validasi
		if (!formData.email.trim()) {
			setValidationError("Email harus diisi");
			return;
		}
		if (!formData.password.trim() || formData.password.length < 6) {
			setValidationError("Password minimal 6 karakter");
			return;
		}
		if (!formData.fullName.trim()) {
			setValidationError("Nama lengkap harus diisi");
			return;
		}

		// Create konsultan
		setSaving(true);
		const result = await createKonsultan({
			email: formData.email,
			password: formData.password,
			full_name: formData.fullName,
			phone: formData.phone || undefined,
		});
		setSaving(false);

		if (result.success) {
			router.back();
		} else {
			setValidationError(result.error || "Gagal menambahkan konsultan");
		}
	};

	return (
		<ThemedView style={styles.container}>
			<Stack.Screen
				options={{
					presentation: "modal",
					headerShown: true,
					title: "Tambah Konsultan",
					headerBackTitle: "Tutup",
				}}
			/>
			<ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
				{/* Email */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Email *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan email"
						placeholderTextColor={placeholderColor}
						value={formData.email}
						onChangeText={(val) => setFormData({ ...formData, email: val })}
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
						value={formData.password}
						onChangeText={(val) => setFormData({ ...formData, password: val })}
						secureTextEntry
					/>
					<ThemedText style={{ color: muted, fontSize: 12, marginTop: 4 }}>
						Password untuk login pertama kali
					</ThemedText>
				</View>

				{/* Nama Lengkap */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Nama Lengkap *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan nama lengkap"
						placeholderTextColor={placeholderColor}
						value={formData.fullName}
						onChangeText={(val) => setFormData({ ...formData, fullName: val })}
					/>
				</View>

				{/* Telepon */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Telepon</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Contoh: 081234567890"
						placeholderTextColor={placeholderColor}
						value={formData.phone}
						onChangeText={(val) => setFormData({ ...formData, phone: val })}
						keyboardType="phone-pad"
					/>
				</View>

				{/* Validation Error */}
				{validationError && (
					<View
						style={{ marginBottom: 16, padding: 12, backgroundColor: "#FEE2E2", borderRadius: 8 }}>
						<ThemedText style={{ color: "#DC2626", fontSize: 14 }}>{validationError}</ThemedText>
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
	},
	buttonRow: { flexDirection: "row", gap: 12, marginTop: 12, marginBottom: 32 },
	button: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
	cancelButton: { borderWidth: 1, backgroundColor: "transparent" },
	cancelButtonText: { fontSize: 16, fontWeight: "600" },
	saveButton: { backgroundColor: "#1B5E20" },
	saveButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
