import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { PerformanceService } from "@/services/performance";
import { PerformanceMetrics, TopMitraPerformance } from "@/types/performance";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    View,
} from "react-native";

interface PerformanceMitraModalProps {
	visible: boolean;
	onClose: () => void;
}

interface FilterForm {
	period: "month" | "quarter" | "year";
}

export function PerformanceMitraModal({ visible, onClose }: PerformanceMitraModalProps) {
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
	const [topMitra, setTopMitra] = useState<TopMitraPerformance[]>([]);

	// Form for period selection
	const { watch, setValue } = useForm<FilterForm>({
		defaultValues: {
			period: "month",
		},
		mode: "onChange",
	});

	const selectedPeriod = watch("period");

	// Load performance data
	const loadPerformanceData = useCallback(async () => {
		try {
			setLoading(true);
			console.log("Loading performance data for period:", selectedPeriod);

			const [metricsData, topMitraData] = await Promise.all([
				PerformanceService.getPerformanceMetrics(selectedPeriod),
				PerformanceService.getTopPerformingMitra(selectedPeriod, 5),
			]);

			setMetrics(metricsData);
			setTopMitra(topMitraData);
			console.log("Performance data loaded:", { metricsData, topMitraData });
		} catch (error) {
			console.error("Error loading performance data:", error);
			console.error("Gagal memuat data performa mitra");
		} finally {
			setLoading(false);
		}
	}, [selectedPeriod]);

	// Refresh data
	const onRefresh = async () => {
		setRefreshing(true);
		await loadPerformanceData();
		setRefreshing(false);
	};

	// Load data when modal opens or period changes
	useEffect(() => {
		if (visible) {
			loadPerformanceData();
		}
	}, [visible, loadPerformanceData]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const getGrowthColor = (growth: number) => {
		return growth > 0 ? "text-green-400" : growth < 0 ? "text-red-400" : "text-gray-400";
	};

	const getGrowthIcon = (growth: number) => {
		return growth > 0 ? "+" : "";
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
			onRequestClose={onClose}>
			<ThemedView className="flex-1 bg-gray-900">
				{/* Header */}
				<View className="flex-row items-center justify-between p-5 border-b border-gray-700">
					<View className="flex-1">
						<ThemedText type="title" className="text-xl font-bold text-white">
							Performa Mitra
						</ThemedText>
						<ThemedText className="text-sm text-gray-400 mt-1">
							Analisis dan laporan performa bisnis
						</ThemedText>
					</View>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 items-center justify-center rounded-full bg-gray-700">
						<IconSymbol name="xmark" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				<ScrollView
					className="flex-1"
					showsVerticalScrollIndicator={false}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
					{/* Period Filter */}
					<View className="p-5">
						<ThemedText className="text-lg font-semibold text-white mb-3">
							Periode Laporan
						</ThemedText>
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							<View className="flex-row gap-2">
								{[
									{ key: "month", label: "Bulanan" },
									{ key: "quarter", label: "Triwulan" },
									{ key: "year", label: "Tahunan" },
								].map((period) => (
									<Pressable
										key={period.key}
										className={`px-4 py-2 rounded-full ${
											selectedPeriod === period.key
												? "bg-blue-600"
												: "bg-gray-800 border border-gray-600"
										}`}
										onPress={() => setValue("period", period.key as any)}>
										<ThemedText
											className={`text-sm font-medium ${
												selectedPeriod === period.key ? "text-white" : "text-gray-400"
											}`}>
											{period.label}
										</ThemedText>
									</Pressable>
								))}
							</View>
						</ScrollView>
					</View>

					{/* Loading State */}
					{loading && (
						<View className="flex-1 items-center justify-center py-20">
							<ActivityIndicator size="large" color="#3B82F6" />
							<ThemedText className="text-gray-400 mt-2">Memuat data performa...</ThemedText>
						</View>
					)}

					{/* KPI Cards */}
					{!loading && metrics && (
						<View className="px-5 mb-5">
							<View className="flex-row flex-wrap gap-3">
								<View className="flex-1 min-w-[45%] bg-gray-800 p-4 rounded-2xl border border-gray-700">
									<View className="flex-row items-center justify-between mb-2">
										<IconSymbol name="chart.bar.fill" size={24} color="#3B82F6" />
										<ThemedText
											className={`text-sm font-medium ${getGrowthColor(metrics.revenue_growth)}`}>
											{getGrowthIcon(metrics.revenue_growth)}
											{metrics.revenue_growth}%
										</ThemedText>
									</View>
									<ThemedText className="text-2xl font-bold text-white">
										{formatCurrency(metrics.total_revenue)}
									</ThemedText>
									<ThemedText className="text-sm text-gray-400">Total Revenue</ThemedText>
								</View>

								<View className="flex-1 min-w-[45%] bg-gray-800 p-4 rounded-2xl border border-gray-700">
									<View className="flex-row items-center justify-between mb-2">
										<IconSymbol name="cart.fill" size={24} color="#10B981" />
										<ThemedText
											className={`text-sm font-medium ${getGrowthColor(metrics.orders_growth)}`}>
											{getGrowthIcon(metrics.orders_growth)}
											{metrics.orders_growth}%
										</ThemedText>
									</View>
									<ThemedText className="text-2xl font-bold text-white">
										{metrics.total_orders}
									</ThemedText>
									<ThemedText className="text-sm text-gray-400">Total Orders</ThemedText>
								</View>

								<View className="flex-1 min-w-[45%] bg-gray-800 p-4 rounded-2xl border border-gray-700">
									<View className="flex-row items-center justify-between mb-2">
										<IconSymbol name="house.fill" size={24} color="#F59E0B" />
										<ThemedText
											className={`text-sm font-medium ${getGrowthColor(metrics.partners_growth)}`}>
											{getGrowthIcon(metrics.partners_growth)}
											{metrics.partners_growth}%
										</ThemedText>
									</View>
									<ThemedText className="text-2xl font-bold text-white">
										{metrics.active_partners}
									</ThemedText>
									<ThemedText className="text-sm text-gray-400">Active Partners</ThemedText>
								</View>

								<View className="flex-1 min-w-[45%] bg-gray-800 p-4 rounded-2xl border border-gray-700">
									<View className="flex-row items-center justify-between mb-2">
										<IconSymbol name="star.fill" size={24} color="#EC4899" />
										<ThemedText
											className={`text-sm font-medium ${getGrowthColor(metrics.rating_growth)}`}>
											{getGrowthIcon(metrics.rating_growth)}
											{metrics.rating_growth}%
										</ThemedText>
									</View>
									<ThemedText className="text-2xl font-bold text-white">
										{metrics.average_rating}
									</ThemedText>
									<ThemedText className="text-sm text-gray-400">Avg Rating</ThemedText>
								</View>
							</View>
						</View>
					)}

					{/* Top Performing Partners */}
					{!loading && topMitra.length > 0 && (
						<View className="px-5 mb-5">
							<ThemedText className="text-lg font-semibold text-white mb-3">
								Top Performing Partners
							</ThemedText>
							<View className="gap-3">
								{topMitra.map((partner, index) => (
									<View
										key={partner.id}
										className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
										<View className="flex-row items-center justify-between mb-3">
											<View className="flex-row items-center gap-3">
												<View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center">
													<ThemedText className="text-white font-bold text-sm">
														{index + 1}
													</ThemedText>
												</View>
												<View className="flex-1">
													<ThemedText className="text-white font-semibold text-base">
														{partner.company_name}
													</ThemedText>
													<View className="flex-row items-center gap-1 mt-1">
														<IconSymbol name="star.fill" size={12} color="#F59E0B" />
														<ThemedText className="text-gray-400 text-sm">
															{partner.rating || 0}
														</ThemedText>
													</View>
												</View>
											</View>
											<View
												className={`px-2 py-1 rounded-full ${
													partner.growth > 0
														? "bg-green-600"
														: partner.growth < 0
															? "bg-red-600"
															: "bg-gray-600"
												}`}>
												<ThemedText className="text-white text-xs font-medium">
													{partner.growth > 0 ? "+" : ""}
													{partner.growth.toFixed(1)}%
												</ThemedText>
											</View>
										</View>

										<View className="flex-row justify-between">
											<View className="flex-1">
												<ThemedText className="text-gray-400 text-sm">Revenue</ThemedText>
												<ThemedText className="text-white font-semibold">
													{formatCurrency(partner.revenue)}
												</ThemedText>
											</View>
											<View className="flex-1">
												<ThemedText className="text-gray-400 text-sm">Orders</ThemedText>
												<ThemedText className="text-white font-semibold">
													{partner.orders} pesanan
												</ThemedText>
											</View>
										</View>
									</View>
								))}
							</View>
						</View>
					)}

					{/* Empty State */}
					{!loading && topMitra.length === 0 && (
						<View className="items-center justify-center py-20">
							<IconSymbol name="chart.bar.fill" size={64} color="#6B7280" />
							<ThemedText className="text-gray-400 text-lg mt-4">
								Tidak ada data performa
							</ThemedText>
							<ThemedText className="text-gray-500 text-sm mt-2 text-center">
								Belum ada transaksi di periode ini
							</ThemedText>
						</View>
					)}
					<View className="h-20" />
				</ScrollView>
			</ThemedView>
		</Modal>
	);
}
