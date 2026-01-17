// ================================================
// Product Analytics Modal
// Description: Modal for product performance analytics and reporting
// ================================================

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProductService } from "@/services/product";
import { Product } from "@/types/product";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
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

	// Mock analytics data - in real app, this would come from analytics service
	const [analyticsData] = useState({
		totalRevenue: 25000000,
		totalProfit: 8750000,
		totalSales: 245,
		conversionRate: 3.2,
		averageOrderValue: 102000,
		topSellingProducts: [
			{ name: "Pupuk Organik A", sales: 45, revenue: 4500000 },
			{ name: "Pestisida B", sales: 38, revenue: 3800000 },
			{ name: "Bibit Padi C", sales: 32, revenue: 3200000 },
		],
		categoryPerformance: [
			{ name: "Pupuk", value: 45, color: "#3B82F6" },
			{ name: "Pestisida", value: 30, color: "#10B981" },
			{ name: "Bibit", value: 15, color: "#F59E0B" },
			{ name: "Alat", value: 10, color: "#EF4444" },
		],
		revenueChart: {
			labels: ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
			datasets: [
				{
					data: [4200000, 5100000, 6200000, 5500000],
				},
			],
		},
		salesTrendChart: {
			labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
			datasets: [
				{
					data: [12, 18, 15, 25, 22, 30, 28],
				},
			],
		},
	});

	useEffect(() => {
		if (visible) {
			loadData();
		}
	}, [visible, selectedPeriod]);

	const loadData = async () => {
		setLoading(true);
		try {
			const [lowStockData] = await Promise.all([
				ProductService.getTopSellingProducts(10),
				ProductService.getCategories(),
				ProductService.getLowStockProducts(),
			]);

			setLowStockProducts(lowStockData);

			// In real app, also load analytics data based on selectedPeriod
			// const analytics = await ProductService.getProductAnalytics(undefined, startDate, endDate);
		} catch (error) {
			console.error("Error loading analytics data:", error);
			Alert.alert("Error", "Gagal memuat data analitik.");
		} finally {
			setLoading(false);
		}
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
							<ThemedText type="subtitle" className="text-lg font-semibold text-white mb-4">
								Produk Terlaris
							</ThemedText>

							{analyticsData.topSellingProducts.map((product, index) => (
								<View
									key={product.name}
									className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-3">
									<View className="flex-row items-center justify-between">
										<View className="flex-row items-center gap-3 flex-1">
											<View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
												<ThemedText className="text-white font-bold text-sm">
													{index + 1}
												</ThemedText>
											</View>
											<View className="flex-1">
												<ThemedText className="text-white font-semibold" numberOfLines={1}>
													{product.name}
												</ThemedText>
												<ThemedText className="text-gray-400 text-sm">
													{product.sales} unit terjual
												</ThemedText>
											</View>
										</View>
										<ThemedText className="text-green-400 font-bold">
											{formatCurrency(product.revenue)}
										</ThemedText>
									</View>
								</View>
							))}
						</View>

						{/* Low Stock Alert */}
						{lowStockProducts.length > 0 && (
							<View className="px-6 pb-6">
								<ThemedText type="subtitle" className="text-lg font-semibold text-white mb-4">
									Alert Stok Rendah
								</ThemedText>

								{lowStockProducts.slice(0, 5).map((product) => (
									<View
										key={product.id}
										className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-3">
										<View className="flex-row items-center justify-between">
											<View className="flex-1">
												<ThemedText className="text-white font-semibold" numberOfLines={1}>
													{product.name}
												</ThemedText>
												<ThemedText className="text-red-400 text-sm">
													Sisa {product.stock_quantity} unit (batas: {product.low_stock_threshold})
												</ThemedText>
											</View>
											<View className="bg-red-600 px-3 py-1 rounded">
												<ThemedText className="text-white text-xs font-medium">
													Stok Rendah
												</ThemedText>
											</View>
										</View>
									</View>
								))}

								{lowStockProducts.length > 5 && (
									<ThemedText className="text-gray-400 text-center text-sm">
										+{lowStockProducts.length - 5} produk lainnya dengan stok rendah
									</ThemedText>
								)}
							</View>
						)}

						{/* Key Insights */}
						<View className="px-6 pb-6">
							<ThemedText type="subtitle" className="text-lg font-semibold text-white mb-4">
								Insight Utama
							</ThemedText>

							<View className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 mb-3">
								<View className="flex-row items-start gap-3">
									<IconSymbol name="lightbulb.fill" size={20} color="#3B82F6" />
									<View className="flex-1">
										<ThemedText className="text-blue-400 font-semibold mb-1">
											Tren Positif
										</ThemedText>
										<ThemedText className="text-gray-300 text-sm">
											Penjualan meningkat 12.5% dibanding periode sebelumnya dengan kategori Pupuk
											sebagai kontributor utama.
										</ThemedText>
									</View>
								</View>
							</View>

							<View className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 mb-3">
								<View className="flex-row items-start gap-3">
									<IconSymbol name="exclamationmark.triangle.fill" size={20} color="#F59E0B" />
									<View className="flex-1">
										<ThemedText className="text-yellow-400 font-semibold mb-1">
											Perhatian
										</ThemedText>
										<ThemedText className="text-gray-300 text-sm">
											{lowStockProducts.length} produk memiliki stok rendah dan perlu restock segera
											untuk mempertahankan penjualan.
										</ThemedText>
									</View>
								</View>
							</View>

							<View className="bg-green-900/20 border border-green-800 rounded-xl p-4">
								<View className="flex-row items-start gap-3">
									<IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />
									<View className="flex-1">
										<ThemedText className="text-green-400 font-semibold mb-1">
											Rekomendasi
										</ThemedText>
										<ThemedText className="text-gray-300 text-sm">
											Fokus marketing pada kategori Pupuk dan tingkatkan stok produk terlaris untuk
											memaksimalkan pendapatan.
										</ThemedText>
									</View>
								</View>
							</View>
						</View>

						<View className="h-6" />
					</ScrollView>
				)}
			</ThemedView>
		</Modal>
	);
}
