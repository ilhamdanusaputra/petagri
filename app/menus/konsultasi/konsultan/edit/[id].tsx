import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useKonsultan } from "@/hooks/use-konsultan";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from "react-native";

export default function EditKonsultan() {
	const params = useLocalSearchParams();
	const router = useRouter();
	const { getKonsultanById, updateKonsultan } = useKonsultan();
	const id = params?.id as string;

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [validationError, setValidationError] = useState<string | null>(null);

	const border = useThemeColor({ light: "#E5E7EB", dark: "#374151" }, "cardBorder");
	const text = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");
	const inputBg = useThemeColor({ light: "#F9FAFB", dark: "#1F2937" }, "background");
	const placeholderColor = useThemeColor({ light: "#9CA3AF", dark: "#6B7280" }, "icon");

	const [formData, setFormData] = useState({
		fullName: "",
		phone: "",
		email: "",
	});

	useEffect(() => {
		const fetchData = async () => {
			if (!id) {
				setError("ID konsultan tidak ditemukan");
				setLoading(false);
				return;
			}

			setLoading(true);
			const result = await getKonsultanById(id);
			if (result.success && result.data) {
				const konsultan = result.data;
				setFormData({
					fullName: konsultan.full_name || "",
					phone: konsultan.phone || "",
					email: konsultan.email,
				});
				setError(null);
			} else {
				setError(result.error || "Gagal memuat data");
			}
			setLoading(false);
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const handleSave = async () => {
		// Clear previous validation error
		setValidationError(null);

		// Validasi
		if (!formData.fullName.trim()) {
			setValidationError("Nama lengkap harus diisi");
			return;
		}

		// Update ke database
		setSaving(true);
		const result = await updateKonsultan(id, {
			full_name: formData.fullName,
			phone: formData.phone || undefined,
		});
		setSaving(false);

		if (result.success) {
			router.back();
		} else {
			setValidationError(result.error || "Gagal memperbarui konsultan");
		}
	};

	if (loading) {
		return (
			<ThemedView style={styles.container}>
				<Stack.Screen
					options={{
						presentation: "modal",
						headerShown: true,
						title: "Edit Konsultan",
						headerBackTitle: "Tutup",
					}}
				/>
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<ActivityIndicator size="large" color="#1B5E20" />
					<ThemedText style={{ marginTop: 12, color: muted }}>Memuat data...</ThemedText>
				</View>
			</ThemedView>
		);
	}

	if (error) {
		return (
			<ThemedView style={styles.container}>
				<Stack.Screen
					options={{
						presentation: "modal",
						headerShown: true,
						title: "Edit Konsultan",
						headerBackTitle: "Tutup",
					}}
				/>
				<View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
					<ThemedText style={{ color: "#EF4444", marginBottom: 8 }}>Error: {error}</ThemedText>
					<Pressable
						style={{
							marginTop: 16,
							paddingHorizontal: 20,
							paddingVertical: 10,
							backgroundColor: "#1B5E20",
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
		<ThemedView style={styles.container}>
			<Stack.Screen
				options={{
					presentation: "modal",
					headerShown: true,
					title: "Edit Konsultan",
					headerBackTitle: "Tutup",
				}}
			/>
			<ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
				{/* Email (read-only) */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Email</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: muted, borderColor: border }]}
						value={formData.email}
						editable={false}
					/>
					<ThemedText style={{ color: muted, fontSize: 12, marginTop: 4 }}>
						Email tidak dapat diubah
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
