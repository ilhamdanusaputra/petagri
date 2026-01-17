import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

interface PerformanceMitraModalProps {
	visible: boolean;
	onClose: () => void;
}

const topPartners = [
	{
		id: "1",
		name: "PT Agro Mandiri Sejahtera",
		revenue: 67000000,
		orders: 178,
		growth: 15.2,
		rating: 4.8,
	},
	{
		id: "2",
		name: "CV Tani Makmur Bersama",
		revenue: 45000000,
		orders: 142,
		growth: 8.7,
		rating: 4.6,
	},
	{
		id: "3",
		name: "UD Berkah Tani Nusantara",
		revenue: 38000000,
		orders: 125,
		growth: -2.1,
		rating: 4.3,
	},
];

export function PerformanceMitraModal({ visible, onClose }: PerformanceMitraModalProps) {
	const [selectedPeriod, setSelectedPeriod] = useState<"month" | "quarter" | "year">("month");

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
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

				<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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
										onPress={() => setSelectedPeriod(period.key as any)}>
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

					{/* KPI Cards */}
					<View className="px-5 mb-5">
						<View className="flex-row flex-wrap gap-3">
							<View className="flex-1 min-w-[45%] bg-gray-800 p-4 rounded-2xl border border-gray-700">
								<View className="flex-row items-center justify-between mb-2">
									<IconSymbol name="chart.bar.fill" size={24} color="#3B82F6" />
									<ThemedText className="text-green-400 text-sm font-medium">+12.5%</ThemedText>
								</View>
								<ThemedText className="text-2xl font-bold text-white">
									{formatCurrency(328000000)}
								</ThemedText>
								<ThemedText className="text-sm text-gray-400">Total Revenue</ThemedText>
							</View>

							<View className="flex-1 min-w-[45%] bg-gray-800 p-4 rounded-2xl border border-gray-700">
								<View className="flex-row items-center justify-between mb-2">
									<IconSymbol name="cart.fill" size={24} color="#10B981" />
									<ThemedText className="text-green-400 text-sm font-medium">+8.3%</ThemedText>
								</View>
								<ThemedText className="text-2xl font-bold text-white">1,247</ThemedText>
								<ThemedText className="text-sm text-gray-400">Total Orders</ThemedText>
							</View>

							<View className="flex-1 min-w-[45%] bg-gray-800 p-4 rounded-2xl border border-gray-700">
								<View className="flex-row items-center justify-between mb-2">
									<IconSymbol name="house.fill" size={24} color="#F59E0B" />
									<ThemedText className="text-red-400 text-sm font-medium">-1</ThemedText>
								</View>
								<ThemedText className="text-2xl font-bold text-white">23</ThemedText>
								<ThemedText className="text-sm text-gray-400">Active Partners</ThemedText>
							</View>

							<View className="flex-1 min-w-[45%] bg-gray-800 p-4 rounded-2xl border border-gray-700">
								<View className="flex-row items-center justify-between mb-2">
									<IconSymbol name="star.fill" size={24} color="#EC4899" />
									<ThemedText className="text-green-400 text-sm font-medium">+0.2</ThemedText>
								</View>
								<ThemedText className="text-2xl font-bold text-white">4.6</ThemedText>
								<ThemedText className="text-sm text-gray-400">Avg Rating</ThemedText>
							</View>
						</View>
					</View>

					{/* Top Performing Partners */}
					<View className="px-5 mb-5">
						<ThemedText className="text-lg font-semibold text-white mb-3">
							Top Performing Partners
						</ThemedText>
						<View className="gap-3">
							{topPartners.map((partner, index) => (
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
													{partner.name}
												</ThemedText>
												<View className="flex-row items-center gap-1 mt-1">
													<IconSymbol name="star.fill" size={12} color="#F59E0B" />
													<ThemedText className="text-gray-400 text-sm">
														{partner.rating}
													</ThemedText>
												</View>
											</View>
										</View>
										<View
											className={`px-2 py-1 rounded-full ${
												partner.growth > 0 ? "bg-green-600" : "bg-red-600"
											}`}>
											<ThemedText className="text-white text-xs font-medium">
												{partner.growth > 0 ? "+" : ""}
												{partner.growth}%
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

					<View className="h-20" />
				</ScrollView>
			</ThemedView>
		</Modal>
	);
}
