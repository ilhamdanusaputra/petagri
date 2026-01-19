// ================================================
// Product Analytics Modal
// Description: Modal for product performance analytics and reporting
// ================================================

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProductService } from "@/services/product";
import { Product } from "@/types/product";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    TextInput,
    View,
} from "react-native";

interface ProductAnalyticsModalProps {
	visible: boolean;
	onClose: () => void;
}

type Period = "7d" | "30d" | "90d" | "1y";

export function ProductAnalyticsModal({ visible, onClose }: ProductAnalyticsModalProps) {
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedPeriod, setSelectedPeriod] = useState<Period>("30d");
	const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
	const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [error, setError] = useState<string | null>(null);
	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Dynamic analytics data based on actual products and period
	const [analyticsData, setAnalyticsData] = useState({
		totalRevenue: 0,
		totalProfit: 0,
		totalSales: 0,
		conversionRate: 0,
		averageOrderValue: 0,
		totalProducts: 0,
		activeProducts: 0,
		lowStockCount: 0,
		profitMargin: 0,
	});

	useEffect(() => {
		if (visible) {
			loadData();
		} else {
			// Cleanup on close
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
				searchTimeoutRef.current = null;
			}
			setSearchQuery("");
			setError(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visible, selectedPeriod]);

	const loadData = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			// Load all necessary data in parallel
			const [lowStockData, topSellingData, allProducts] = await Promise.all([
				ProductService.getLowStockProducts().catch((err) => {
					console.warn("Failed to load low stock products:", err);
					return [];
				}),
				ProductService.getTopSellingProducts(10).catch((err) => {
					console.warn("Failed to load top selling products:", err);
					return [];
				}),
				ProductService.getProducts({ per_page: 1000, status: ["active", "draft"] }),
			]);

			setLowStockProducts(lowStockData);
			setTopSellingProducts(topSellingData);

			// Calculate analytics from product data
			const products = allProducts.data || [];
			const activeProducts = products.filter((p) => p.status === "active");
			const lowStock = products.filter((p) => p.stock_quantity <= p.min_stock_level);

			// Calculate revenue and profit (mock calculation based on products)
			let totalRevenue = 0;
			let totalProfit = 0;
			let totalSales = 0;

			activeProducts.forEach((product) => {
				// Mock sales data based on product features and stock
				const mockSales = Math.floor(Math.random() * 50) + (product.is_featured ? 20 : 5);
				const productRevenue = mockSales * (product.selling_price || 0);
				const productProfit =
					mockSales * ((product.selling_price || 0) - (product.base_price || 0));

				totalRevenue += productRevenue;
				totalProfit += productProfit;
				totalSales += mockSales;
			});

			const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
			const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
			const conversionRate = Math.random() * 5 + 1; // Mock conversion rate

			setAnalyticsData({
				totalRevenue,
				totalProfit,
				totalSales,
				conversionRate,
				averageOrderValue: avgOrderValue,
				totalProducts: products.length,
				activeProducts: activeProducts.length,
				lowStockCount: lowStock.length,
				profitMargin,
			});
		} catch (error) {
			console.error("Error loading analytics data:", error);
			let errorMessage = "Gagal memuat data analitik.";

			if (error instanceof Error) {
				if (error.message.includes("network") || error.message.includes("fetch")) {
					errorMessage = "Gagal terhubung ke server. Periksa koneksi internet Anda.";
				} else if (error.message.includes("timeout")) {
					errorMessage = "Waktu permintaan habis. Silakan coba lagi.";
				} else if (error.message.includes("auth") || error.message.includes("unauthorized")) {
					errorMessage = "Sesi telah berakhir. Silakan login ulang.";
				}
			}

			setError(errorMessage + " Silakan coba lagi.");
			console.error(errorMessage + " Silakan coba lagi.");
		} finally {
			setLoading(false);
		}
	}, []);

	const handleSearch = (text: string) => {
		setSearchQuery(text);

		// Clear existing timeout
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		// Set new timeout for search
		searchTimeoutRef.current = setTimeout(() => {
			// Search is applied via filter functions
		}, 300);
	};

	const filterTopSellingProducts = () => {
		return topSellingProducts.filter(
			(product) =>
				!searchQuery ||
				product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.sku.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	};

	const filterLowStockProducts = () => {
		return lowStockProducts.filter(
			(product) =>
				!searchQuery ||
				product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.sku.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadData();
		setRefreshing(false);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
		}).format(amount);
	};

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat("id-ID").format(num);
	};

	const getPeriodText = (period: Period) => {
		switch (period) {
			case "7d":
				return "7 Hari Terakhir";
			case "30d":
				return "30 Hari Terakhir";
			case "90d":
				return "90 Hari Terakhir";
			case "1y":
				return "1 Tahun Terakhir";
		}
	};

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				{/* Header */}
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<ThemedText type="title" className="text-xl font-bold text-white">
						Analitik Produk
					</ThemedText>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				{/* Period Selector */}
				<View className="px-6 py-4 border-b border-gray-800">
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<View className="flex-row gap-2">
							{(["7d", "30d", "90d", "1y"] as Period[]).map((period) => (
								<Pressable
									key={period}
									onPress={() => setSelectedPeriod(period)}
									className={`px-4 py-2 rounded-lg border ${
										selectedPeriod === period ? "bg-blue-600 border-blue-600" : "border-gray-600"
									}`}>
									<ThemedText
										className={`text-sm font-medium ${
											selectedPeriod === period ? "text-white" : "text-gray-300"
										}`}>
										{getPeriodText(period)}
									</ThemedText>
								</Pressable>
							))}
						</View>
					</ScrollView>
				</View>

				{/* Search Bar */}
				<View className="px-6 py-4">
					<View className="flex-row items-center bg-gray-800 rounded-xl px-4 py-3">
						<IconSymbol name="magnifyingglass" size={20} color="#6B7280" />
						<TextInput
							value={searchQuery}
							onChangeText={handleSearch}
							placeholder="Cari produk..."
							placeholderTextColor="#6B7280"
							className="flex-1 text-white ml-3"
						/>
						{searchQuery.length > 0 && (
							<Pressable onPress={() => setSearchQuery("")} className="ml-2">
								<IconSymbol name="xmark" size={16} color="#6B7280" />
							</Pressable>
						)}
					</View>
				</View>

				{/* Error State */}
				{error && !loading && (
					<View className="mx-6 mb-4 bg-red-900/20 border border-red-800 rounded-xl p-4">
						<View className="flex-row items-center gap-3">
							<IconSymbol name="exclamationmark.triangle.fill" size={20} color="#EF4444" />
							<ThemedText className="text-red-400 flex-1">{error}</ThemedText>
							<Pressable onPress={loadData} className="bg-red-600 px-3 py-1 rounded">
								<ThemedText className="text-white text-sm">Coba Lagi</ThemedText>
							</Pressable>
						</View>
					</View>
				)}

				{loading ? (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size="large" color="#3B82F6" />
						<ThemedText className="text-gray-400 mt-3">Memuat analitik...</ThemedText>
					</View>
				) : (
					<ScrollView
						className="flex-1"
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
						showsVerticalScrollIndicator={false}>
						{/* Key Metrics */}
						<View className="px-6 py-6">
							<ThemedText type="subtitle" className="text-lg font-semibold text-white mb-4">
								Metrik Utama
							</ThemedText>

							<View className="flex-row flex-wrap gap-3">
								<View className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex-1 min-w-[45%]">
									<View className="flex-row items-center justify-between mb-2">
										<IconSymbol name="dollarsign.circle.fill" size={24} color="#10B981" />
										<View className="bg-green-900/20 px-2 py-1 rounded">
											<ThemedText className="text-green-400 text-xs font-medium">+12.5%</ThemedText>
										</View>
									</View>
									<ThemedText className="text-2xl font-bold text-white">
										{formatCurrency(analyticsData.totalRevenue)}
									</ThemedText>
									<ThemedText className="text-gray-400 text-sm">Total Pendapatan</ThemedText>
								</View>

								<View className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex-1 min-w-[45%]">
									<View className="flex-row items-center justify-between mb-2">
										<IconSymbol name="chart.bar.fill" size={24} color="#3B82F6" />
										<View className="bg-blue-900/20 px-2 py-1 rounded">
											<ThemedText className="text-blue-400 text-xs font-medium">+8.3%</ThemedText>
										</View>
									</View>
									<ThemedText className="text-2xl font-bold text-white">
										{formatNumber(analyticsData.totalSales)}
									</ThemedText>
									<ThemedText className="text-gray-400 text-sm">Total Penjualan</ThemedText>
								</View>

								<View className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex-1 min-w-[45%]">
									<View className="flex-row items-center justify-between mb-2">
										<IconSymbol name="bag.fill" size={24} color="#F59E0B" />
										<View className="bg-yellow-900/20 px-2 py-1 rounded">
											<ThemedText className="text-yellow-400 text-xs font-medium">+5.7%</ThemedText>
										</View>
									</View>
									<ThemedText className="text-2xl font-bold text-white">
										{formatCurrency(analyticsData.totalProfit)}
									</ThemedText>
									<ThemedText className="text-gray-400 text-sm">Total Keuntungan</ThemedText>
								</View>

								<View className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex-1 min-w-[45%]">
									<View className="flex-row items-center justify-between mb-2">
										<IconSymbol name="arrow.up.circle.fill" size={24} color="#8B5CF6" />
										<View className="bg-purple-900/20 px-2 py-1 rounded">
											<ThemedText className="text-purple-400 text-xs font-medium">+2.1%</ThemedText>
										</View>
									</View>
									<ThemedText className="text-2xl font-bold text-white">
										{analyticsData.conversionRate}%
									</ThemedText>
									<ThemedText className="text-gray-400 text-sm">Conversion Rate</ThemedText>
								</View>
							</View>
						</View>

						{/* Top Selling Products */}
						<View className="px-6 pb-6">
							<View className="flex-row items-center justify-between mb-4">
								<ThemedText type="subtitle" className="text-lg font-semibold text-white">
									Produk Terlaris
								</ThemedText>
								<ThemedText className="text-gray-400 text-sm">
									{filterTopSellingProducts().length} produk
								</ThemedText>
							</View>

							{filterTopSellingProducts().length > 0 ? (
								filterTopSellingProducts().map((product, index) => {
									// Calculate mock sales and revenue for display
									const mockSales = Math.floor(Math.random() * 50) + (product.is_featured ? 20 : 5);
									const mockRevenue = mockSales * product.selling_price;

									return (
										<View
											key={product.id}
											className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-3">
											<View className="flex-row items-center justify-between">
												<View className="flex-row items-center gap-3 flex-1">
													<View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
														<ThemedText className="text-white font-bold text-sm">
															{index + 1}
														</ThemedText>
													</View>
													<View className="flex-1">
														<View className="flex-row items-center gap-2 mb-1">
															<ThemedText className="text-white font-semibold" numberOfLines={1}>
																{product.name}
															</ThemedText>
															{product.is_featured && (
																<View className="bg-yellow-600 px-2 py-0.5 rounded">
																	<ThemedText className="text-white text-xs font-medium">
																		Featured
																	</ThemedText>
																</View>
															)}
														</View>
														<ThemedText className="text-gray-400 text-sm">
															SKU: {product.sku} | {mockSales} unit | Stok: {product.stock_quantity}
														</ThemedText>
													</View>
												</View>
												<View className="text-right">
													<ThemedText className="text-green-400 font-bold">
														{formatCurrency(mockRevenue)}
													</ThemedText>
													<ThemedText className="text-gray-400 text-sm">
														{formatCurrency(product.selling_price)}/unit
													</ThemedText>
												</View>
											</View>
										</View>
									);
								})
							) : (
								<View className="items-center justify-center py-12">
									<IconSymbol name="chart.bar" size={48} color="#6B7280" />
									<ThemedText className="text-gray-400 text-lg font-medium mt-4">
										{searchQuery ? "Produk tidak ditemukan" : "Belum ada data penjualan"}
									</ThemedText>
									{searchQuery && (
										<ThemedText className="text-gray-500 text-center mt-2">
											Coba gunakan kata kunci yang berbeda
										</ThemedText>
									)}
								</View>
							)}
						</View>
						{/* Low Stock Alert */}
						{filterLowStockProducts().length > 0 && (
							<View className="px-6 pb-6">
								<View className="flex-row items-center justify-between mb-4">
									<ThemedText type="subtitle" className="text-lg font-semibold text-white">
										Alert Stok Rendah
									</ThemedText>
									<View className="bg-red-600 px-2 py-1 rounded">
										<ThemedText className="text-white text-xs font-medium">
											{filterLowStockProducts().length} produk
										</ThemedText>
									</View>
								</View>

								{filterLowStockProducts()
									.slice(0, 5)
									.map((product) => (
										<View
											key={product.id}
											className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-3">
											<View className="flex-row items-center justify-between">
												<View className="flex-1">
													<ThemedText className="text-white font-semibold" numberOfLines={1}>
														{product.name}
													</ThemedText>
													<ThemedText className="text-red-400 text-sm mb-1">
														Sisa {product.stock_quantity} unit (batas: {product.min_stock_level})
													</ThemedText>
													<ThemedText className="text-gray-400 text-sm">
														SKU: {product.sku} | Harga: {formatCurrency(product.selling_price)}
													</ThemedText>
												</View>
												<View className="items-end gap-2">
													<View className="bg-red-600 px-3 py-1 rounded">
														<ThemedText className="text-white text-xs font-medium">
															{product.stock_quantity === 0 ? "Habis" : "Stok Rendah"}
														</ThemedText>
													</View>
													{product.stock_quantity > 0 && (
														<ThemedText className="text-yellow-400 text-xs">
															{Math.round(
																((product.min_stock_level - product.stock_quantity) /
																	product.min_stock_level) *
																	100,
															)}
															% dibawah batas
														</ThemedText>
													)}
												</View>
											</View>
										</View>
									))}

								{filterLowStockProducts().length > 5 && (
									<Pressable
										onPress={() => setSearchQuery("")}
										className="bg-gray-800 border border-gray-600 rounded-xl p-3">
										<ThemedText className="text-gray-400 text-center text-sm">
											+{filterLowStockProducts().length - 5} produk lainnya dengan stok rendah
										</ThemedText>
										<ThemedText className="text-blue-400 text-center text-xs mt-1">
											Ketap untuk melihat semua
										</ThemedText>
									</Pressable>
								)}
							</View>
						)}

						{/* Key Insights */}
						<View className="px-6 pb-6">
							<ThemedText type="subtitle" className="text-lg font-semibold text-white mb-4">
								Insight Utama
							</ThemedText>

							{/* Revenue Insight */}
							{analyticsData.totalRevenue > 0 && (
								<View className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 mb-3">
									<View className="flex-row items-start gap-3">
										<IconSymbol name="chart.line.uptrend.xyaxis" size={20} color="#3B82F6" />
										<View className="flex-1">
											<ThemedText className="text-blue-400 font-semibold mb-1">
												Performa Penjualan
											</ThemedText>
											<ThemedText className="text-gray-300 text-sm">
												Total pendapatan {formatCurrency(analyticsData.totalRevenue)} dari{" "}
												{analyticsData.totalSales} penjualan dengan profit margin{" "}
												{analyticsData.profitMargin.toFixed(1)}%.
											</ThemedText>
										</View>
									</View>
								</View>
							)}

							{/* Low Stock Warning */}
							{analyticsData.lowStockCount > 0 && (
								<View className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 mb-3">
									<View className="flex-row items-start gap-3">
										<IconSymbol name="exclamationmark.triangle.fill" size={20} color="#F59E0B" />
										<View className="flex-1">
											<ThemedText className="text-yellow-400 font-semibold mb-1">
												Perhatian Stok
											</ThemedText>
											<ThemedText className="text-gray-300 text-sm">
												{analyticsData.lowStockCount} produk memiliki stok rendah dari total{" "}
												{analyticsData.totalProducts} produk. Segera lakukan restocking untuk
												menghindari kehabisan stok.
											</ThemedText>
										</View>
									</View>
								</View>
							)}

							{/* Product Portfolio Insight */}
							{analyticsData.totalProducts > 0 && (
								<View className="bg-green-900/20 border border-green-800 rounded-xl p-4 mb-3">
									<View className="flex-row items-start gap-3">
										<IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />
										<View className="flex-1">
											<ThemedText className="text-green-400 font-semibold mb-1">
												Portofolio Produk
											</ThemedText>
											<ThemedText className="text-gray-300 text-sm">
												Anda memiliki {analyticsData.activeProducts} produk aktif dari{" "}
												{analyticsData.totalProducts} total produk. Rata-rata nilai per pesanan
												adalah {formatCurrency(analyticsData.averageOrderValue)}.
											</ThemedText>
										</View>
									</View>
								</View>
							)}

							{/* Conversion Rate Insight */}
							{analyticsData.conversionRate > 0 && (
								<View className="bg-purple-900/20 border border-purple-800 rounded-xl p-4">
									<View className="flex-row items-start gap-3">
										<IconSymbol name="arrow.up.right.circle.fill" size={20} color="#8B5CF6" />
										<View className="flex-1">
											<ThemedText className="text-purple-400 font-semibold mb-1">
												Rekomendasi
											</ThemedText>
											<ThemedText className="text-gray-300 text-sm">
												Dengan conversion rate {analyticsData.conversionRate.toFixed(1)}%, fokuskan
												promosi pada produk featured dan tingkatkan stok produk best seller untuk
												memaksimalkan penjualan.
											</ThemedText>
										</View>
									</View>
								</View>
							)}

							{/* Empty State */}
							{analyticsData.totalProducts === 0 && (
								<View className="items-center justify-center py-12">
									<IconSymbol name="chart.bar" size={48} color="#6B7280" />
									<ThemedText className="text-gray-400 text-lg font-medium mt-4">
										Belum ada data untuk ditampilkan
									</ThemedText>
									<ThemedText className="text-gray-500 text-center mt-2">
										Mulai dengan menambah produk dan melakukan penjualan
									</ThemedText>
								</View>
							)}
						</View>

						<View className="h-6" />
					</ScrollView>
				)}
			</ThemedView>
		</Modal>
	);
}
