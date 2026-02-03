import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useDriver } from "@/hooks/use-driver";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Href, Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

export default function AddDriver() {
	const router = useRouter();
	const { addDriver } = useDriver();
	const [saving, setSaving] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);
	const border = useThemeColor({ light: "#E5E7EB", dark: "#374151" }, "cardBorder");
	const text = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const inputBg = useThemeColor({ light: "#F9FAFB", dark: "#1F2937" }, "background");
	const placeholderColor = useThemeColor({ light: "#9CA3AF", dark: "#6B7280" }, "icon");

	const [formData, setFormData] = useState({
		full_name: "",
		phone: "",
		email: "",
		password: "",
		driver_code: "",
		status: "active" as "active" | "nonactive",
		vehicle_plate_number: "",
		vehicle_type: "" as "" | "motorcycle" | "car" | "van" | "truck",
	});

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
		if (!formData.email.trim()) {
			setValidationError("Email harus diisi");
			return;
		}
		if (!formData.password.trim()) {
			setValidationError("Password harus diisi");
			return;
		}
		// Simpan ke database
		setSaving(true);
		const result = await addDriver({
			full_name: formData.full_name,
			phone: formData.phone,
			email: formData.email,
			password: formData.password,
			driver_code: formData.driver_code,
			status: formData.status,
			vehicle_plate_number: formData.vehicle_plate_number,
			vehicle_type: formData.vehicle_type || undefined,
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
			setValidationError(result.error || "Gagal menambahkan driver");
		}
	};

	return (
		<ThemedView style={styles.container}>
			<Stack.Screen
				options={{
					presentation: "modal",
					headerShown: true,
					title: "Tambah Driver",
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

				{/* Kode Driver */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Kode Driver</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Contoh: DRV001"
						placeholderTextColor={placeholderColor}
						value={formData.driver_code}
						onChangeText={(val) => setFormData({ ...formData, driver_code: val })}
					/>
				</View>

				{/* Status */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Status</ThemedText>
					<View style={styles.statusRow}>
						<Pressable
							style={[
								styles.statusButton,
								{ borderColor: border },
								formData.status === "active" && {
									backgroundColor: "#1B5E20",
									borderColor: "#1B5E20",
								},
							]}
							onPress={() => setFormData({ ...formData, status: "active" })}>
							<ThemedText
								style={[styles.statusText, formData.status === "active" && { color: "#fff" }]}>
								Aktif
							</ThemedText>
						</Pressable>
						<Pressable
							style={[
								styles.statusButton,
								{ borderColor: border },
								formData.status === "nonactive" && {
									backgroundColor: "#DC2626",
									borderColor: "#DC2626",
								},
							]}
							onPress={() => setFormData({ ...formData, status: "nonactive" })}>
							<ThemedText
								style={[styles.statusText, formData.status === "nonactive" && { color: "#fff" }]}>
								Nonaktif
							</ThemedText>
						</Pressable>
					</View>
				</View>

				{/* Nomor Plat */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Nomor Plat Kendaraan</ThemedText>
					<TextInput
						style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
						placeholder="Contoh: B 1234 XYZ"
						placeholderTextColor={placeholderColor}
						value={formData.vehicle_plate_number}
						onChangeText={(val) => setFormData({ ...formData, vehicle_plate_number: val })}
						autoCapitalize="characters"
					/>
				</View>

				{/* Jenis Kendaraan */}
				<View style={styles.fieldGroup}>
					<ThemedText style={styles.label}>Jenis Kendaraan</ThemedText>
					<View style={styles.vehicleRow}>
						{[
							{ label: "Motor", value: "motorcycle" },
							{ label: "Mobil", value: "car" },
							{ label: "Van", value: "van" },
							{ label: "Truk", value: "truck" },
						].map((type) => (
							<Pressable
								key={type.value}
								style={[
									styles.vehicleButton,
									{ borderColor: border },
									formData.vehicle_type === type.value && {
										backgroundColor: "#1B5E20",
										borderColor: "#1B5E20",
									},
								]}
								onPress={() =>
									setFormData({
										...formData,
										vehicle_type: type.value as "motorcycle" | "car" | "van" | "truck",
									})
								}>
								<ThemedText
									style={[
										styles.vehicleText,
										formData.vehicle_type === type.value && { color: "#fff" },
									]}>
									{type.label}
								</ThemedText>
							</Pressable>
						))}
					</View>
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
	vehicleRow: { flexDirection: "row", gap: 8 },
	vehicleButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		borderWidth: 1,
		alignItems: "center",
	},
	vehicleText: { fontSize: 14, fontWeight: "500" },
	buttonRow: { flexDirection: "row", gap: 12, marginTop: 12, marginBottom: 32 },
	button: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: "center" },
	cancelButton: { borderWidth: 1, backgroundColor: "transparent" },
	cancelButtonText: { fontSize: 16, fontWeight: "600" },
	saveButton: { backgroundColor: "#1B5E20" },
	saveButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
