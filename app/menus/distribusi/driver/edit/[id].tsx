import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useDriver } from "@/hooks/use-driver";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Href, Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from "react-native";

export default function EditDriver() {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const { drivers, updateDriver } = useDriver();
	const [saving, setSaving] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const border = useThemeColor({ light: "#E5E7EB", dark: "#374151" }, "cardBorder");
	const text = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const inputBg = useThemeColor({ light: "#F9FAFB", dark: "#1F2937" }, "background");
	const placeholderColor = useThemeColor({ light: "#9CA3AF", dark: "#6B7280" }, "icon");

	const [formData, setFormData] = useState({
		full_name: "",
		phone: "",
		email: "",
	});

	useEffect(() => {
		const driver = drivers.find((d) => d.id === id);
		if (driver) {
			setFormData({
				full_name: driver.full_name,
				phone: driver.phone,
				email: driver.email || "",
			});
		}
		setLoading(false);
	}, [id, drivers]);

	const handleSave = async () => {
		// Clear previous validation error
		setValidationError(null);

		// Validasi
		if (!formData.full_name.trim()) {
			setValidationError("Nama driver harus diisi");
			return;
		}
		if (!formData.phone.trim()) {
			setValidationError("No. HP harus diisi");
			return;
		}

		// Simpan ke database
		setSaving(true);
		const result = await updateDriver(id as string, {
			full_name: formData.full_name,
			phone: formData.phone,
		});
		setSaving(false);

		if (result.success) {
			if (router.canGoBack()) {
				router.back();
				setTimeout(() => {
					router.replace("/menus/distribusi/driver/" as Href);
				}, 100);
			} else {
				router.replace("/menus/distribusi/driver/" as Href);
			}
		} else {
			setValidationError(result.error || "Gagal memperbarui driver");
		}
	};

	if (loading) {
		return (
			<ThemedView style={[styles.container, { backgroundColor: inputBg, borderColor: border }]}>
				<ActivityIndicator size="large" color={text} />
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<Stack.Screen
				options={{
					presentation: "modal",
					headerShown: true,
					title: "Edit Driver",
					headerBackTitle: "Tutup",
				}}
			/>
			<ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
				{/* Email */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Email</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan email (opsional)"
						placeholderTextColor={placeholderColor}
						value={formData.email}
						onChangeText={(val) => setFormData({ ...formData, email: val })}
						keyboardType="email-address"
						autoCapitalize="none"
						editable={false}
					/>
				</View>

				{/* Nama Driver */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Nama Driver *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan nama driver"
						placeholderTextColor={placeholderColor}
						value={formData.full_name}
						onChangeText={(val) => setFormData({ ...formData, full_name: val })}
					/>
				</View>

				{/* No. HP */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>No. HP *</ThemedText>
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
							{saving ? "Menyimpan..." : "Simpan Perubahan"}
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
	statusRow: { flexDirection: "row", gap: 12 },
	statusButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		borderWidth: 1,
		alignItems: "center",
	},
	statusText: { fontSize: 15, fontWeight: "500" },
	buttonRow: { flexDirection: "row", gap: 12, marginTop: 12, marginBottom: 32 },
	button: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
	cancelButton: { borderWidth: 1, backgroundColor: "transparent" },
	cancelButtonText: { fontSize: 16, fontWeight: "600" },
	saveButton: { backgroundColor: "#1B5E20" },
	saveButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
