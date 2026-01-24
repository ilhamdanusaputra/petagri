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

type PeriodType = "today" | "week" | "month" | "year";
type ReportType = "sales" | "products" | "deliveries" | "customers";

interface SalesReport {
	totalOrders: number;
	totalRevenue: number;
	completedOrders: number;
	pendingOrders: number;
	averageOrderValue: number;
	comparisonPercent: number;
}

interface ProductPerformance {
	productId: string;
	productName: string;
	totalOrders: number;
	totalQuantity: number;
	totalRevenue: number;
	unitType: string;
}

interface DeliveryReport {
	totalDeliveries: number;
	deliveredCount: number;
	inTransitCount: number;
	pendingCount: number;
	onTimeRate: number;
}

interface CustomerReport {
	customerName: string;
	totalOrders: number;
	totalSpent: number;
	lastOrderDate: string;
}

export default function LaporanMenu() {
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [activeReport, setActiveReport] = useState<ReportType>("sales");
	const [activePeriod, setActivePeriod] = useState<PeriodType>("month");
	const [mitraId, setMitraId] = useState<string | null>(null);

	// Report data
	const [salesReport, setSalesReport] = useState<SalesReport>({
		totalOrders: 0,
		totalRevenue: 0,
		completedOrders: 0,
		pendingOrders: 0,
		averageOrderValue: 0,
		comparisonPercent: 0,
	});
	const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
	const [deliveryReport, setDeliveryReport] = useState<DeliveryReport>({
		totalDeliveries: 0,
		deliveredCount: 0,
		inTransitCount: 0,
		pendingCount: 0,
		onTimeRate: 0,
	});
	const [customerReport, setCustomerReport] = useState<CustomerReport[]>([]);

	const [selectedProduct, setSelectedProduct] = useState<ProductPerformance | null>(null);
	const [showProductModal, setShowProductModal] = useState(false);

	const getDateRange = (period: PeriodType) => {
		const now = new Date();
		let startDate = new Date();

		switch (period) {
			case "today":
				startDate.setHours(0, 0, 0, 0);
				break;
			case "week":
				startDate.setDate(now.getDate() - 7);
				break;
			case "month":
				startDate.setMonth(now.getMonth() - 1);
				break;
			case "year":
				startDate.setFullYear(now.getFullYear() - 1);
				break;
		}

		return { startDate: startDate.toISOString(), endDate: now.toISOString() };
	};

	const loadMitraId = useCallback(async () => {
		try {
			const { data: userData, error: userError } = await supabase.auth.getUser();
			if (userError || !userData.user) return;

			const { data: mitraData, error: mitraError } = await supabase
				.from("mitra")
				.select("id")
				.eq("created_by", userData.user.id)
				.eq("status", "active")
				.single();

			if (mitraData) {
				setMitraId(mitraData.id);
			}
		} catch (error) {
			console.error("Error loading mitra:", error);
		}
	}, []);

	const loadSalesReport = useCallback(async () => {
		if (!mitraId) return;

		const { startDate, endDate } = getDateRange(activePeriod);

		try {
			// Current period orders
			const { data: currentOrders, error } = await supabase
				.from("orders")
				.select("*")
				.eq("mitra_id", mitraId)
				.gte("created_at", startDate)
				.lte("created_at", endDate);

			if (error) throw error;

			const totalRevenue = (currentOrders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
			const completedOrders = (currentOrders || []).filter((o) => o.status === "confirmed").length;
			const pendingOrders = (currentOrders || []).filter((o) => o.status === "pending").length;
			const avgOrderValue = currentOrders?.length ? totalRevenue / currentOrders.length : 0;

			// Previous period for comparison
			const prevStart = new Date(startDate);
			const prevEnd = new Date(startDate);
			const periodDiff = new Date(endDate).getTime() - new Date(startDate).getTime();
			prevStart.setTime(prevStart.getTime() - periodDiff);

			const { data: prevOrders } = await supabase
				.from("orders")
				.select("total_amount")
				.eq("mitra_id", mitraId)
				.gte("created_at", prevStart.toISOString())
				.lte("created_at", prevEnd.toISOString());

			const prevRevenue = (prevOrders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
			const comparisonPercent =
				prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

			setSalesReport({
				totalOrders: currentOrders?.length || 0,
				totalRevenue,
				completedOrders,
				pendingOrders,
				averageOrderValue: avgOrderValue,
				comparisonPercent,
			});
		} catch (error) {
			console.error("Error loading sales report:", error);
		}
	}, [mitraId, activePeriod]);

	const loadProductPerformance = useCallback(async () => {
		if (!mitraId) return;

		const { startDate, endDate } = getDateRange(activePeriod);

		try {
			const { data: orders, error } = await supabase
				.from("orders")
				.select(
					`
          product_id,
          items_count,
          total_amount,
          product:products(name, unit_type)
        `,
				)
				.eq("mitra_id", mitraId)
				.gte("created_at", startDate)
				.lte("created_at", endDate);

			if (error) throw error;

			// Group by product
			const productMap = new Map<string, ProductPerformance>();

			(orders || []).forEach((order: any) => {
				if (!order.product_id) return;

				const existing = productMap.get(order.product_id);
				if (existing) {
					existing.totalOrders += 1;
					existing.totalQuantity += order.items_count || 0;
					existing.totalRevenue += order.total_amount || 0;
				} else {
					productMap.set(order.product_id, {
						productId: order.product_id,
						productName: order.product?.name || "Unknown",
						totalOrders: 1,
						totalQuantity: order.items_count || 0,
						totalRevenue: order.total_amount || 0,
						unitType: order.product?.unit_type || "unit",
					});
				}
			});

			const performance = Array.from(productMap.values()).sort(
				(a, b) => b.totalRevenue - a.totalRevenue,
			);

			setProductPerformance(performance);
		} catch (error) {
			console.error("Error loading product performance:", error);
		}
	}, [mitraId, activePeriod]);

	const loadDeliveryReport = useCallback(async () => {
		if (!mitraId) return;

		const { startDate, endDate } = getDateRange(activePeriod);

		try {
			const { data: deliveries, error } = await supabase
				.from("deliveries")
				.select("*")
				.eq("mitra_id", mitraId)
				.gte("created_at", startDate)
				.lte("created_at", endDate);

			if (error) throw error;

			const deliveredCount = (deliveries || []).filter(
				(d) => d.status === "delivered" || d.status === "approved",
			).length;
			const inTransitCount = (deliveries || []).filter(
				(d) => d.status === "in_transit" || d.status === "picked_up" || d.status === "arrived",
			).length;
			const pendingCount = (deliveries || []).filter((d) => d.status === "pending").length;

			// Calculate on-time rate (deliveries with actual_delivery_date <= scheduled_delivery_date)
			const onTimeDeliveries = (deliveries || []).filter((d) => {
				if (!d.actual_delivery_date || !d.scheduled_delivery_date) return false;
				return new Date(d.actual_delivery_date) <= new Date(d.scheduled_delivery_date);
			}).length;

			const completedDeliveries = (deliveries || []).filter((d) => d.actual_delivery_date).length;
			const onTimeRate =
				completedDeliveries > 0 ? (onTimeDeliveries / completedDeliveries) * 100 : 0;

			setDeliveryReport({
				totalDeliveries: deliveries?.length || 0,
				deliveredCount,
				inTransitCount,
				pendingCount,
				onTimeRate,
			});
		} catch (error) {
			console.error("Error loading delivery report:", error);
		}
	}, [mitraId, activePeriod]);

	const loadCustomerReport = useCallback(async () => {
		if (!mitraId) return;

		const { startDate, endDate } = getDateRange(activePeriod);

		try {
			const { data: orders, error } = await supabase
				.from("orders")
				.select("customer_name, total_amount, delivery_date")
				.eq("mitra_id", mitraId)
				.gte("delivery_date", startDate)
				.lte("delivery_date", endDate)
				.not("customer_name", "is", null)
				.order("delivery_date", { ascending: false });

			if (error) throw error;

			// Group by customer
			const customerMap = new Map<string, CustomerReport>();

			(orders || []).forEach((order: any) => {
				if (!order.customer_name) return;

				const existing = customerMap.get(order.customer_name);
				if (existing) {
					existing.totalOrders += 1;
					existing.totalSpent += order.total_amount || 0;
					// Keep the latest order date
					if (new Date(order.delivery_date) > new Date(existing.lastOrderDate)) {
						existing.lastOrderDate = order.delivery_date;
					}
				} else {
					customerMap.set(order.customer_name, {
						customerName: order.customer_name,
						totalOrders: 1,
						totalSpent: order.total_amount || 0,
						lastOrderDate: order.delivery_date,
					});
				}
			});

			const customers = Array.from(customerMap.values()).sort(
				(a, b) => b.totalSpent - a.totalSpent,
			);

			setCustomerReport(customers);
		} catch (error) {
			console.error("Error loading customer report:", error);
		}
	}, [mitraId, activePeriod]);

	const loadReportData = useCallback(async () => {
		if (!mitraId) return;

		setLoading(true);
		try {
			switch (activeReport) {
				case "sales":
					await loadSalesReport();
					break;
				case "products":
					await loadProductPerformance();
					break;
				case "deliveries":
					await loadDeliveryReport();
					break;
				case "customers":
					await loadCustomerReport();
					break;
			}
		} finally {
			setLoading(false);
		}
	}, [
		activeReport,
		mitraId,
		loadSalesReport,
		loadProductPerformance,
		loadDeliveryReport,
		loadCustomerReport,
	]);

	useEffect(() => {
		loadMitraId();
	}, [loadMitraId]);

	useEffect(() => {
		if (mitraId) {
			loadReportData();
		}
	}, [mitraId, loadReportData]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadReportData();
		setRefreshing(false);
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

	const formatNumber = (num: number) => {
		return num.toLocaleString("id-ID");
	};

	const getPeriodLabel = (period: PeriodType) => {
		switch (period) {
			case "today":
				return "Hari Ini";
			case "week":
				return "7 Hari";
			case "month":
				return "30 Hari";
			case "year":
				return "1 Tahun";
		}
	};

	return (
		<ThemedView className="flex-1 bg-black">
			{/* Period Selector */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className="bg-gray-900 mx-5 mt-4 rounded-xl p-1 flex-grow-0">
				<View className="flex-row items-center">
					{(["today", "week", "month", "year"] as PeriodType[]).map((period) => (
						<Pressable
							key={period}
							onPress={() => setActivePeriod(period)}
							className={`py-2 px-4 rounded-lg ${
								activePeriod === period ? "bg-green-900/50" : ""
							}`}>
							<ThemedText
								className={`text-sm font-semibold ${
									activePeriod === period ? "text-green-400" : "text-gray-400"
								}`}>
								{getPeriodLabel(period)}
							</ThemedText>
						</Pressable>
					))}
				</View>
			</ScrollView>

			{/* Report Type Tabs */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className="bg-gray-800 mx-5 mt-3 rounded-xl p-1 flex-grow-0">
				<View className="flex-row items-center">
					{[
						{ key: "sales", label: "Penjualan", icon: "chart.bar.fill" },
						{ key: "products", label: "Produk", icon: "leaf.fill" },
						{ key: "deliveries", label: "Pengiriman", icon: "truck" },
						{ key: "customers", label: "Pelanggan", icon: "person.fill" },
					].map((tab) => (
						<Pressable
							key={tab.key}
							onPress={() => setActiveReport(tab.key as ReportType)}
							className={`flex-row items-center justify-center py-2 px-4 rounded-lg gap-2 ${
								activeReport === tab.key ? "bg-green-900/50" : ""
							}`}>
							<IconSymbol
								name={tab.icon as any}
								size={18}
								color={activeReport === tab.key ? "#22c55e" : "#9CA3AF"}
							/>
							<ThemedText
								className={`text-sm font-semibold ${
									activeReport === tab.key ? "text-green-400" : "text-gray-400"
								}`}>
								{tab.label}
							</ThemedText>
						</Pressable>
					))}
				</View>
			</ScrollView>

			{/* Content */}
			{loading && !refreshing ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#22c55e" />
					<ThemedText className="text-gray-400 mt-3">Memuat laporan...</ThemedText>
				</View>
			) : (
				<ScrollView
					className="flex-1"
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					showsVerticalScrollIndicator={false}>
					<View className="p-6 gap-4">
						{/* Sales Report */}
						{activeReport === "sales" && (
							<>
								{/* Comparison Badge */}
								{salesReport.comparisonPercent !== 0 && (
									<View className="bg-gray-900 p-4 rounded-xl border border-gray-800">
										<View className="flex-row items-center gap-2">
											<IconSymbol
												name={salesReport.comparisonPercent > 0 ? "arrow.up" : "arrow.down"}
												size={20}
												color={salesReport.comparisonPercent > 0 ? "#22c55e" : "#ef4444"}
											/>
											<ThemedText
												className={`text-lg font-bold ${
													salesReport.comparisonPercent > 0 ? "text-green-400" : "text-red-400"
												}`}>
												{salesReport.comparisonPercent > 0 ? "+" : ""}
												{salesReport.comparisonPercent.toFixed(1)}%
											</ThemedText>
											<ThemedText className="text-gray-400 text-sm">
												vs periode sebelumnya
											</ThemedText>
										</View>
									</View>
								)}

								{/* Revenue Card */}
								<View className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-2xl">
									<View className="flex-row items-center gap-2 mb-2">
										<IconSymbol name="dollarsign.circle.fill" size={24} color="#fff" />
										<ThemedText className="text-white text-sm opacity-90">
											Total Pendapatan
										</ThemedText>
									</View>
									<ThemedText className="text-white text-3xl font-bold">
										{formatCurrency(salesReport.totalRevenue)}
									</ThemedText>
									<ThemedText className="text-white text-xs opacity-75 mt-1">
										Periode: {getPeriodLabel(activePeriod)}
									</ThemedText>
								</View>

								{/* Stats Grid */}
								<View className="gap-4">
									<View className="flex-row gap-4">
										<View className="flex-1 bg-gray-900 p-4 rounded-xl border border-gray-800">
											<IconSymbol name="bag.fill" size={20} color="#3B82F6" />
											<ThemedText className="text-2xl font-bold text-white mt-2">
												{formatNumber(salesReport.totalOrders)}
											</ThemedText>
											<ThemedText className="text-gray-400 text-xs">Total Pesanan</ThemedText>
										</View>
										<View className="flex-1 bg-gray-900 p-4 rounded-xl border border-gray-800">
											<IconSymbol name="checkmark.circle.fill" size={20} color="#22c55e" />
											<ThemedText className="text-2xl font-bold text-white mt-2">
												{formatNumber(salesReport.completedOrders)}
											</ThemedText>
											<ThemedText className="text-gray-400 text-xs">Selesai</ThemedText>
										</View>
									</View>

									<View className="flex-row gap-4">
										<View className="flex-1 bg-gray-900 p-4 rounded-xl border border-gray-800">
											<IconSymbol name="clock.fill" size={20} color="#EAB308" />
											<ThemedText className="text-2xl font-bold text-white mt-2">
												{formatNumber(salesReport.pendingOrders)}
											</ThemedText>
											<ThemedText className="text-gray-400 text-xs">Pending</ThemedText>
										</View>
										<View className="flex-1 bg-gray-900 p-4 rounded-xl border border-gray-800">
											<IconSymbol name="chart.line.uptrend.xyaxis" size={20} color="#A855F7" />
											<ThemedText className="text-2xl font-bold text-white mt-2">
												{formatCurrency(salesReport.averageOrderValue)}
											</ThemedText>
											<ThemedText className="text-gray-400 text-xs">Rata-rata Order</ThemedText>
										</View>
									</View>
								</View>
							</>
						)}

						{/* Product Performance */}
						{activeReport === "products" && (
							<>
								{productPerformance.length === 0 ? (
									<View className="items-center justify-center py-20">
										<IconSymbol name="leaf.fill" size={64} color="#6B7280" />
										<ThemedText className="text-gray-400 text-lg font-medium mt-4">
											Tidak ada data produk
										</ThemedText>
									</View>
								) : (
									<>
										<View className="bg-gray-900 p-4 rounded-xl border border-gray-800">
											<ThemedText className="text-white font-bold text-lg mb-2">
												Top {productPerformance.length} Produk
											</ThemedText>
											<ThemedText className="text-gray-400 text-sm">
												Berdasarkan total pendapatan dalam{" "}
												{getPeriodLabel(activePeriod).toLowerCase()}
											</ThemedText>
										</View>

										{productPerformance.map((product, index) => (
											<Pressable
												key={product.productId}
												onPress={() => {
													setSelectedProduct(product);
													setShowProductModal(true);
												}}
												className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
												<View className="flex-row items-center gap-3 mb-3">
													<View className="w-10 h-10 bg-green-900/30 rounded-full items-center justify-center">
														<ThemedText className="text-green-400 font-bold text-lg">
															{index + 1}
														</ThemedText>
													</View>
													<View className="flex-1">
														<ThemedText className="text-white font-bold text-lg">
															{product.productName}
														</ThemedText>
														<ThemedText className="text-gray-400 text-sm">
															{formatNumber(product.totalOrders)} pesanan
														</ThemedText>
													</View>
												</View>

												<View className="border-t border-gray-800 pt-3 gap-2">
													<View className="flex-row justify-between">
														<ThemedText className="text-gray-400 text-sm">
															Total Terjual:
														</ThemedText>
														<ThemedText className="text-white font-semibold">
															{formatNumber(product.totalQuantity)} {product.unitType}
														</ThemedText>
													</View>
													<View className="flex-row justify-between">
														<ThemedText className="text-gray-400 text-sm">Pendapatan:</ThemedText>
														<ThemedText className="text-green-400 font-bold text-lg">
															{formatCurrency(product.totalRevenue)}
														</ThemedText>
													</View>
												</View>
											</Pressable>
										))}
									</>
								)}
							</>
						)}

						{/* Delivery Report */}
						{activeReport === "deliveries" && (
							<>
								{/* On-Time Rate */}
								<View className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl">
									<View className="flex-row items-center gap-2 mb-2">
										<IconSymbol name="timer" size={24} color="#fff" />
										<ThemedText className="text-white text-sm opacity-90">
											Tingkat Ketepatan Waktu
										</ThemedText>
									</View>
									<ThemedText className="text-white text-3xl font-bold">
										{deliveryReport.onTimeRate.toFixed(1)}%
									</ThemedText>
									<ThemedText className="text-white text-xs opacity-75 mt-1">
										Dari pengiriman yang telah selesai
									</ThemedText>
								</View>

								{/* Delivery Stats */}
								<View className="gap-4">
									<View className="flex-row gap-4">
										<View className="flex-1 bg-gray-900 p-4 rounded-xl border border-gray-800">
											<IconSymbol name="truck" size={20} color="#F59E0B" />
											<ThemedText className="text-2xl font-bold text-white mt-2">
												{formatNumber(deliveryReport.totalDeliveries)}
											</ThemedText>
											<ThemedText className="text-gray-400 text-xs">Total Pengiriman</ThemedText>
										</View>
										<View className="flex-1 bg-gray-900 p-4 rounded-xl border border-gray-800">
											<IconSymbol name="checkmark.circle.fill" size={20} color="#22c55e" />
											<ThemedText className="text-2xl font-bold text-white mt-2">
												{formatNumber(deliveryReport.deliveredCount)}
											</ThemedText>
											<ThemedText className="text-gray-400 text-xs">Terkirim</ThemedText>
										</View>
									</View>

									<View className="flex-row gap-4">
										<View className="flex-1 bg-gray-900 p-4 rounded-xl border border-gray-800">
											<IconSymbol name="arrow.forward.circle.fill" size={20} color="#3B82F6" />
											<ThemedText className="text-2xl font-bold text-white mt-2">
												{formatNumber(deliveryReport.inTransitCount)}
											</ThemedText>
											<ThemedText className="text-gray-400 text-xs">Dalam Perjalanan</ThemedText>
										</View>
										<View className="flex-1 bg-gray-900 p-4 rounded-xl border border-gray-800">
											<IconSymbol name="clock.fill" size={20} color="#EAB308" />
											<ThemedText className="text-2xl font-bold text-white mt-2">
												{formatNumber(deliveryReport.pendingCount)}
											</ThemedText>
											<ThemedText className="text-gray-400 text-xs">Pending</ThemedText>
										</View>
									</View>
								</View>
							</>
						)}

						{/* Customer Report */}
						{activeReport === "customers" && (
							<>
								{customerReport.length === 0 ? (
									<View className="items-center justify-center py-20">
										<IconSymbol name="person.fill" size={64} color="#6B7280" />
										<ThemedText className="text-gray-400 text-lg font-medium mt-4">
											Tidak ada data pelanggan
										</ThemedText>
									</View>
								) : (
									<>
										<View className="bg-gray-900 p-4 rounded-xl border border-gray-800">
											<ThemedText className="text-white font-bold text-lg mb-2">
												Top {customerReport.length} Pelanggan
											</ThemedText>
											<ThemedText className="text-gray-400 text-sm">
												Berdasarkan total pembelian dalam{" "}
												{getPeriodLabel(activePeriod).toLowerCase()}
											</ThemedText>
										</View>

										{customerReport.map((customer, index) => (
											<View
												key={customer.customerName}
												className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
												<View className="flex-row items-center gap-3 mb-3">
													<View className="w-10 h-10 bg-purple-900/30 rounded-full items-center justify-center">
														<ThemedText className="text-purple-400 font-bold text-lg">
															{index + 1}
														</ThemedText>
													</View>
													<View className="flex-1">
														<ThemedText className="text-white font-bold text-lg">
															{customer.customerName}
														</ThemedText>
														<ThemedText className="text-gray-400 text-sm">
															{formatNumber(customer.totalOrders)} pesanan
														</ThemedText>
													</View>
												</View>

												<View className="border-t border-gray-800 pt-3 gap-2">
													<View className="flex-row justify-between">
														<ThemedText className="text-gray-400 text-sm">
															Total Belanja:
														</ThemedText>
														<ThemedText className="text-green-400 font-bold text-lg">
															{formatCurrency(customer.totalSpent)}
														</ThemedText>
													</View>
													<View className="flex-row justify-between">
														<ThemedText className="text-gray-400 text-sm">
															Terakhir Order:
														</ThemedText>
														<ThemedText className="text-white font-semibold">
															{formatDate(customer.lastOrderDate)}
														</ThemedText>
													</View>
												</View>
											</View>
										))}
									</>
								)}
							</>
						)}
					</View>
				</ScrollView>
			)}

			{/* Product Detail Modal */}
			{showProductModal && selectedProduct && (
				<Modal visible={showProductModal} animationType="slide" presentationStyle="pageSheet">
					<ThemedView className="flex-1 bg-black">
						<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
							<View className="flex-1">
								<ThemedText type="title" className="text-xl font-bold text-white">
									Detail Performa Produk
								</ThemedText>
								<ThemedText className="text-gray-400 text-sm">
									{selectedProduct.productName}
								</ThemedText>
							</View>
							<Pressable
								onPress={() => {
									setShowProductModal(false);
									setSelectedProduct(null);
								}}
								className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
								<IconSymbol name="xmark" size={16} color="#9CA3AF" />
							</Pressable>
						</View>

						<ScrollView className="flex-1 px-6 pt-4">
							<View className="gap-4">
								<View className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-2xl">
									<ThemedText className="text-white text-sm opacity-90 mb-2">
										Total Pendapatan
									</ThemedText>
									<ThemedText className="text-white text-3xl font-bold">
										{formatCurrency(selectedProduct.totalRevenue)}
									</ThemedText>
									<ThemedText className="text-white text-xs opacity-75 mt-1">
										Periode: {getPeriodLabel(activePeriod)}
									</ThemedText>
								</View>

								<View className="bg-gray-900 p-4 rounded-xl border border-gray-800 gap-3">
									<View className="flex-row justify-between">
										<ThemedText className="text-gray-400">Total Pesanan:</ThemedText>
										<ThemedText className="text-white font-bold text-lg">
											{formatNumber(selectedProduct.totalOrders)}
										</ThemedText>
									</View>
									<View className="flex-row justify-between">
										<ThemedText className="text-gray-400">Total Terjual:</ThemedText>
										<ThemedText className="text-white font-bold text-lg">
											{formatNumber(selectedProduct.totalQuantity)} {selectedProduct.unitType}
										</ThemedText>
									</View>
									<View className="flex-row justify-between">
										<ThemedText className="text-gray-400">Rata-rata per Order:</ThemedText>
										<ThemedText className="text-white font-bold text-lg">
											{formatNumber(
												Math.round(selectedProduct.totalQuantity / selectedProduct.totalOrders),
											)}{" "}
											{selectedProduct.unitType}
										</ThemedText>
									</View>
									<View className="flex-row justify-between">
										<ThemedText className="text-gray-400">Nilai Rata-rata:</ThemedText>
										<ThemedText className="text-white font-bold text-lg">
											{formatCurrency(
												Math.round(selectedProduct.totalRevenue / selectedProduct.totalOrders),
											)}
										</ThemedText>
									</View>
								</View>
							</View>
						</ScrollView>
					</ThemedView>
				</Modal>
			)}
		</ThemedView>
	);
}
