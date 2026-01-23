import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { supabase } from "@/utils/supabase";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
	View,
} from "react-native";

interface Order {
	id: string;
	order_number: string;
	order_date: string;
	total_amount: number;
	status: string;
	quantity: number;
	unit_price: number;
	customer_name?: string;
	product?: {
		name: string;
		unit_type: string;
	};
	mitra?: {
		company_name: string;
	};
}

interface Delivery {
	id: string;
	delivery_number: string;
	quantity: number;
	unit: string;
	status: string;
	created_at: string;
	actual_delivery_date?: string;
	order?: {
		order_number: string;
		total_amount: number;
	};
}

interface FinancialSummary {
	totalRevenue: number;
	totalOrders: number;
	completedOrders: number;
	pendingOrders: number;
	totalDeliveries: number;
	deliveredCount: number;
}

type TabType = "summary" | "orders" | "deliveries";

export default function KeuanganMenu() {
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState<TabType>("summary");
	const [orders, setOrders] = useState<Order[]>([]);
	const [deliveries, setDeliveries] = useState<Delivery[]>([]);
	const [summary, setSummary] = useState<FinancialSummary>({
		totalRevenue: 0,
		totalOrders: 0,
		completedOrders: 0,
		pendingOrders: 0,
		totalDeliveries: 0,
		deliveredCount: 0,
	});
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
	const [showOrderModal, setShowOrderModal] = useState(false);
	const [showDeliveryModal, setShowDeliveryModal] = useState(false);

	const loadFinancialData = useCallback(async () => {
		setLoading(true);
		try {
			// Get current user's mitra
			const { data: userData, error: userError } = await supabase.auth.getUser();
			if (userError || !userData.user) {
				throw new Error("User not authenticated");
			}

			const { data: mitraData, error: mitraError } = await supabase
				.from("mitra")
				.select("id")
				.eq("created_by", userData.user.id)
				.eq("status", "active")
				.single();

			if (mitraError || !mitraData) {
				console.log("No active mitra found for user");
				setOrders([]);
				setDeliveries([]);
				return;
			}

			// Load orders
			const { data: ordersData, error: ordersError } = await supabase
				.from("orders")
				.select(
					`
          *,
          product:products(name, unit_type),
          mitra:mitra(company_name)
        `,
				)
				.eq("mitra_id", mitraData.id)
				.order("delivery_date", { ascending: false });

			if (ordersError) throw ordersError;

			// Load deliveries
			const { data: deliveriesData, error: deliveriesError } = await supabase
				.from("deliveries")
				.select(
					`
          *,
          order:orders(order_number, total_amount)
        `,
				)
				.eq("mitra_id", mitraData.id)
				.order("created_at", { ascending: false });

			if (deliveriesError) throw deliveriesError;

			setOrders(ordersData || []);
			setDeliveries(deliveriesData || []);

			// Calculate summary
			const totalRevenue = (ordersData || [])
				.filter((o) => o.status === "confirmed")
				.reduce((sum, o) => sum + (o.total_amount || 0), 0);

			const completedOrders = (ordersData || []).filter((o) => o.status === "confirmed").length;

			const pendingOrders = (ordersData || []).filter(
				(o) => o.status === "pending" || o.status === "processing",
			).length;

			const deliveredCount = (deliveriesData || []).filter((d) => d.status === "delivered").length;

			setSummary({
				totalRevenue,
				totalOrders: (ordersData || []).length,
				completedOrders,
				pendingOrders,
				totalDeliveries: (deliveriesData || []).length,
				deliveredCount,
			});
		} catch (error) {
			console.error("Error loading financial data:", error);
			setOrders([]);
			setDeliveries([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadFinancialData();
	}, [loadFinancialData]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadFinancialData();
		setRefreshing(false);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
			case "delivered":
			case "approved":
				return "bg-green-600";
			case "pending":
				return "bg-yellow-600";
			case "processing":
			case "in_transit":
			case "picked_up":
				return "bg-blue-600";
			case "cancelled":
			case "rejected":
				return "bg-red-600";
			default:
				return "bg-gray-600";
		}
	};

	const formatCurrency = (amount: number) => {
		return `Rp ${amount.toLocaleString("id-ID")}`;
	};

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("id-ID", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<ThemedView className="flex-1 bg-black">
			{/* Header */}
			<View className="px-6 py-4 border-b border-gray-800">
				<ThemedText type="title" className="text-2xl font-bold mb-1">
					KEUANGAN
				</ThemedText>
				<ThemedText className="text-gray-400 text-sm">
					Laporan keuangan dari pesanan dan pengiriman
				</ThemedText>
			</View>

			{/* Tab Navigation */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className="bg-gray-800 mx-5 mt-4 rounded-xl p-1 shadow-sm flex-grow-0">
				<View className="flex-row items-center">
					{[
						{ key: "summary", label: "Ringkasan", icon: "chart.bar.fill" },
						{ key: "orders", label: "Pesanan", icon: "bag.fill" },
						{ key: "deliveries", label: "Pengiriman", icon: "truck" },
					].map((tab) => (
						<Pressable
							key={tab.key}
							onPress={() => setActiveTab(tab.key as TabType)}
							className={`flex-row items-center justify-center py-2 px-4 rounded-lg gap-2 ${
								activeTab === tab.key ? "bg-green-900/50" : ""
							}`}>
							<IconSymbol
								name={tab.icon as any}
								size={18}
								color={activeTab === tab.key ? "#22c55e" : "#9CA3AF"}
							/>
							<ThemedText
								className={`text-sm font-semibold ${
									activeTab === tab.key ? "text-green-400" : "text-gray-400"
								}`}>
								{tab.label}
							</ThemedText>
						</Pressable>
					))}
				</View>
			</ScrollView>

			{/* Content */}
			{loading && orders.length === 0 && deliveries.length === 0 ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#22c55e" />
					<ThemedText className="text-gray-400 mt-3">Memuat data keuangan...</ThemedText>
				</View>
			) : (
				<ScrollView
					className="flex-1"
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					showsVerticalScrollIndicator={false}>
					<View className="p-6 gap-4">
						{activeTab === "summary" && (
							<>
								{/* Summary Cards */}
								<View className="gap-4">
									{/* Total Revenue Card */}
									<View className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-2xl">
										<View className="flex-row items-center gap-2 mb-2">
											<IconSymbol name="dollarsign.circle.fill" size={24} color="#fff" />
											<ThemedText className="text-white text-sm opacity-90">
												Total Pendapatan
											</ThemedText>
										</View>
										<ThemedText className="text-white text-3xl font-bold">
											{formatCurrency(summary.totalRevenue)}
										</ThemedText>
										<ThemedText className="text-white text-xs opacity-75 mt-1">
											Dari {summary.completedOrders} pesanan selesai
										</ThemedText>
									</View>

									{/* Stats Grid */}
									<View className="flex-row gap-4">
										<View className="flex-1 bg-gray-900 p-4 rounded-xl border border-gray-800">
											<IconSymbol name="bag.fill" size={20} color="#3B82F6" />
											<ThemedText className="text-2xl font-bold text-white mt-2">
												{summary.totalOrders}
											</ThemedText>
											<ThemedText className="text-gray-400 text-xs">Total Pesanan</ThemedText>
										</View>
										<View className="flex-1 bg-gray-900 p-4 rounded-xl border border-gray-800">
											<IconSymbol name="truck" size={20} color="#F59E0B" />
											<ThemedText className="text-2xl font-bold text-white mt-2">
												{summary.totalDeliveries}
											</ThemedText>
											<ThemedText className="text-gray-400 text-xs">Total Pengiriman</ThemedText>
										</View>
									</View>

									<View className="flex-row gap-4">
										<View className="flex-1 bg-gray-900 p-4 rounded-xl border border-gray-800">
											<IconSymbol name="checkmark.circle.fill" size={20} color="#22c55e" />
											<ThemedText className="text-2xl font-bold text-white mt-2">
												{summary.deliveredCount}
											</ThemedText>
											<ThemedText className="text-gray-400 text-xs">Terkirim</ThemedText>
										</View>
										<View className="flex-1 bg-gray-900 p-4 rounded-xl border border-gray-800">
											<IconSymbol name="bell.fill" size={20} color="#EAB308" />
											<ThemedText className="text-2xl font-bold text-white mt-2">
												{summary.pendingOrders}
											</ThemedText>
											<ThemedText className="text-gray-400 text-xs">Pending</ThemedText>
										</View>
									</View>
								</View>
							</>
						)}

						{activeTab === "orders" && (
							<>
								{orders.length === 0 ? (
									<View className="items-center justify-center py-20">
										<IconSymbol name="bag.fill" size={64} color="#6B7280" />
										<ThemedText className="text-gray-400 text-lg font-medium mt-4">
											Tidak ada pesanan
										</ThemedText>
									</View>
								) : (
									orders.map((order) => (
										<Pressable
											key={order.id}
											onPress={() => {
												setSelectedOrder(order);
												setShowOrderModal(true);
											}}
											className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
											<View className="flex-row items-center justify-between mb-3">
												<View className="flex-1">
													<ThemedText className="text-white font-bold text-lg">
														{order.order_number}
													</ThemedText>
													<ThemedText className="text-gray-400 text-sm">
														{order.customer_name || "Pelanggan"}
													</ThemedText>
												</View>
												<View className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
													<ThemedText className="text-white text-xs font-semibold uppercase">
														{order.status}
													</ThemedText>
												</View>
											</View>

											<View className="border-t border-gray-800 pt-3 gap-2">
												<View className="flex-row justify-between">
													<ThemedText className="text-gray-400 text-sm">Produk:</ThemedText>
													<ThemedText className="text-white text-sm font-semibold">
														{order.product?.name || "N/A"}
													</ThemedText>
												</View>
												<View className="flex-row justify-between">
													<ThemedText className="text-gray-400 text-sm">Jumlah:</ThemedText>
													<ThemedText className="text-white text-sm font-semibold">
														{order.quantity} {order.product?.unit_type || "unit"}
													</ThemedText>
												</View>
												<View className="flex-row justify-between">
													<ThemedText className="text-gray-400 text-sm">Total:</ThemedText>
													<ThemedText className="text-green-400 text-lg font-bold">
														{formatCurrency(order.total_amount)}
													</ThemedText>
												</View>
												<View className="flex-row justify-between">
													<ThemedText className="text-gray-400 text-sm">Tanggal:</ThemedText>
													<ThemedText className="text-white text-sm">
														{formatDate(order.order_date)}
													</ThemedText>
												</View>
											</View>
										</Pressable>
									))
								)}
							</>
						)}

						{activeTab === "deliveries" && (
							<>
								{deliveries.length === 0 ? (
									<View className="items-center justify-center py-20">
										<IconSymbol name="truck" size={64} color="#6B7280" />
										<ThemedText className="text-gray-400 text-lg font-medium mt-4">
											Tidak ada pengiriman
										</ThemedText>
									</View>
								) : (
									deliveries.map((delivery) => (
										<Pressable
											key={delivery.id}
											onPress={() => {
												setSelectedDelivery(delivery);
												setShowDeliveryModal(true);
											}}
											className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
											<View className="flex-row items-center justify-between mb-3">
												<View className="flex-1">
													<ThemedText className="text-white font-bold text-lg">
														{delivery.delivery_number}
													</ThemedText>
													<ThemedText className="text-gray-400 text-sm">
														Order: {delivery.order?.order_number || "N/A"}
													</ThemedText>
												</View>
												<View
													className={`px-3 py-1 rounded-full ${getStatusColor(delivery.status)}`}>
													<ThemedText className="text-white text-xs font-semibold uppercase">
														{delivery.status}
													</ThemedText>
												</View>
											</View>

											<View className="border-t border-gray-800 pt-3 gap-2">
												<View className="flex-row justify-between">
													<ThemedText className="text-gray-400 text-sm">Jumlah:</ThemedText>
													<ThemedText className="text-white text-sm font-semibold">
														{delivery.quantity} {delivery.unit}
													</ThemedText>
												</View>
												{delivery.order && (
													<View className="flex-row justify-between">
														<ThemedText className="text-gray-400 text-sm">Nilai Order:</ThemedText>
														<ThemedText className="text-green-400 text-lg font-bold">
															{formatCurrency(delivery.order.total_amount)}
														</ThemedText>
													</View>
												)}
												<View className="flex-row justify-between">
													<ThemedText className="text-gray-400 text-sm">Dibuat:</ThemedText>
													<ThemedText className="text-white text-sm">
														{formatDate(delivery.created_at)}
													</ThemedText>
												</View>
												{delivery.actual_delivery_date && (
													<View className="flex-row justify-between">
														<ThemedText className="text-gray-400 text-sm">Terkirim:</ThemedText>
														<ThemedText className="text-white text-sm">
															{formatDate(delivery.actual_delivery_date)}
														</ThemedText>
													</View>
												)}
											</View>
										</Pressable>
									))
								)}
							</>
						)}
					</View>
				</ScrollView>
			)}

			{/* Order Detail Modal */}
			{showOrderModal && selectedOrder && (
				<Modal visible={showOrderModal} animationType="slide" presentationStyle="pageSheet">
					<ThemedView className="flex-1 bg-black">
						<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
							<View className="flex-1">
								<ThemedText type="title" className="text-xl font-bold text-white">
									Detail Pesanan
								</ThemedText>
								<ThemedText className="text-gray-400 text-sm">
									{selectedOrder.order_number}
								</ThemedText>
							</View>
							<Pressable
								onPress={() => {
									setShowOrderModal(false);
									setSelectedOrder(null);
								}}
								className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
								<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
							</Pressable>
						</View>

						<ScrollView className="flex-1 px-6 pt-4">
							<View className="gap-4">
								<View className="bg-gray-900 p-4 rounded-xl border border-gray-800">
									<ThemedText className="text-gray-400 text-sm mb-2">Status</ThemedText>
									<View
										className={`px-3 py-2 rounded-lg ${getStatusColor(selectedOrder.status)} self-start`}>
										<ThemedText className="text-white font-semibold uppercase">
											{selectedOrder.status}
										</ThemedText>
									</View>
								</View>

								<View className="bg-gray-900 p-4 rounded-xl border border-gray-800 gap-3">
									<View className="flex-row justify-between">
										<ThemedText className="text-gray-400">Produk:</ThemedText>
										<ThemedText className="text-white font-semibold text-right flex-1 ml-4">
											{selectedOrder.product?.name || "N/A"}
										</ThemedText>
									</View>
									<View className="flex-row justify-between">
										<ThemedText className="text-gray-400">Pelanggan:</ThemedText>
										<ThemedText className="text-white font-semibold">
											{selectedOrder.customer_name || "N/A"}
										</ThemedText>
									</View>
									<View className="flex-row justify-between">
										<ThemedText className="text-gray-400">Jumlah:</ThemedText>
										<ThemedText className="text-white font-semibold">
											{selectedOrder.quantity} {selectedOrder.product?.unit_type || "unit"}
										</ThemedText>
									</View>
									<View className="flex-row justify-between">
										<ThemedText className="text-gray-400">Harga Satuan:</ThemedText>
										<ThemedText className="text-white font-semibold">
											{formatCurrency(selectedOrder.unit_price)}
										</ThemedText>
									</View>
									<View className="border-t border-gray-800 pt-3">
										<View className="flex-row justify-between">
											<ThemedText className="text-gray-400 text-lg">Total:</ThemedText>
											<ThemedText className="text-green-400 text-2xl font-bold">
												{formatCurrency(selectedOrder.total_amount)}
											</ThemedText>
										</View>
									</View>
									<View className="flex-row justify-between">
										<ThemedText className="text-gray-400">Tanggal Order:</ThemedText>
										<ThemedText className="text-white font-semibold">
											{formatDate(selectedOrder.order_date)}
										</ThemedText>
									</View>
								</View>
							</View>
						</ScrollView>
					</ThemedView>
				</Modal>
			)}

			{/* Delivery Detail Modal */}
			{showDeliveryModal && selectedDelivery && (
				<Modal visible={showDeliveryModal} animationType="slide" presentationStyle="pageSheet">
					<ThemedView className="flex-1 bg-black">
						<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
							<View className="flex-1">
								<ThemedText type="title" className="text-xl font-bold text-white">
									Detail Pengiriman
								</ThemedText>
								<ThemedText className="text-gray-400 text-sm">
									{selectedDelivery.delivery_number}
								</ThemedText>
							</View>
							<Pressable
								onPress={() => {
									setShowDeliveryModal(false);
									setSelectedDelivery(null);
								}}
								className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
								<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
							</Pressable>
						</View>

						<ScrollView className="flex-1 px-6 pt-4">
							<View className="gap-4">
								<View className="bg-gray-900 p-4 rounded-xl border border-gray-800">
									<ThemedText className="text-gray-400 text-sm mb-2">Status</ThemedText>
									<View
										className={`px-3 py-2 rounded-lg ${getStatusColor(selectedDelivery.status)} self-start`}>
										<ThemedText className="text-white font-semibold uppercase">
											{selectedDelivery.status}
										</ThemedText>
									</View>
								</View>

								<View className="bg-gray-900 p-4 rounded-xl border border-gray-800 gap-3">
									<View className="flex-row justify-between">
										<ThemedText className="text-gray-400">Nomor Order:</ThemedText>
										<ThemedText className="text-white font-semibold">
											{selectedDelivery.order?.order_number || "N/A"}
										</ThemedText>
									</View>
									<View className="flex-row justify-between">
										<ThemedText className="text-gray-400">Jumlah:</ThemedText>
										<ThemedText className="text-white font-semibold">
											{selectedDelivery.quantity} {selectedDelivery.unit}
										</ThemedText>
									</View>
									{selectedDelivery.order && (
										<View className="border-t border-gray-800 pt-3">
											<View className="flex-row justify-between">
												<ThemedText className="text-gray-400 text-lg">Nilai Order:</ThemedText>
												<ThemedText className="text-green-400 text-2xl font-bold">
													{formatCurrency(selectedDelivery.order.total_amount)}
												</ThemedText>
											</View>
										</View>
									)}
									<View className="flex-row justify-between">
										<ThemedText className="text-gray-400">Dibuat:</ThemedText>
										<ThemedText className="text-white font-semibold">
											{formatDate(selectedDelivery.created_at)}
										</ThemedText>
									</View>
									{selectedDelivery.actual_delivery_date && (
										<View className="flex-row justify-between">
											<ThemedText className="text-gray-400">Terkirim:</ThemedText>
											<ThemedText className="text-white font-semibold">
												{formatDate(selectedDelivery.actual_delivery_date)}
											</ThemedText>
										</View>
									)}
								</View>
							</View>
						</ScrollView>
					</ThemedView>
				</Modal>
			)}
		</ThemedView>
	);
}
