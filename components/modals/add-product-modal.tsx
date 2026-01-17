// ================================================
// Add Product Modal
// Description: Modal for adding new products to catalog
// ================================================

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProductService } from "@/services/product";
import { ProductCategory, ProductFormData } from "@/types/product";
import React, { useEffect, useState } from "react";
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

interface AddProductModalProps {
	visible: boolean;
	onClose: () => void;
	onProductAdded?: () => void;
}

export function AddProductModal({ visible, onClose, onProductAdded }: AddProductModalProps) {
	const [loading, setLoading] = useState(false);
	const [categories, setCategories] = useState<ProductCategory[]>([]);
	const [formData, setFormData] = useState<ProductFormData>({
		name: "",
		description: "",
		short_description: "",
		sku: "",
		category_id: "",
		tags: [],
		price: "",
		sale_price: "",
		cost_price: "",
		stock_quantity: "0",
		track_inventory: true,
		allow_backorders: false,
		low_stock_threshold: "5",
		weight: "",
		dimensions: {
			length: "",
			width: "",
			height: "",
			unit: "cm",
		},
		status: "draft",
		visibility: "public",
		featured: false,
		meta_title: "",
		meta_description: "",
		meta_keywords: "",
	});

	useEffect(() => {
		if (visible) {
			loadCategories();
		}
	}, [visible]);

	const loadCategories = async () => {
		try {
			const response = await ProductService.getCategories();
			setCategories(response.data);
		} catch (error) {
			console.error("Error loading categories:", error);
		}
	};

	const generateSKU = () => {
		const prefix = formData.name
			.slice(0, 3)
			.toUpperCase()
			.replace(/[^A-Z]/g, "");
		const random = Math.random().toString(36).substr(2, 6).toUpperCase();
		const sku = `${prefix}-${random}`;
		setFormData({ ...formData, sku });
	};

	const handleSubmit = async () => {
		if (!formData.name.trim()) {
			Alert.alert("Error", "Nama produk harus diisi");
			return;
		}

		if (!formData.sku.trim()) {
			Alert.alert("Error", "SKU harus diisi");
			return;
		}

		if (!formData.price.trim() || parseFloat(formData.price) <= 0) {
			Alert.alert("Error", "Harga harus diisi dengan nilai yang valid");
			return;
		}

		setLoading(true);

		try {
			await ProductService.createProduct(formData);
			Alert.alert("Sukses", "Produk berhasil ditambahkan", [
				{
					text: "OK",
					onPress: () => {
						onProductAdded?.();
						onClose();
						resetForm();
					},
				},
			]);
		} catch (error) {
			console.error("Error creating product:", error);
			Alert.alert("Error", "Gagal menambahkan produk. Silakan coba lagi.");
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			name: "",
			description: "",
			short_description: "",
			sku: "",
			category_id: "",
			tags: [],
			price: "",
			sale_price: "",
			cost_price: "",
			stock_quantity: "0",
			track_inventory: true,
			allow_backorders: false,
			low_stock_threshold: "5",
			weight: "",
			dimensions: {
				length: "",
				width: "",
				height: "",
				unit: "cm",
			},
			status: "draft",
			visibility: "public",
			featured: false,
			meta_title: "",
			meta_description: "",
			meta_keywords: "",
		});
	};

	const addTag = (tag: string) => {
		if (tag.trim() && !formData.tags.includes(tag.trim())) {
			setFormData({
				...formData,
				tags: [...formData.tags, tag.trim()],
			});
		}
	};

	const removeTag = (tagToRemove: string) => {
		setFormData({
			...formData,
			tags: formData.tags.filter((tag) => tag !== tagToRemove),
		});
	};

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				{/* Header */}
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<ThemedText type="title" className="text-xl font-bold text-white">
						Tambah Produk Baru
					</ThemedText>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				<ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
					{/* Basic Information */}
					<View className="mb-6">
						<ThemedText type="subtitle" className="text-lg font-semibold text-white mb-4">
							Informasi Dasar
						</ThemedText>

						{/* Product Name */}
						<View className="mb-4">
							<ThemedText className="text-sm font-medium text-gray-300 mb-2">
								Nama Produk *
							</ThemedText>
							<TextInput
								value={formData.name}
								onChangeText={(text) => setFormData({ ...formData, name: text })}
								placeholder="Masukkan nama produk"
								placeholderTextColor="#6B7280"
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base"
							/>
						</View>

						{/* Short Description */}
						<View className="mb-4">
							<ThemedText className="text-sm font-medium text-gray-300 mb-2">
								Deskripsi Singkat
							</ThemedText>
							<TextInput
								value={formData.short_description}
								onChangeText={(text) => setFormData({ ...formData, short_description: text })}
								placeholder="Deskripsi singkat produk"
								placeholderTextColor="#6B7280"
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base"
								multiline
								numberOfLines={2}
							/>
						</View>

						{/* Description */}
						<View className="mb-4">
							<ThemedText className="text-sm font-medium text-gray-300 mb-2">
								Deskripsi Lengkap
							</ThemedText>
							<TextInput
								value={formData.description}
								onChangeText={(text) => setFormData({ ...formData, description: text })}
								placeholder="Deskripsi lengkap produk"
								placeholderTextColor="#6B7280"
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base"
								multiline
								numberOfLines={4}
							/>
						</View>

						{/* SKU */}
						<View className="mb-4">
							<ThemedText className="text-sm font-medium text-gray-300 mb-2">SKU *</ThemedText>
							<View className="flex-row gap-3">
								<TextInput
									value={formData.sku}
									onChangeText={(text) => setFormData({ ...formData, sku: text })}
									placeholder="SKU produk"
									placeholderTextColor="#6B7280"
									className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base"
								/>
								<Pressable
									onPress={generateSKU}
									className="bg-blue-600 px-4 py-3 rounded-xl items-center justify-center">
									<ThemedText className="text-white text-sm font-medium">Generate</ThemedText>
								</Pressable>
							</View>
						</View>

						{/* Category */}
						<View className="mb-4">
							<ThemedText className="text-sm font-medium text-gray-300 mb-2">Kategori</ThemedText>
							<View className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
								{categories.length > 0 ? (
									<ScrollView horizontal showsHorizontalScrollIndicator={false}>
										<View className="flex-row gap-2">
											<Pressable
												onPress={() => setFormData({ ...formData, category_id: "" })}
												className={`px-3 py-2 rounded-lg border ${
													!formData.category_id ? "bg-blue-600 border-blue-600" : "border-gray-600"
												}`}>
												<ThemedText
													className={`text-sm ${
														!formData.category_id ? "text-white" : "text-gray-300"
													}`}>
													Tanpa Kategori
												</ThemedText>
											</Pressable>
											{categories.map((category) => (
												<Pressable
													key={category.id}
													onPress={() => setFormData({ ...formData, category_id: category.id })}
													className={`px-3 py-2 rounded-lg border ${
														formData.category_id === category.id
															? "bg-blue-600 border-blue-600"
															: "border-gray-600"
													}`}>
													<ThemedText
														className={`text-sm ${
															formData.category_id === category.id ? "text-white" : "text-gray-300"
														}`}>
														{category.name}
													</ThemedText>
												</Pressable>
											))}
										</View>
									</ScrollView>
								) : (
									<ThemedText className="text-gray-400 text-sm">Tidak ada kategori</ThemedText>
								)}
							</View>
						</View>
					</View>

					{/* Pricing */}
					<View className="mb-6">
						<ThemedText type="subtitle" className="text-lg font-semibold text-white mb-4">
							Harga
						</ThemedText>

						<View className="flex-row gap-3 mb-4">
							{/* Regular Price */}
							<View className="flex-1">
								<ThemedText className="text-sm font-medium text-gray-300 mb-2">
									Harga Reguler *
								</ThemedText>
								<TextInput
									value={formData.price}
									onChangeText={(text) => setFormData({ ...formData, price: text })}
									placeholder="0"
									placeholderTextColor="#6B7280"
									keyboardType="numeric"
									className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base"
								/>
							</View>

							{/* Sale Price */}
							<View className="flex-1">
								<ThemedText className="text-sm font-medium text-gray-300 mb-2">
									Harga Diskon
								</ThemedText>
								<TextInput
									value={formData.sale_price}
									onChangeText={(text) => setFormData({ ...formData, sale_price: text })}
									placeholder="0"
									placeholderTextColor="#6B7280"
									keyboardType="numeric"
									className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base"
								/>
							</View>
						</View>

						{/* Cost Price */}
						<View className="mb-4">
							<ThemedText className="text-sm font-medium text-gray-300 mb-2">
								Harga Modal
							</ThemedText>
							<TextInput
								value={formData.cost_price}
								onChangeText={(text) => setFormData({ ...formData, cost_price: text })}
								placeholder="Harga modal produk"
								placeholderTextColor="#6B7280"
								keyboardType="numeric"
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base"
							/>
						</View>
					</View>

					{/* Inventory */}
					<View className="mb-6">
						<ThemedText type="subtitle" className="text-lg font-semibold text-white mb-4">
							Inventaris
						</ThemedText>

						{/* Track Inventory */}
						<View className="flex-row items-center justify-between bg-gray-800 px-4 py-3 rounded-xl mb-4">
							<ThemedText className="text-white font-medium">Lacak Inventaris</ThemedText>
							<Switch
								value={formData.track_inventory}
								onValueChange={(value) => setFormData({ ...formData, track_inventory: value })}
								trackColor={{ false: "#374151", true: "#3B82F6" }}
								thumbColor="#FFFFFF"
							/>
						</View>

						{formData.track_inventory && (
							<>
								<View className="flex-row gap-3 mb-4">
									{/* Stock Quantity */}
									<View className="flex-1">
										<ThemedText className="text-sm font-medium text-gray-300 mb-2">
											Stok Awal
										</ThemedText>
										<TextInput
											value={formData.stock_quantity}
											onChangeText={(text) => setFormData({ ...formData, stock_quantity: text })}
											placeholder="0"
											placeholderTextColor="#6B7280"
											keyboardType="numeric"
											className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base"
										/>
									</View>

									{/* Low Stock Threshold */}
									<View className="flex-1">
										<ThemedText className="text-sm font-medium text-gray-300 mb-2">
											Batas Stok Minim
										</ThemedText>
										<TextInput
											value={formData.low_stock_threshold}
											onChangeText={(text) =>
												setFormData({ ...formData, low_stock_threshold: text })
											}
											placeholder="5"
											placeholderTextColor="#6B7280"
											keyboardType="numeric"
											className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base"
										/>
									</View>
								</View>

								{/* Allow Backorders */}
								<View className="flex-row items-center justify-between bg-gray-800 px-4 py-3 rounded-xl mb-4">
									<View className="flex-1">
										<ThemedText className="text-white font-medium">Izinkan Backorder</ThemedText>
										<ThemedText className="text-sm text-gray-400">Jual meski stok habis</ThemedText>
									</View>
									<Switch
										value={formData.allow_backorders}
										onValueChange={(value) => setFormData({ ...formData, allow_backorders: value })}
										trackColor={{ false: "#374151", true: "#3B82F6" }}
										thumbColor="#FFFFFF"
									/>
								</View>
							</>
						)}
					</View>

					{/* Physical Attributes */}
					<View className="mb-6">
						<ThemedText type="subtitle" className="text-lg font-semibold text-white mb-4">
							Atribut Fisik
						</ThemedText>

						{/* Weight */}
						<View className="mb-4">
							<ThemedText className="text-sm font-medium text-gray-300 mb-2">
								Berat (gram)
							</ThemedText>
							<TextInput
								value={formData.weight}
								onChangeText={(text) => setFormData({ ...formData, weight: text })}
								placeholder="Berat produk dalam gram"
								placeholderTextColor="#6B7280"
								keyboardType="numeric"
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base"
							/>
						</View>

						{/* Dimensions */}
						<View className="mb-4">
							<ThemedText className="text-sm font-medium text-gray-300 mb-2">Dimensi</ThemedText>
							<View className="flex-row gap-3">
								<View className="flex-1">
									<TextInput
										value={formData.dimensions?.length}
										onChangeText={(text) =>
											setFormData({
												...formData,
												dimensions: { ...formData.dimensions!, length: text },
											})
										}
										placeholder="Panjang"
										placeholderTextColor="#6B7280"
										keyboardType="numeric"
										className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white text-sm"
									/>
								</View>
								<View className="flex-1">
									<TextInput
										value={formData.dimensions?.width}
										onChangeText={(text) =>
											setFormData({
												...formData,
												dimensions: { ...formData.dimensions!, width: text },
											})
										}
										placeholder="Lebar"
										placeholderTextColor="#6B7280"
										keyboardType="numeric"
										className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white text-sm"
									/>
								</View>
								<View className="flex-1">
									<TextInput
										value={formData.dimensions?.height}
										onChangeText={(text) =>
											setFormData({
												...formData,
												dimensions: { ...formData.dimensions!, height: text },
											})
										}
										placeholder="Tinggi"
										placeholderTextColor="#6B7280"
										keyboardType="numeric"
										className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white text-sm"
									/>
								</View>
								<View className="w-16">
									<Pressable
										onPress={() =>
											setFormData({
												...formData,
												dimensions: {
													...formData.dimensions!,
													unit: formData.dimensions?.unit === "cm" ? "inch" : "cm",
												},
											})
										}
										className="bg-gray-700 border border-gray-600 rounded-xl px-3 py-3 items-center justify-center h-full">
										<ThemedText className="text-white text-sm font-medium">
											{formData.dimensions?.unit || "cm"}
										</ThemedText>
									</Pressable>
								</View>
							</View>
						</View>
					</View>

					{/* Publication Settings */}
					<View className="mb-6">
						<ThemedText type="subtitle" className="text-lg font-semibold text-white mb-4">
							Pengaturan Publikasi
						</ThemedText>

						{/* Status */}
						<View className="mb-4">
							<ThemedText className="text-sm font-medium text-gray-300 mb-2">Status</ThemedText>
							<View className="flex-row gap-2">
								{(["draft", "published", "archived"] as const).map((status) => (
									<Pressable
										key={status}
										onPress={() => setFormData({ ...formData, status })}
										className={`px-4 py-3 rounded-lg border ${
											formData.status === status ? "bg-blue-600 border-blue-600" : "border-gray-600"
										}`}>
										<ThemedText
											className={`text-sm capitalize ${
												formData.status === status ? "text-white" : "text-gray-300"
											}`}>
											{status === "draft"
												? "Draft"
												: status === "published"
													? "Terpublikasi"
													: "Diarsipkan"}
										</ThemedText>
									</Pressable>
								))}
							</View>
						</View>

						{/* Visibility */}
						<View className="mb-4">
							<ThemedText className="text-sm font-medium text-gray-300 mb-2">
								Visibilitas
							</ThemedText>
							<View className="flex-row gap-2">
								{(["public", "private", "hidden"] as const).map((visibility) => (
									<Pressable
										key={visibility}
										onPress={() => setFormData({ ...formData, visibility })}
										className={`px-4 py-3 rounded-lg border ${
											formData.visibility === visibility
												? "bg-blue-600 border-blue-600"
												: "border-gray-600"
										}`}>
										<ThemedText
											className={`text-sm capitalize ${
												formData.visibility === visibility ? "text-white" : "text-gray-300"
											}`}>
											{visibility === "public"
												? "Publik"
												: visibility === "private"
													? "Privat"
													: "Tersembunyi"}
										</ThemedText>
									</Pressable>
								))}
							</View>
						</View>

						{/* Featured */}
						<View className="flex-row items-center justify-between bg-gray-800 px-4 py-3 rounded-xl mb-4">
							<View className="flex-1">
								<ThemedText className="text-white font-medium">Produk Unggulan</ThemedText>
								<ThemedText className="text-sm text-gray-400">
									Tampilkan di halaman utama
								</ThemedText>
							</View>
							<Switch
								value={formData.featured}
								onValueChange={(value) => setFormData({ ...formData, featured: value })}
								trackColor={{ false: "#374151", true: "#3B82F6" }}
								thumbColor="#FFFFFF"
							/>
						</View>
					</View>

					{/* Submit Button */}
					<View className="pb-8">
						<Pressable
							onPress={handleSubmit}
							disabled={loading}
							className={`bg-blue-600 py-4 rounded-xl items-center justify-center ${
								loading ? "opacity-70" : ""
							}`}>
							{loading ? (
								<ActivityIndicator color="#FFFFFF" />
							) : (
								<ThemedText className="text-white text-base font-semibold">
									Tambah Produk
								</ThemedText>
							)}
						</Pressable>
					</View>
				</ScrollView>
			</ThemedView>
		</Modal>
	);
}
