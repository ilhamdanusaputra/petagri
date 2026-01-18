import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProductService } from "@/services/product";
import { Product, ProductCategory } from "@/types/product";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Alert,
	Modal,
	Pressable,
	ScrollView,
	Switch,
	TextInput,
	View,
} from "react-native";

interface EditProductModalProps {
	visible: boolean;
	onClose: () => void;
	product: Product | null;
	onProductUpdated?: () => void;
}

interface EditProductFormData {
	name: string;
	description?: string;
	sku: string;
	category_id?: string;
	selling_price: string;
	base_price?: string;
	stock_quantity: string;
	min_stock_level: string;
	weight?: string;
	status: "active" | "inactive" | "draft" | "discontinued";
	is_featured: boolean;
}

export function EditProductModal({
	visible,
	onClose,
	product,
	onProductUpdated,
}: EditProductModalProps) {
	const [loading, setLoading] = useState(false);
	const [categories, setCategories] = useState<ProductCategory[]>([]);

	const {
		control,
		handleSubmit,
		setValue,
		reset,
		watch,
		formState: { errors },
	} = useForm<EditProductFormData>();

	const category_id = watch("category_id");

	useEffect(() => {
		if (visible && product) {
			loadCategories();
			// Reset form with product data
			reset({
				name: product.name,
				description: product.description || "",
				sku: product.sku,
				category_id: product.category_id || "",
				selling_price: product.selling_price.toString(),
				base_price: product.base_price.toString(),
				stock_quantity: product.stock_quantity.toString(),
				min_stock_level: product.min_stock_level.toString(),
				weight: product.weight?.toString() || "",
				status: product.status,
				is_featured: product.is_featured,
			});
		}
	}, [visible, product, reset]);

	const loadCategories = async () => {
		try {
			const response = await ProductService.getCategories();
			setCategories(response.data || []);
		} catch (error) {
			console.error("Error loading categories:", error);
		}
	};

	const onSubmit = async (formData: EditProductFormData) => {
		if (!product) return;

		setLoading(true);

		try {
			const updateData = {
				name: formData.name,
				description: formData.description,
				sku: formData.sku,
				category_id: formData.category_id || null,
				base_price: formData.base_price ? Number(formData.base_price) : 0,
				selling_price: Number(formData.selling_price),
				stock_quantity: Number(formData.stock_quantity),
				min_stock_level: Number(formData.min_stock_level),
				weight: formData.weight ? Number(formData.weight) : null,
				status: formData.status,
				is_featured: formData.is_featured,
			};

			console.log("Updating product with data:", updateData);

			await ProductService.updateProduct(product.id, updateData);

			Alert.alert("Sukses", "Produk berhasil diperbarui", [
				{
					text: "OK",
					onPress: () => {
						onProductUpdated?.();
						onClose();
					},
				},
			]);
		} catch (error) {
			console.error("Error updating product:", error);
			Alert.alert(
				"Error",
				`Gagal memperbarui produk: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		} finally {
			setLoading(false);
		}
	};

	if (!product) return null;

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<ThemedText type="title" className="text-xl font-bold text-white">
						Edit Produk
					</ThemedText>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				<ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
					<View className="mb-6">
						<ThemedText className="text-lg font-semibold text-white mb-4">
							Informasi Dasar
						</ThemedText>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Nama Produk *</ThemedText>
							<Controller
								control={control}
								name="name"
								rules={{ required: "Nama produk wajib diisi" }}
								render={({ field }) => (
									<TextInput
										{...field}
										placeholder="Nama produk"
										placeholderTextColor="#6B7280"
										className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									/>
								)}
							/>
							{errors.name && (
								<ThemedText className="text-red-400 text-sm mt-1">{errors.name.message}</ThemedText>
							)}
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Deskripsi</ThemedText>
							<Controller
								control={control}
								name="description"
								render={({ field }) => (
									<TextInput
										{...field}
										multiline
										numberOfLines={3}
										placeholder="Deskripsi produk"
										placeholderTextColor="#6B7280"
										className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									/>
								)}
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">SKU *</ThemedText>
							<Controller
								control={control}
								name="sku"
								rules={{ required: "SKU wajib diisi" }}
								render={({ field }) => (
									<TextInput
										{...field}
										placeholder="SKU produk"
										placeholderTextColor="#6B7280"
										className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									/>
								)}
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Kategori</ThemedText>
							<ScrollView horizontal>
								<View className="flex-row gap-2">
									<Pressable
										onPress={() => setValue("category_id", "")}
										className={`px-3 py-2 rounded-lg ${
											!category_id ? "bg-blue-600" : "bg-gray-700"
										}`}>
										<ThemedText className="text-white">Tanpa</ThemedText>
									</Pressable>

									{categories.map((c) => (
										<Pressable
											key={c.id}
											onPress={() => setValue("category_id", c.id)}
											className={`px-3 py-2 rounded-lg ${
												category_id === c.id ? "bg-blue-600" : "bg-gray-700"
											}`}>
											<ThemedText className="text-white">{c.name}</ThemedText>
										</Pressable>
									))}
								</View>
							</ScrollView>
						</View>
					</View>

					{/* Pricing Section */}
					<View className="mb-6">
						<ThemedText className="text-lg font-semibold text-white mb-4">Harga & Stok</ThemedText>

						<View className="flex-row gap-3 mb-4">
							<View className="flex-1">
								<ThemedText className="text-sm text-gray-300 mb-2">Harga Jual *</ThemedText>
								<Controller
									control={control}
									name="selling_price"
									rules={{
										required: "Harga jual wajib diisi",
										validate: (value) => {
											const num = Number(value);
											if (isNaN(num) || num <= 0) {
												return "Harga jual harus lebih dari 0";
											}
											return true;
										},
									}}
									render={({ field }) => (
										<TextInput
											{...field}
											placeholder="0"
											placeholderTextColor="#6B7280"
											keyboardType="numeric"
											className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
										/>
									)}
								/>
							</View>
							<View className="flex-1">
								<ThemedText className="text-sm text-gray-300 mb-2">Harga Dasar</ThemedText>
								<Controller
									control={control}
									name="base_price"
									render={({ field }) => (
										<TextInput
											{...field}
											placeholder="0"
											placeholderTextColor="#6B7280"
											keyboardType="numeric"
											className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
										/>
									)}
								/>
							</View>
						</View>

						<View className="flex-row gap-3 mb-4">
							<View className="flex-1">
								<ThemedText className="text-sm text-gray-300 mb-2">Stok</ThemedText>
								<Controller
									control={control}
									name="stock_quantity"
									render={({ field }) => (
										<TextInput
											{...field}
											placeholder="0"
											placeholderTextColor="#6B7280"
											keyboardType="numeric"
											className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
										/>
									)}
								/>
							</View>
							<View className="flex-1">
								<ThemedText className="text-sm text-gray-300 mb-2">Minimum Stok</ThemedText>
								<Controller
									control={control}
									name="min_stock_level"
									render={({ field }) => (
										<TextInput
											{...field}
											placeholder="5"
											placeholderTextColor="#6B7280"
											keyboardType="numeric"
											className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
										/>
									)}
								/>
							</View>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Berat (kg)</ThemedText>
							<Controller
								control={control}
								name="weight"
								render={({ field }) => (
									<TextInput
										{...field}
										placeholder="0.5"
										placeholderTextColor="#6B7280"
										keyboardType="decimal-pad"
										className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									/>
								)}
							/>
						</View>

						<View className="mb-4">
							<View className="flex-row items-center justify-between">
								<ThemedText className="text-sm text-gray-300">Produk Unggulan</ThemedText>
								<Controller
									control={control}
									name="is_featured"
									render={({ field }) => (
										<Switch
											value={field.value}
											onValueChange={field.onChange}
											trackColor={{ false: "#374151", true: "#3B82F6" }}
											thumbColor={field.value ? "#ffffff" : "#9CA3AF"}
										/>
									)}
								/>
							</View>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Status</ThemedText>
							<View className="flex-row gap-2">
								{(["active", "draft", "inactive", "discontinued"] as const).map((status) => (
									<Pressable
										key={status}
										onPress={() => setValue("status", status)}
										className={`px-3 py-2 rounded-lg ${
											watch("status") === status ? "bg-blue-600" : "bg-gray-700"
										}`}>
										<ThemedText className="text-white text-sm">
											{status === "active"
												? "Aktif"
												: status === "draft"
													? "Draft"
													: status === "inactive"
														? "Non-aktif"
														: "Dihentikan"}
										</ThemedText>
									</Pressable>
								))}
							</View>
						</View>
					</View>

					<View className="pb-10">
						<Pressable
							onPress={handleSubmit(onSubmit)}
							disabled={loading}
							className="bg-blue-600 py-4 rounded-xl items-center">
							{loading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<ThemedText className="text-white font-semibold">Perbarui Produk</ThemedText>
							)}
						</Pressable>
					</View>
				</ScrollView>
			</ThemedView>
		</Modal>
	);
}
