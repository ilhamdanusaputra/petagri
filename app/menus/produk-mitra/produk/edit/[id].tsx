import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useProduk } from "@/hooks/use-produk";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, TextInput } from "react-native";

export default function EditProdukPage() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
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
		<ThemedView style={{ flex: 1, padding: 16 }}>
			<Stack.Screen options={{ title: "Edit Produk", headerShown: true }} />
			{error ? (
				<ThemedText style={{ color: "#DC2626", marginBottom: 8 }}>{error}</ThemedText>
			) : null}
			<TextInput
				value={form.name || ""}
				onChangeText={(v) => handleChange("name", v)}
				placeholder="Nama Produk"
				style={{
					borderWidth: 1,
					borderColor: "#E5E7EB",
					borderRadius: 8,
					padding: 10,
					marginBottom: 12,
				}}
			/>
			<TextInput
				value={form.brand || ""}
				onChangeText={(v) => handleChange("brand", v)}
				placeholder="Brand"
				style={{
					borderWidth: 1,
					borderColor: "#E5E7EB",
					borderRadius: 8,
					padding: 10,
					marginBottom: 12,
				}}
			/>
			<TextInput
				value={form.category || ""}
				onChangeText={(v) => handleChange("category", v)}
				placeholder="Kategori"
				style={{
					borderWidth: 1,
					borderColor: "#E5E7EB",
					borderRadius: 8,
					padding: 10,
					marginBottom: 12,
				}}
			/>
			<TextInput
				value={form.base_price ? String(form.base_price) : ""}
				onChangeText={(v) => handleChange("base_price", Number(v))}
				placeholder="Harga Dasar"
				keyboardType="numeric"
				style={{
					borderWidth: 1,
					borderColor: "#E5E7EB",
					borderRadius: 8,
					padding: 10,
					marginBottom: 12,
				}}
			/>
			<TextInput
				value={form.unit || ""}
				onChangeText={(v) => handleChange("unit", v)}
				placeholder="Satuan"
				style={{
					borderWidth: 1,
					borderColor: "#E5E7EB",
					borderRadius: 8,
					padding: 10,
					marginBottom: 12,
				}}
			/>
			<TextInput
				value={form.dosage || ""}
				onChangeText={(v) => handleChange("dosage", v)}
				placeholder="Dosis"
				style={{
					borderWidth: 1,
					borderColor: "#E5E7EB",
					borderRadius: 8,
					padding: 10,
					marginBottom: 12,
				}}
			/>
			<TextInput
				value={form.description || ""}
				onChangeText={(v) => handleChange("description", v)}
				placeholder="Deskripsi"
				style={{
					borderWidth: 1,
					borderColor: "#E5E7EB",
					borderRadius: 8,
					padding: 10,
					marginBottom: 12,
				}}
				multiline
			/>
			<TextInput
				value={form.note || ""}
				onChangeText={(v) => handleChange("note", v)}
				placeholder="Catatan"
				style={{
					borderWidth: 1,
					borderColor: "#E5E7EB",
					borderRadius: 8,
					padding: 10,
					marginBottom: 12,
				}}
				multiline
			/>
			<Pressable
				onPress={handleSubmit}
				style={{
					backgroundColor: "#2563EB",
					padding: 12,
					borderRadius: 8,
					alignItems: "center",
					marginTop: 8,
				}}
				disabled={submitting}>
				<ThemedText style={{ color: "#fff", fontWeight: "600" }}>
					{submitting ? "Menyimpan..." : "Simpan Perubahan"}
				</ThemedText>
			</Pressable>
		</ThemedView>
	);
}
