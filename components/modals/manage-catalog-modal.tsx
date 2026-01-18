// ================================================
// Manage Catalog Modal
// Description: Modal for managing product catalog with search and filters
// ================================================

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProductService } from "@/services/product";
import { Product, ProductCategory, ProductFilters } from "@/types/product";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
	TextInput,
	View,
} from "react-native";

interface ManageCatalogModalProps {
	visible: boolean;
	onClose: () => void;
}

export function ManageCatalogModal({ visible, onClose }: ManageCatalogModalProps) {
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<ProductCategory[]>([]);
	const [filters, setFilters] = useState<ProductFilters>({
		search: "",
		category_id: "",
		status: [],
		sort_by: "created_at",
		sort_direction: "desc",
		page: 1,
		per_page: 20,
	});
	const [showFilters, setShowFilters] = useState(false);
	const [totalPages, setTotalPages] = useState(1);
	const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const [productsResponse, categoriesResponse] = await Promise.all([
				ProductService.getProducts(filters),
				ProductService.getCategories(),
			]);

			setProducts(productsResponse.data);
			setTotalPages(productsResponse.pagination.total_pages);
			setCategories(categoriesResponse.data);
		} catch (error) {
			console.error("Error loading data:", error);
			Alert.alert("Error", "Gagal memuat data. Silakan coba lagi.");
		} finally {
			setLoading(false);
		}
	}, [filters]);

	useEffect(() => {
		if (visible) {
			loadData();
		}
	}, [visible, filters, loadData]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadData();
		setRefreshing(false);
	};

	const handleSearch = (text: string) => {
		setFilters({ ...filters, search: text, page: 1 });
	};

	const handleStatusFilter = (status: string) => {
		const currentStatus = filters.status || [];
		let newStatus: string[];

		if (currentStatus.includes(status)) {
			newStatus = currentStatus.filter((s) => s !== status);
		} else {
			newStatus = [...currentStatus, status];
		}

		setFilters({ ...filters, status: newStatus, page: 1 });
	};

	const handleSort = (sortBy: "name" | "price" | "created_at" | "stock_quantity") => {
		const direction =
			filters.sort_by === sortBy && filters.sort_direction === "asc" ? "desc" : "asc";
		setFilters({ ...filters, sort_by: sortBy, sort_direction: direction, page: 1 });
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
		if (selectedProducts.size === products.length) {
			setSelectedProducts(new Set());
		} else {
			setSelectedProducts(new Set(products.map((p) => p.id)));
		}
	};

	const handleBulkAction = async (action: "publish" | "unpublish" | "archive" | "delete") => {
		if (selectedProducts.size === 0) return;

		const actionText = {
			publish: "mempublikasikan",
			unpublish: "membuat draft",
			archive: "mengarsipkan",
			delete: "menghapus",
		}[action];

		Alert.alert(
			"Konfirmasi",
			`Apakah Anda yakin ingin ${actionText} ${selectedProducts.size} produk yang dipilih?`,
			[
				{ text: "Batal", style: "cancel" },
				{
					text: "Ya",
					style: action === "delete" ? "destructive" : "default",
					onPress: async () => {
						setLoading(true);
						try {
							const promises = Array.from(selectedProducts).map(async (productId) => {
								if (action === "delete") {
									return await ProductService.deleteProduct(productId);
								} else {
									const status = {
										publish: "published",
										unpublish: "draft",
										archive: "archived",
									}[action] as "published" | "draft" | "archived";

									return await ProductService.updateProduct(productId, { status });
								}
							});

							await Promise.all(promises);
							setSelectedProducts(new Set());
							await loadData();

							Alert.alert("Sukses", `${selectedProducts.size} produk berhasil ${actionText}`);
						} catch (error) {
							console.error("Error performing bulk action:", error);
							Alert.alert("Error", `Gagal ${actionText} produk. Silakan coba lagi.`);
						} finally {
							setLoading(false);
						}
					},
				},
			],
		);
	};

	const handleEditProduct = (product: Product) => {
		// In a real app, this would open an edit modal
		Alert.alert("Info", `Edit ${product.name} - Fitur akan ditambahkan`);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "published":
				return "text-green-400";
			case "draft":
				return "text-yellow-400";
			case "archived":
				return "text-red-400";
			default:
				return "text-gray-400";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "published":
				return "Terpublikasi";
			case "draft":
				return "Draft";
			case "archived":
				return "Diarsipkan";
			default:
				return status;
		}
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
		}).format(price);
	};

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				{/* Header */}
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<ThemedText type="title" className="text-xl font-bold text-white">
						Kelola Katalog
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
						<IconSymbol name="magnifyingglass" size={20} color="#6B7280" />
						<TextInput
							value={filters.search}
							onChangeText={handleSearch}
							placeholder="Cari produk..."
							placeholderTextColor="#6B7280"
							className="flex-1 text-white ml-3"
						/>
					</View>

					{/* Filter Toggle and Stats */}
					<View className="flex-row items-center justify-between">
						<Pressable
							onPress={() => setShowFilters(!showFilters)}
							className="flex-row items-center gap-2">
							<IconSymbol name="slider.horizontal.3" size={20} color="#3B82F6" />
							<ThemedText className="text-blue-400 font-medium">Filter</ThemedText>
						</Pressable>

						<ThemedText className="text-sm text-gray-400">
							{products.length} produk ditemukan
						</ThemedText>
					</View>

					{/* Filters */}
					{showFilters && (
						<View className="mt-4 pt-4 border-t border-gray-700">
							{/* Category Filter */}
							<View className="mb-3">
								<ThemedText className="text-sm font-medium text-gray-300 mb-2">Kategori</ThemedText>
								<ScrollView horizontal showsHorizontalScrollIndicator={false}>
									<View className="flex-row gap-2">
										<Pressable
											onPress={() => setFilters({ ...filters, category_id: "", page: 1 })}
											className={`px-3 py-2 rounded-lg border ${
												!filters.category_id ? "bg-blue-600 border-blue-600" : "border-gray-600"
											}`}>
											<ThemedText
												className={`text-sm ${
													!filters.category_id ? "text-white" : "text-gray-300"
												}`}>
												Semua
											</ThemedText>
										</Pressable>
										{categories.map((category) => (
											<Pressable
												key={category.id}
												onPress={() =>
													setFilters({ ...filters, category_id: category.id, page: 1 })
												}
												className={`px-3 py-2 rounded-lg border ${
													filters.category_id === category.id
														? "bg-blue-600 border-blue-600"
														: "border-gray-600"
												}`}>
												<ThemedText
													className={`text-sm ${
														filters.category_id === category.id ? "text-white" : "text-gray-300"
													}`}>
													{category.name}
												</ThemedText>
											</Pressable>
										))}
									</View>
								</ScrollView>
							</View>

							{/* Status Filter */}
							<View className="mb-3">
								<ThemedText className="text-sm font-medium text-gray-300 mb-2">Status</ThemedText>
								<View className="flex-row gap-2">
									{["published", "draft", "archived"].map((status) => (
										<Pressable
											key={status}
											onPress={() => handleStatusFilter(status)}
											className={`px-3 py-2 rounded-lg border ${
												filters.status?.includes(status)
													? "bg-blue-600 border-blue-600"
													: "border-gray-600"
											}`}>
											<ThemedText
												className={`text-sm ${
													filters.status?.includes(status) ? "text-white" : "text-gray-300"
												}`}>
												{getStatusText(status)}
											</ThemedText>
										</Pressable>
									))}
								</View>
							</View>

							{/* Sort Options */}
							<View>
								<ThemedText className="text-sm font-medium text-gray-300 mb-2">Urutkan</ThemedText>
								<View className="flex-row gap-2">
									{(
										[
											{ key: "name" as const, label: "Nama" },
											{ key: "price" as const, label: "Harga" },
											{ key: "created_at" as const, label: "Tanggal" },
											{ key: "stock_quantity" as const, label: "Stok" },
										] as const
									).map((sort) => (
										<Pressable
											key={sort.key}
											onPress={() => handleSort(sort.key)}
											className={`px-3 py-2 rounded-lg border flex-row items-center gap-1 ${
												filters.sort_by === sort.key
													? "bg-blue-600 border-blue-600"
													: "border-gray-600"
											}`}>
											<ThemedText
												className={`text-sm ${
													filters.sort_by === sort.key ? "text-white" : "text-gray-300"
												}`}>
												{sort.label}
											</ThemedText>
											{filters.sort_by === sort.key && (
												<IconSymbol
													name={filters.sort_direction === "asc" ? "chevron.up" : "chevron.down"}
													size={12}
													color="#FFFFFF"
												/>
											)}
										</Pressable>
									))}
								</View>
							</View>
						</View>
					)}
				</View>

				{/* Bulk Actions */}
				{selectedProducts.size > 0 && (
					<View className="flex-row items-center justify-between px-6 py-3 bg-blue-900/20 border-b border-blue-800">
						<ThemedText className="text-blue-400 font-medium">
							{selectedProducts.size} produk dipilih
						</ThemedText>
						<View className="flex-row gap-2">
							<Pressable
								onPress={() => handleBulkAction("publish")}
								className="bg-green-600 px-3 py-2 rounded-lg">
								<ThemedText className="text-white text-sm">Publikasi</ThemedText>
							</Pressable>
							<Pressable
								onPress={() => handleBulkAction("unpublish")}
								className="bg-yellow-600 px-3 py-2 rounded-lg">
								<ThemedText className="text-white text-sm">Draft</ThemedText>
							</Pressable>
							<Pressable
								onPress={() => handleBulkAction("archive")}
								className="bg-orange-600 px-3 py-2 rounded-lg">
								<ThemedText className="text-white text-sm">Arsip</ThemedText>
							</Pressable>
							<Pressable
								onPress={() => handleBulkAction("delete")}
								className="bg-red-600 px-3 py-2 rounded-lg">
								<ThemedText className="text-white text-sm">Hapus</ThemedText>
							</Pressable>
						</View>
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
						{products.length > 0 && (
							<View className="flex-row items-center px-6 py-3 border-b border-gray-800">
								<Pressable onPress={handleSelectAll} className="flex-row items-center gap-3">
									<View
										className={`w-5 h-5 rounded border-2 items-center justify-center ${
											selectedProducts.size === products.length
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
										{selectedProducts.size === products.length
											? "Batalkan pilih semua"
											: "Pilih semua"}
									</ThemedText>
								</Pressable>
							</View>
						)}

						{/* Product Items */}
						{products.map((product) => (
							<ProductItem
								key={product.id}
								product={product}
								selected={selectedProducts.has(product.id)}
								onSelect={() => handleSelectProduct(product.id)}
								onEdit={() => handleEditProduct(product)}
								formatPrice={formatPrice}
								getStatusColor={getStatusColor}
								getStatusText={getStatusText}
							/>
						))}

						{products.length === 0 && !loading && (
							<View className="flex-1 items-center justify-center py-20">
								<IconSymbol name="archivebox" size={64} color="#6B7280" />
								<ThemedText className="text-gray-400 text-lg font-medium mt-4">
									Tidak ada produk
								</ThemedText>
								<ThemedText className="text-gray-500 text-center mt-2">
									{filters.search || filters.category_id || filters.status?.length
										? "Tidak ada produk yang sesuai dengan filter"
										: "Belum ada produk dalam katalog"}
								</ThemedText>
							</View>
						)}

						{/* Load More */}
						{filters.page && filters.page < totalPages && (
							<Pressable
								onPress={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
								className="mx-6 my-4 bg-gray-800 py-3 rounded-xl items-center">
								<ThemedText className="text-blue-400 font-medium">Muat Lebih Banyak</ThemedText>
							</Pressable>
						)}

						<View className="h-6" />
					</ScrollView>
				)}
			</ThemedView>
		</Modal>
	);
}

interface ProductItemProps {
	product: Product;
	selected: boolean;
	onSelect: () => void;
	onEdit: () => void;
	formatPrice: (price: number) => string;
	getStatusColor: (status: string) => string;
	getStatusText: (status: string) => string;
}

function ProductItem({
	product,
	selected,
	onSelect,
	onEdit,
	formatPrice,
	getStatusColor,
	getStatusText,
}: ProductItemProps) {
	return (
		<View className="px-6 py-4 border-b border-gray-800">
			<View className="flex-row items-start gap-3">
				{/* Selection Checkbox */}
				<Pressable onPress={onSelect} className="mt-1">
					<View
						className={`w-5 h-5 rounded border-2 items-center justify-center ${
							selected ? "bg-blue-600 border-blue-600" : "border-gray-600"
						}`}>
						{selected && <IconSymbol name="checkmark" size={12} color="#FFFFFF" />}
					</View>
				</Pressable>

				{/* Product Image Placeholder */}
				<View className="w-12 h-12 bg-gray-800 rounded-lg items-center justify-center">
					<IconSymbol name="photo" size={20} color="#6B7280" />
				</View>

				{/* Product Details */}
				<View className="flex-1">
					<View className="flex-row items-start justify-between mb-1">
						<ThemedText className="text-white font-semibold flex-1 mr-3" numberOfLines={2}>
							{product.name}
						</ThemedText>
						<Pressable onPress={onEdit} className="p-1">
							<IconSymbol name="pencil" size={16} color="#6B7280" />
						</Pressable>
					</View>

					<View className="flex-row items-center gap-3 mb-2">
						<ThemedText className="text-gray-400 text-sm">SKU: {product.sku}</ThemedText>
						<ThemedText className={`text-sm font-medium ${getStatusColor(product.status)}`}>
							{getStatusText(product.status)}
						</ThemedText>
					</View>

					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center gap-4">
							<ThemedText className="text-blue-400 font-semibold">
								{formatPrice(product.price)}
							</ThemedText>
							{product.track_inventory && (
								<ThemedText
									className={`text-sm ${
										product.stock_quantity <= 0
											? "text-red-400"
											: product.stock_quantity <= product.low_stock_threshold
												? "text-yellow-400"
												: "text-green-400"
									}`}>
									Stok: {product.stock_quantity}
								</ThemedText>
							)}
						</View>

						{product.featured && (
							<View className="bg-yellow-600/20 px-2 py-1 rounded">
								<ThemedText className="text-yellow-400 text-xs">Unggulan</ThemedText>
							</View>
						)}
					</View>

					{product.category && (
						<ThemedText className="text-gray-500 text-sm mt-1">
							Kategori: {product.category.name}
						</ThemedText>
					)}
				</View>
			</View>
		</View>
	);
}
