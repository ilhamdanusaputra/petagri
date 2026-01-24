import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useKebun } from "@/hooks/use-kebun";
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

export default function EditKebun() {
	const params = useLocalSearchParams();
	const router = useRouter();
	const { getKebunById, updateKebun } = useKebun();
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
		name: "",
		status: "Aktif" as "Aktif" | "Nonaktif",
		location: "",
		commodity: "",
		areaHa: "",
		latitude: "",
		longitude: "",
	});

	useEffect(() => {
		const fetchData = async () => {
			if (!id) {
				setError("ID kebun tidak ditemukan");
				setLoading(false);
				return;
			}

			setLoading(true);
			const result = await getKebunById(id);
			if (result.success && result.data) {
				const kebun = result.data;
				setFormData({
					name: kebun.name,
					status: kebun.status,
					location: kebun.location,
					commodity: kebun.commodity,
					areaHa: kebun.area_ha.toString(),
					latitude: kebun.latitude?.toString() || "",
					longitude: kebun.longitude?.toString() || "",
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
		if (!formData.name.trim()) {
			setValidationError("Nama kebun harus diisi");
			return;
		}
		if (!formData.location.trim()) {
			setValidationError("Lokasi harus diisi");
			return;
		}
		if (!formData.commodity.trim()) {
			setValidationError("Komoditas harus diisi");
			return;
		}
		if (!formData.areaHa || isNaN(parseFloat(formData.areaHa))) {
			setValidationError("Luas harus berupa angka");
			return;
		}
		if (formData.latitude && isNaN(parseFloat(formData.latitude))) {
			setValidationError("Latitude harus berupa angka");
			return;
		}
		if (formData.longitude && isNaN(parseFloat(formData.longitude))) {
			setValidationError("Longitude harus berupa angka");
			return;
		}

		// Update ke database
		setSaving(true);
		const result = await updateKebun(id, {
			name: formData.name,
			status: formData.status,
			location: formData.location,
			commodity: formData.commodity,
			area_ha: parseFloat(formData.areaHa),
			latitude: formData.latitude ? parseFloat(formData.latitude) : null,
			longitude: formData.longitude ? parseFloat(formData.longitude) : null,
		});
		setSaving(false);

		if (result.success) {
			router.back();
		} else {
			setValidationError(result.error || "Gagal memperbarui kebun");
		}
	};

	if (loading) {
		return (
			<ThemedView style={styles.container}>
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
					title: "Edit Kebun",
					headerBackTitle: "Tutup",
				}}
			/>
			<ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
				{/* Nama Kebun */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Nama Kebun *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Masukkan nama kebun"
						placeholderTextColor={placeholderColor}
						value={formData.name}
						onChangeText={(val) => setFormData({ ...formData, name: val })}
					/>
				</View>

				{/* Status */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Status *</ThemedText>
					<View style={styles.statusRow}>
						<Pressable
							style={[
								styles.statusButton,
								{ borderColor: border },
								formData.status === "Aktif" && {
									backgroundColor: "#10B981",
									borderColor: "#10B981",
								},
							]}
							onPress={() => setFormData({ ...formData, status: "Aktif" })}>
							<ThemedText
								style={[styles.statusText, formData.status === "Aktif" && { color: "#fff" }]}>
								Aktif
							</ThemedText>
						</Pressable>
						<Pressable
							style={[
								styles.statusButton,
								{ borderColor: border },
								formData.status === "Nonaktif" && {
									backgroundColor: "#EF4444",
									borderColor: "#EF4444",
								},
							]}
							onPress={() => setFormData({ ...formData, status: "Nonaktif" })}>
							<ThemedText
								style={[styles.statusText, formData.status === "Nonaktif" && { color: "#fff" }]}>
								Nonaktif
							</ThemedText>
						</Pressable>
					</View>
				</View>

				{/* Lokasi */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Lokasi *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Contoh: Kec. Lembang"
						placeholderTextColor={placeholderColor}
						value={formData.location}
						onChangeText={(val) => setFormData({ ...formData, location: val })}
					/>
				</View>

				{/* Komoditas */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Komoditas *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Contoh: Kopi, Kakao, Teh"
						placeholderTextColor={placeholderColor}
						value={formData.commodity}
						onChangeText={(val) => setFormData({ ...formData, commodity: val })}
					/>
				</View>

				{/* Luas (Ha) */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Luas (Ha) *</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Contoh: 2.5"
						placeholderTextColor={placeholderColor}
						value={formData.areaHa}
						onChangeText={(val) => setFormData({ ...formData, areaHa: val })}
						keyboardType="decimal-pad"
					/>
				</View>

				{/* Latitude */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Latitude</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Contoh: -6.905977"
						placeholderTextColor={placeholderColor}
						value={formData.latitude}
						onChangeText={(val) => setFormData({ ...formData, latitude: val })}
						keyboardType="decimal-pad"
					/>
				</View>

				{/* Longitude */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Longitude</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Contoh: 107.613144"
						placeholderTextColor={placeholderColor}
						value={formData.longitude}
						onChangeText={(val) => setFormData({ ...formData, longitude: val })}
						keyboardType="decimal-pad"
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
