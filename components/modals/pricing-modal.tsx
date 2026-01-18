// ================================================
// Pricing Modal
// Description: Modal for managing product pricing and promotions
// ================================================

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProductService } from "@/services/product";
import { Product, ProductCategory } from "@/types/product";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Alert,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
	Switch,
	TextInput,
	View,
} from "react-native";

interface PricingModalProps {
	visible: boolean;
	onClose: () => void;
}

interface PricingUpdate {
	productId: string;
	price: string;
	salePrice: string;
	costPrice: string;
	hasChanges: boolean;
}

interface PricingFilterForm {
	searchQuery: string;
	selectedCategory: string;
	bulkDiscount: string;
}

export function PricingModal({ visible, onClose }: PricingModalProps) {
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<ProductCategory[]>([]);
	const [pricingUpdates, setPricingUpdates] = useState<Map<string, PricingUpdate>>(new Map());
	const [bulkUpdateMode, setBulkUpdateMode] = useState(false);
	const [bulkDiscountType, setBulkDiscountType] = useState<"percentage" | "fixed">("percentage");
	const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

	// Form for search and bulk operations
	const { control, watch, setValue } = useForm<PricingFilterForm>({
		defaultValues: {
			searchQuery: "",
			selectedCategory: "",
			bulkDiscount: "",
		},
		mode: "onChange",
	});

	// Watch form values
	const searchQuery = watch("searchQuery");
	const selectedCategory = watch("selectedCategory");
	const bulkDiscount = watch("bulkDiscount");

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const [productsResponse, categoriesResponse] = await Promise.all([
				ProductService.getProducts({
					search: searchQuery,
					category_id: selectedCategory,
					status: ["published", "draft"],
					sort_by: "name",
					sort_direction: "asc",
					per_page: 100,
				}),
				ProductService.getCategories(),
			]);
			setProducts(productsResponse.data);
			setCategories(categoriesResponse.data);
		} catch (error) {
			console.error("Error loading data:", error);
			Alert.alert("Error", "Gagal memuat data. Silakan coba lagi.");
		} finally {
			setLoading(false);
		}
	}, [searchQuery, selectedCategory]);

	useEffect(() => {
		if (visible) {
			loadData();
		}
	}, [visible, loadData]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadData();
		setRefreshing(false);
	};

	const handlePriceChange = (
		productId: string,
		field: "price" | "salePrice" | "costPrice",
		value: string,
	) => {
		const updates = new Map(pricingUpdates);
		const currentUpdate = updates.get(productId) || {
			productId,
			price: "",
			salePrice: "",
			costPrice: "",
			hasChanges: false,
		};

		currentUpdate[field] = value;
		currentUpdate.hasChanges = true;

		updates.set(productId, currentUpdate);
		setPricingUpdates(updates);
	};

	const handleSelectProduct = (productId: string) => {
		const newSelected = new Set(selectedProducts);
		if (newSelected.has(productId)) {
			newSelected.delete(productId);
		} else {
			newSelected.add(productId);
		}
		setSelectedProducts(newSelected);
	};

	const handleSelectAll = () => {
		const filteredProducts = filterProducts();
		if (selectedProducts.size === filteredProducts.length) {
			setSelectedProducts(new Set());
		} else {
			setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
		}
	};

	const applyBulkDiscount = () => {
		if (!bulkDiscount || selectedProducts.size === 0) return;

		const discount = parseFloat(bulkDiscount);
		if (isNaN(discount)) {
			Alert.alert("Error", "Nilai diskon tidak valid");
			return;
		}

		const updates = new Map(pricingUpdates);

		selectedProducts.forEach((productId) => {
			const product = products.find((p) => p.id === productId);
			if (!product) return;

			const currentUpdate = updates.get(productId) || {
				productId,
				price: product.price.toString(),
				salePrice: product.sale_price?.toString() || "",
				costPrice: product.cost_price?.toString() || "",
				hasChanges: false,
			};

			const originalPrice = parseFloat(currentUpdate.price || product.price.toString());
			let newSalePrice: number;

			if (bulkDiscountType === "percentage") {
				newSalePrice = originalPrice * (1 - discount / 100);
			} else {
				newSalePrice = originalPrice - discount;
			}

			// Ensure sale price is not negative or higher than original price
			newSalePrice = Math.max(0, Math.min(newSalePrice, originalPrice));

			currentUpdate.salePrice = newSalePrice.toString();
			currentUpdate.hasChanges = true;

			updates.set(productId, currentUpdate);
		});

		setPricingUpdates(updates);
		Alert.alert("Sukses", `Diskon diterapkan ke ${selectedProducts.size} produk`);
	};

	const clearBulkDiscount = () => {
		const updates = new Map(pricingUpdates);

		selectedProducts.forEach((productId) => {
			const product = products.find((p) => p.id === productId);
			if (!product) return;

			const currentUpdate = updates.get(productId) || {
				productId,
				price: product.price.toString(),
				salePrice: product.sale_price?.toString() || "",
				costPrice: product.cost_price?.toString() || "",
				hasChanges: false,
			};

			currentUpdate.salePrice = "";
			currentUpdate.hasChanges = true;

			updates.set(productId, currentUpdate);
		});

		setPricingUpdates(updates);
		Alert.alert("Sukses", `Diskon dihapus dari ${selectedProducts.size} produk`);
	};

	const saveChanges = async () => {
		const changedUpdates = Array.from(pricingUpdates.values()).filter(
			(update) => update.hasChanges,
		);

		if (changedUpdates.length === 0) {
			Alert.alert("Info", "Tidak ada perubahan untuk disimpan");
			return;
		}

		Alert.alert(
			"Konfirmasi",
			`Apakah Anda yakin ingin menyimpan perubahan pada ${changedUpdates.length} produk?`,
			[
				{ text: "Batal", style: "cancel" },
				{
					text: "Simpan",
					onPress: async () => {
						setLoading(true);
						try {
							const promises = changedUpdates.map(async (update) => {
								const updateData: any = {};

								if (update.price) updateData.price = update.price;
								if (update.salePrice) updateData.sale_price = update.salePrice;
								if (update.costPrice) updateData.cost_price = update.costPrice;

								return await ProductService.updateProduct(update.productId, updateData);
							});

							await Promise.all(promises);
							setPricingUpdates(new Map());
							setSelectedProducts(new Set());
							await loadData();

							Alert.alert("Sukses", `${changedUpdates.length} produk berhasil diperbarui`);
						} catch (error) {
							console.error("Error saving changes:", error);
							Alert.alert("Error", "Gagal menyimpan perubahan. Silakan coba lagi.");
						} finally {
							setLoading(false);
						}
					},
				},
			],
		);
	};

	const filterProducts = () => {
		return products.filter((product) => {
			const matchesSearch =
				!searchQuery ||
				product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.sku.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesCategory = !selectedCategory || product.category_id === selectedCategory;

			return matchesSearch && matchesCategory;
		});
	};

	const formatPrice = (price: number | string) => {
		const numPrice = typeof price === "string" ? parseFloat(price) : price;
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
		}).format(numPrice || 0);
	};

	const calculateProfitMargin = (price: string, costPrice: string) => {
		const priceNum = parseFloat(price) || 0;
		const costNum = parseFloat(costPrice) || 0;

		if (costNum === 0) return null;
		return ((priceNum - costNum) / priceNum) * 100;
	};

	const changedCount = Array.from(pricingUpdates.values()).filter(
		(update) => update.hasChanges,
	).length;

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				{/* Header */}
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<ThemedText type="title" className="text-xl font-bold text-white">
						Atur Harga
					</ThemedText>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				{/* Search and Filters */}
				<View className="px-6 py-4 border-b border-gray-800">
					{/* Search Bar */}
					<View className="flex-row items-center bg-gray-800 rounded-xl px-4 py-3 mb-3">
						<IconSymbol name="house.fill" size={20} color="#6B7280" />
						<Controller
							control={control}
							render={({
								field: { onChange, value },
							}: {
								field: { onChange: (value: string) => void; value: string };
							}) => (
								<TextInput
									value={value}
									onChangeText={(text: string) => {
										onChange(text);
										// Debounce search in real app
										setTimeout(loadData, 500);
									}}
									placeholder="Cari produk..."
									placeholderTextColor="#6B7280"
									className="flex-1 text-white ml-3"
								/>
							)}
							name="searchQuery"
						/>
					</View>

					{/* Category Filter */}
					<ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
						<View className="flex-row gap-2">
							<Pressable
								onPress={() => {
									setValue("selectedCategory", "");
									loadData();
								}}
								className={`px-3 py-2 rounded-lg border ${
									!selectedCategory ? "bg-blue-600 border-blue-600" : "border-gray-600"
								}`}>
								<ThemedText
									className={`text-sm ${!selectedCategory ? "text-white" : "text-gray-300"}`}>
									Semua
								</ThemedText>
							</Pressable>
							{categories.map((category) => (
								<Pressable
									key={category.id}
									onPress={() => {
										setValue("selectedCategory", category.id);
										loadData();
									}}
									className={`px-3 py-2 rounded-lg border ${
										selectedCategory === category.id
											? "bg-blue-600 border-blue-600"
											: "border-gray-600"
									}`}>
									<ThemedText
										className={`text-sm ${
											selectedCategory === category.id ? "text-white" : "text-gray-300"
										}`}>
										{category.name}
									</ThemedText>
								</Pressable>
							))}
						</View>
					</ScrollView>

					{/* Bulk Update Toggle */}
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-3">
							<ThemedText className="text-gray-300 font-medium">Mode Bulk Update</ThemedText>
							<Switch
								value={bulkUpdateMode}
								onValueChange={setBulkUpdateMode}
								trackColor={{ false: "#374151", true: "#3B82F6" }}
								thumbColor="#FFFFFF"
							/>
						</View>

						{changedCount > 0 && (
							<Pressable onPress={saveChanges} className="bg-green-600 px-4 py-2 rounded-lg">
								<ThemedText className="text-white font-medium">Simpan ({changedCount})</ThemedText>
							</Pressable>
						)}
					</View>
				</View>

				{/* Bulk Discount Section */}
				{bulkUpdateMode && (
					<View className="px-6 py-4 bg-blue-900/10 border-b border-blue-800">
						<ThemedText className="text-blue-400 font-semibold mb-3">Diskon Massal</ThemedText>

						<View className="flex-row items-center gap-3 mb-3">
							<View className="flex-1 flex-row gap-2">
								<Controller
									control={control}
									render={({
										field: { onChange, value },
									}: {
										field: { onChange: (value: string) => void; value: string };
									}) => (
										<TextInput
											value={value}
											onChangeText={onChange}
											placeholder="Nilai diskon"
											placeholderTextColor="#6B7280"
											keyboardType="numeric"
											className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
										/>
									)}
									name="bulkDiscount"
								/>

								<Pressable
									onPress={() =>
										setBulkDiscountType(bulkDiscountType === "percentage" ? "fixed" : "percentage")
									}
									className="bg-gray-700 px-3 py-2 rounded-lg items-center justify-center">
									<ThemedText className="text-white text-sm font-medium">
										{bulkDiscountType === "percentage" ? "%" : "Rp"}
									</ThemedText>
								</Pressable>
							</View>

							<Pressable
								onPress={applyBulkDiscount}
								disabled={!bulkDiscount || selectedProducts.size === 0}
								className={`px-4 py-2 rounded-lg ${
									bulkDiscount && selectedProducts.size > 0 ? "bg-green-600" : "bg-gray-700"
								}`}>
								<ThemedText className="text-white text-sm font-medium">Terapkan</ThemedText>
							</Pressable>

							<Pressable
								onPress={clearBulkDiscount}
								disabled={selectedProducts.size === 0}
								className={`px-4 py-2 rounded-lg ${
									selectedProducts.size > 0 ? "bg-red-600" : "bg-gray-700"
								}`}>
								<ThemedText className="text-white text-sm font-medium">Hapus</ThemedText>
							</Pressable>
						</View>

						{selectedProducts.size > 0 && (
							<ThemedText className="text-sm text-blue-300">
								{selectedProducts.size} produk dipilih
							</ThemedText>
						)}
					</View>
				)}

				{/* Product List */}
				{loading && products.length === 0 ? (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size="large" color="#3B82F6" />
						<ThemedText className="text-gray-400 mt-3">Memuat produk...</ThemedText>
					</View>
				) : (
					<ScrollView
						className="flex-1"
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
						showsVerticalScrollIndicator={false}>
						{/* Select All */}
						{bulkUpdateMode && filterProducts().length > 0 && (
							<View className="flex-row items-center px-6 py-3 border-b border-gray-800">
								<Pressable onPress={handleSelectAll} className="flex-row items-center gap-3">
									<View
										className={`w-5 h-5 rounded border-2 items-center justify-center ${
											selectedProducts.size === filterProducts().length
												? "bg-blue-600 border-blue-600"
												: selectedProducts.size > 0
													? "bg-blue-600/50 border-blue-600"
													: "border-gray-600"
										}`}>
										{selectedProducts.size > 0 && (
											<IconSymbol name="checkmark" size={12} color="#FFFFFF" />
										)}
									</View>
									<ThemedText className="text-gray-300 font-medium">
										{selectedProducts.size === filterProducts().length
											? "Batalkan pilih semua"
											: "Pilih semua"}
									</ThemedText>
								</Pressable>
							</View>
						)}

						{/* Product Items */}
						{filterProducts().map((product) => (
							<ProductPricingItem
								key={product.id}
								product={product}
								update={pricingUpdates.get(product.id)}
								selected={selectedProducts.has(product.id)}
								bulkMode={bulkUpdateMode}
								onSelect={() => handleSelectProduct(product.id)}
								onPriceChange={(field, value) => handlePriceChange(product.id, field, value)}
								formatPrice={formatPrice}
								calculateProfitMargin={calculateProfitMargin}
							/>
						))}

						{filterProducts().length === 0 && !loading && (
							<View className="flex-1 items-center justify-center py-20">
								<IconSymbol name="dollarsign.circle" size={64} color="#6B7280" />
								<ThemedText className="text-gray-400 text-lg font-medium mt-4">
									Tidak ada produk
								</ThemedText>
								<ThemedText className="text-gray-500 text-center mt-2">
									{searchQuery || selectedCategory
										? "Tidak ada produk yang sesuai dengan filter"
										: "Belum ada produk untuk diatur harganya"}
								</ThemedText>
							</View>
						)}

						<View className="h-6" />
					</ScrollView>
				)}
			</ThemedView>
		</Modal>
	);
}

interface ProductPricingItemProps {
	product: Product;
	update?: PricingUpdate;
	selected: boolean;
	bulkMode: boolean;
	onSelect: () => void;
	onPriceChange: (field: "price" | "salePrice" | "costPrice", value: string) => void;
	formatPrice: (price: number | string) => string;
	calculateProfitMargin: (price: string, costPrice: string) => number | null;
}

function ProductPricingItem({
	product,
	update,
	selected,
	bulkMode,
	onSelect,
	onPriceChange,
	formatPrice,
	calculateProfitMargin,
}: ProductPricingItemProps) {
	const currentPrice = update?.price || product.price.toString();
	const currentSalePrice = update?.salePrice || product.sale_price?.toString() || "";
	const currentCostPrice = update?.costPrice || product.cost_price?.toString() || "";

	const profitMargin = calculateProfitMargin(currentPrice, currentCostPrice);
	const isOnSale =
		parseFloat(currentSalePrice) > 0 && parseFloat(currentSalePrice) < parseFloat(currentPrice);

	return (
		<View className="px-6 py-4 border-b border-gray-800">
			<View className="flex-row items-start gap-3">
				{/* Selection Checkbox */}
				{bulkMode && (
					<Pressable onPress={onSelect} className="mt-1">
						<View
							className={`w-5 h-5 rounded border-2 items-center justify-center ${
								selected ? "bg-blue-600 border-blue-600" : "border-gray-600"
							}`}>
							{selected && <IconSymbol name="checkmark" size={12} color="#FFFFFF" />}
						</View>
					</Pressable>
				)}

				{/* Product Info */}
				<View className="flex-1">
					<View className="flex-row items-center justify-between mb-2">
						<View className="flex-1">
							<ThemedText className="text-white font-semibold" numberOfLines={1}>
								{product.name}
							</ThemedText>
							<ThemedText className="text-gray-400 text-sm">SKU: {product.sku}</ThemedText>
						</View>

						{update?.hasChanges && (
							<View className="bg-orange-600/20 px-2 py-1 rounded">
								<ThemedText className="text-orange-400 text-xs">Diubah</ThemedText>
							</View>
						)}
					</View>

					{/* Pricing Fields */}
					<View className="gap-3">
						{/* Regular Price */}
						<View className="flex-row items-center gap-3">
							<ThemedText className="text-gray-300 w-20">Harga:</ThemedText>
							<View className="flex-1">
								<TextInput
									value={currentPrice}
									onChangeText={(value) => onPriceChange("price", value)}
									placeholder="Harga reguler"
									placeholderTextColor="#6B7280"
									keyboardType="numeric"
									className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
								/>
							</View>
							<ThemedText className="text-sm text-gray-400 w-20 text-right">
								{formatPrice(currentPrice)}
							</ThemedText>
						</View>

						{/* Sale Price */}
						<View className="flex-row items-center gap-3">
							<ThemedText className="text-gray-300 w-20">Diskon:</ThemedText>
							<View className="flex-1">
								<TextInput
									value={currentSalePrice}
									onChangeText={(value) => onPriceChange("salePrice", value)}
									placeholder="Harga diskon (opsional)"
									placeholderTextColor="#6B7280"
									keyboardType="numeric"
									className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
								/>
							</View>
							<ThemedText className="text-sm text-gray-400 w-20 text-right">
								{currentSalePrice ? formatPrice(currentSalePrice) : "-"}
							</ThemedText>
						</View>

						{/* Cost Price */}
						<View className="flex-row items-center gap-3">
							<ThemedText className="text-gray-300 w-20">Modal:</ThemedText>
							<View className="flex-1">
								<TextInput
									value={currentCostPrice}
									onChangeText={(value) => onPriceChange("costPrice", value)}
									placeholder="Harga modal (opsional)"
									placeholderTextColor="#6B7280"
									keyboardType="numeric"
									className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
								/>
							</View>
							<ThemedText className="text-sm text-gray-400 w-20 text-right">
								{currentCostPrice ? formatPrice(currentCostPrice) : "-"}
							</ThemedText>
						</View>

						{/* Profit Margin & Sale Indicator */}
						<View className="flex-row items-center justify-between mt-2">
							<View className="flex-row items-center gap-3">
								{profitMargin !== null && (
									<ThemedText
										className={`text-sm font-medium ${
											profitMargin > 30
												? "text-green-400"
												: profitMargin > 10
													? "text-yellow-400"
													: "text-red-400"
										}`}>
										Margin: {profitMargin.toFixed(1)}%
									</ThemedText>
								)}

								{isOnSale && (
									<View className="bg-red-600/20 px-2 py-1 rounded">
										<ThemedText className="text-red-400 text-xs">Sale</ThemedText>
									</View>
								)}
							</View>

							<ThemedText className="text-xs text-gray-500">
								Kategori: {product.category?.name || "Tanpa kategori"}
							</ThemedText>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
}
