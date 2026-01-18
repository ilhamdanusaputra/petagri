// ================================================
// Inventory Modal
// Description: Modal for managing stock levels, alerts, and inventory tracking
// ================================================

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProductService } from "@/services/product";
import { CurrentStock, InventoryAlert, Product, StockMovement } from "@/types/product";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

interface InventoryModalProps {
	visible: boolean;
	onClose: () => void;
}

type TabType = "overview" | "movements" | "alerts" | "adjustment";

export function InventoryModal({ visible, onClose }: InventoryModalProps) {
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState<TabType>("overview");
	const [currentStock, setCurrentStock] = useState<CurrentStock[]>([]);
	const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
	const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [products, setProducts] = useState<Product[]>([]);
	const [showLowStockOnly, setShowLowStockOnly] = useState(false);
	const [showProductSelector, setShowProductSelector] = useState(false);
	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [adjustmentForm, setAdjustmentForm] = useState({
		productId: "",
		productName: "",
		currentStock: 0,
		quantity: "",
		reason: "",
		notes: "",
	});

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			await Promise.all([
				loadCurrentStock(),
				loadStockMovements(),
				loadInventoryAlerts(),
				loadProducts(),
			]);
		} catch (error) {
			console.error("Error loading inventory data:", error);
			Alert.alert("Error", "Gagal memuat data inventaris. Silakan coba lagi.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (visible) {
			loadData();
		} else {
			// Cleanup on close
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
				searchTimeoutRef.current = null;
			}
			// Reset state
			setSearchQuery("");
			setShowProductSelector(false);
			setAdjustmentForm({
				productId: "",
				productName: "",
				currentStock: 0,
				quantity: "",
				reason: "",
				notes: "",
			});
		}
	}, [visible, loadData]);

	const loadCurrentStock = async () => {
		try {
			// Use mock data since getCurrentStock method doesn't exist yet
			const response = await ProductService.getProducts({
				per_page: 100,
				status: ["active", "draft"],
				sort_by: "name",
			});

			// Transform products to current stock format
			const stockData: CurrentStock[] = response.data.map((product) => ({
				product_id: product.id,
				product_name: product.name,
				sku: product.sku,
				stock_quantity: product.stock_quantity,
				low_stock_threshold: product.min_stock_level,
				track_inventory: true,
				stock_status:
					product.stock_quantity === 0
						? "out_of_stock"
						: product.stock_quantity <= product.min_stock_level
							? "low_stock"
							: product.stock_quantity > product.min_stock_level * 3
								? "overstock"
								: "normal",
				total_stock_in: 0, // Would come from transactions
				total_stock_out: 0, // Would come from transactions
				transaction_count: 0,
				last_transaction_date: product.updated_at,
			}));

			setCurrentStock(stockData);
		} catch (error) {
			console.error("Error loading current stock:", error);
			throw error;
		}
	};

	const loadStockMovements = async () => {
		try {
			// Mock data since getStockMovements method doesn't exist yet
			const movements: StockMovement[] = [];
			setStockMovements(movements);
		} catch (error) {
			console.error("Error loading stock movements:", error);
			throw error;
		}
	};

	const loadInventoryAlerts = async () => {
		try {
			// Mock data since getInventoryAlerts method doesn't exist yet
			const alerts: InventoryAlert[] = [];
			setInventoryAlerts(alerts);
		} catch (error) {
			console.error("Error loading inventory alerts:", error);
			throw error;
		}
	};

	const loadProducts = async () => {
		try {
			const response = await ProductService.getProducts({
				per_page: 100,
				status: ["active", "draft"],
				sort_by: "name",
				sort_direction: "asc",
			});
			setProducts(response.data);
		} catch (error) {
			console.error("Error loading products:", error);
			throw error;
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadData();
		setRefreshing(false);
	};

	const handleAcknowledgeAlert = async (alertId: string) => {
		try {
			setLoading(true);
			// Mock acknowledge since method doesn't exist yet
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Remove alert from local state
			setInventoryAlerts((prev) => prev.filter((alert) => alert.id !== alertId));

			Alert.alert("Sukses", "Alert berhasil dikonfirmasi");
		} catch (error) {
			console.error("Error acknowledging alert:", error);
			Alert.alert("Error", "Gagal mengkonfirmasi alert. Silakan coba lagi.");
		} finally {
			setLoading(false);
		}
	};

	const handleStockAdjustment = async () => {
		if (!adjustmentForm.productId || !adjustmentForm.quantity) {
			Alert.alert("Error", "Produk dan jumlah harus diisi");
			return;
		}

		const quantity = parseInt(adjustmentForm.quantity);
		if (isNaN(quantity) || quantity < 0) {
			Alert.alert("Error", "Jumlah harus berupa angka positif");
			return;
		}

		if (quantity === adjustmentForm.currentStock) {
			Alert.alert("Info", "Jumlah stok tidak berubah");
			return;
		}

		Alert.alert(
			"Konfirmasi",
			`Ubah stok ${adjustmentForm.productName} dari ${adjustmentForm.currentStock} menjadi ${quantity}?`,
			[
				{ text: "Batal", style: "cancel" },
				{
					text: "Konfirmasi",
					onPress: async () => {
						try {
							setLoading(true);

							// Update product stock using existing updateProduct method
							await ProductService.updateProduct(adjustmentForm.productId, {
								stock_quantity: quantity,
							});

							// Reset form and reload data
							setAdjustmentForm({
								productId: "",
								productName: "",
								currentStock: 0,
								quantity: "",
								reason: "",
								notes: "",
							});
							await loadData();

							Alert.alert("Sukses", "Stok berhasil disesuaikan");
						} catch (error) {
							console.error("Error adjusting stock:", error);
							Alert.alert("Error", "Gagal menyesuaikan stok. Silakan coba lagi.");
						} finally {
							setLoading(false);
						}
					},
				},
			],
		);
	};

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

	const filterCurrentStock = () => {
		return currentStock.filter((stock) => {
			const matchesSearch =
				!searchQuery ||
				stock.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				stock.sku.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesFilter =
				!showLowStockOnly ||
				stock.stock_status === "low_stock" ||
				stock.stock_status === "out_of_stock";

			return matchesSearch && matchesFilter;
		});
	};

	const handleSelectProduct = (product: Product) => {
		setAdjustmentForm({
			productId: product.id,
			productName: product.name,
			currentStock: product.stock_quantity,
			quantity: product.stock_quantity.toString(),
			reason: "",
			notes: "",
		});
		setShowProductSelector(false);
	};

	const filterProducts = () => {
		if (!showProductSelector) return [];
		return products.filter(
			(product) =>
				product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.sku.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	};

	const clearAdjustmentForm = () => {
		setAdjustmentForm({
			productId: "",
			productName: "",
			currentStock: 0,
			quantity: "",
			reason: "",
			notes: "",
		});
	};

	const filterStockMovements = () => {
		return stockMovements.filter(
			(movement) =>
				!searchQuery ||
				movement.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				movement.sku.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	};

	const getStockStatusColor = (status: string) => {
		switch (status) {
			case "out_of_stock":
				return "text-red-400";
			case "low_stock":
				return "text-yellow-400";
			case "overstock":
				return "text-blue-400";
			default:
				return "text-green-400";
		}
	};

	const getStockStatusText = (status: string) => {
		switch (status) {
			case "out_of_stock":
				return "Stok Habis";
			case "low_stock":
				return "Stok Rendah";
			case "overstock":
				return "Stok Berlebih";
			default:
				return "Normal";
		}
	};

	const getAlertPriorityColor = (priority: string) => {
		switch (priority) {
			case "critical":
				return "text-red-400 bg-red-900/20";
			case "high":
				return "text-orange-400 bg-orange-900/20";
			case "medium":
				return "text-yellow-400 bg-yellow-900/20";
			default:
				return "text-blue-400 bg-blue-900/20";
		}
	};

	const formatDate = (dateString: string) => {
		return new Intl.DateTimeFormat("id-ID", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(dateString));
	};

	const criticalAlerts = inventoryAlerts.filter((alert) => alert.priority === "critical").length;
	const outOfStockCount = currentStock.filter(
		(stock) => stock.stock_status === "out_of_stock",
	).length;
	const lowStockCount = currentStock.filter((stock) => stock.stock_status === "low_stock").length;

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				{/* Header */}
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<ThemedText type="title" className="text-xl font-bold text-white">
						Inventaris & Stok
					</ThemedText>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				{/* Summary Cards */}
				<View className="px-6 py-4 border-b border-gray-800">
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<View className="flex-row gap-4">
							<View className="bg-red-900/20 border border-red-800 rounded-xl p-4 min-w-[120px]">
								<ThemedText className="text-red-400 text-2xl font-bold">
									{outOfStockCount}
								</ThemedText>
								<ThemedText className="text-red-300 text-sm">Stok Habis</ThemedText>
							</View>

							<View className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 min-w-[120px]">
								<ThemedText className="text-yellow-400 text-2xl font-bold">
									{lowStockCount}
								</ThemedText>
								<ThemedText className="text-yellow-300 text-sm">Stok Rendah</ThemedText>
							</View>

							<View className="bg-orange-900/20 border border-orange-800 rounded-xl p-4 min-w-[120px]">
								<ThemedText className="text-orange-400 text-2xl font-bold">
									{criticalAlerts}
								</ThemedText>
								<ThemedText className="text-orange-300 text-sm">Alert Kritis</ThemedText>
							</View>

							<View className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 min-w-[120px]">
								<ThemedText className="text-blue-400 text-2xl font-bold">
									{inventoryAlerts.length}
								</ThemedText>
								<ThemedText className="text-blue-300 text-sm">Total Alert</ThemedText>
							</View>
						</View>
					</ScrollView>
				</View>

				{/* Tab Navigation */}
				<View className="flex-row bg-gray-800 mx-6 mt-4 rounded-xl p-1">
					{[
						{ key: "overview", label: "Ringkasan", icon: "chart.bar.fill" as const },
						{ key: "movements", label: "Mutasi", icon: "arrow.left.arrow.right" as const },
						{ key: "alerts", label: "Alert", icon: "bell.fill" as const },
						{ key: "adjustment", label: "Sesuaikan", icon: "slider.horizontal.3" as const },
					].map((tab) => (
						<Pressable
							key={tab.key}
							className={`flex-1 flex-row items-center justify-center py-2 px-3 rounded-lg gap-2 ${
								activeTab === tab.key ? "bg-blue-900/50" : ""
							}`}
							onPress={() => setActiveTab(tab.key as TabType)}>
							<IconSymbol
								name={tab.icon}
								size={16}
								color={activeTab === tab.key ? "#3B82F6" : "#9CA3AF"}
							/>
							<ThemedText
								className={`text-sm font-medium ${
									activeTab === tab.key ? "text-blue-400" : "text-gray-400"
								}`}>
								{tab.label}
							</ThemedText>
						</Pressable>
					))}
				</View>

				{/* Search Bar */}
				{(activeTab === "overview" || activeTab === "movements") && (
					<View className="px-6 py-4">
						<View className="flex-row items-center bg-gray-800 rounded-xl px-4 py-3 mb-3">
							<IconSymbol name="magnifyingglass" size={20} color="#6B7280" />
							<TextInput
								value={searchQuery}
								onChangeText={handleSearch}
								placeholder="Cari produk..."
								placeholderTextColor="#6B7280"
								className="flex-1 text-white ml-3"
							/>
						</View>

						{activeTab === "overview" && (
							<View className="flex-row items-center gap-3">
								<ThemedText className="text-gray-300 text-sm">Hanya stok rendah</ThemedText>
								<Switch
									value={showLowStockOnly}
									onValueChange={setShowLowStockOnly}
									trackColor={{ false: "#374151", true: "#3B82F6" }}
									thumbColor="#FFFFFF"
								/>
							</View>
						)}
					</View>
				)}

				{/* Content */}
				{loading && (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size="large" color="#3B82F6" />
						<ThemedText className="text-gray-400 mt-3">Memuat data...</ThemedText>
					</View>
				)}

				{!loading && (
					<ScrollView
						className="flex-1"
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
						showsVerticalScrollIndicator={false}>
						{/* Overview Tab */}
						{activeTab === "overview" && (
							<View className="px-6 pb-6">
								{filterCurrentStock().map((stock) => (
									<View
										key={stock.product_id}
										className="bg-gray-800 rounded-xl p-4 mb-3 border border-gray-700">
										<View className="flex-row items-center justify-between mb-3">
											<View className="flex-1">
												<ThemedText className="text-white font-semibold" numberOfLines={1}>
													{stock.product_name}
												</ThemedText>
												<ThemedText className="text-gray-400 text-sm">SKU: {stock.sku}</ThemedText>
											</View>
											<View
												className={`px-2 py-1 rounded ${getStockStatusColor(stock.stock_status).replace("text", "bg").replace("400", "900/20")}`}>
												<ThemedText
													className={`text-xs font-medium ${getStockStatusColor(stock.stock_status)}`}>
													{getStockStatusText(stock.stock_status)}
												</ThemedText>
											</View>
										</View>

										<View className="flex-row items-center justify-between">
											<View className="flex-1 flex-row items-center gap-6">
												<View>
													<ThemedText className="text-2xl font-bold text-white">
														{stock.stock_quantity}
													</ThemedText>
													<ThemedText className="text-gray-400 text-sm">Stok Saat Ini</ThemedText>
												</View>

												<View>
													<ThemedText className="text-lg font-semibold text-yellow-400">
														{stock.low_stock_threshold}
													</ThemedText>
													<ThemedText className="text-gray-400 text-sm">Batas Minim</ThemedText>
												</View>

												<View>
													<ThemedText className="text-lg font-semibold text-green-400">
														{stock.total_stock_in}
													</ThemedText>
													<ThemedText className="text-gray-400 text-sm">Masuk</ThemedText>
												</View>

												<View>
													<ThemedText className="text-lg font-semibold text-red-400">
														{stock.total_stock_out}
													</ThemedText>
													<ThemedText className="text-gray-400 text-sm">Keluar</ThemedText>
												</View>
											</View>

											<Pressable
												onPress={() => {
													setAdjustmentForm({
														productId: stock.product_id,
														productName: stock.product_name,
														currentStock: stock.stock_quantity,
														quantity: stock.stock_quantity.toString(),
														reason: "",
														notes: "",
													});
													setActiveTab("adjustment");
												}}
												className="bg-blue-600 px-3 py-2 rounded-lg">
												<ThemedText className="text-white text-sm font-medium">
													Sesuaikan
												</ThemedText>
											</Pressable>
										</View>

										{stock.last_transaction_date && (
											<View className="mt-3 pt-3 border-t border-gray-700">
												<ThemedText className="text-gray-400 text-sm">
													Transaksi terakhir: {formatDate(stock.last_transaction_date)}
												</ThemedText>
											</View>
										)}
									</View>
								))}

								{filterCurrentStock().length === 0 && (
									<View className="items-center justify-center py-20">
										<IconSymbol name="archivebox" size={64} color="#6B7280" />
										<ThemedText className="text-gray-400 text-lg font-medium mt-4">
											Tidak ada data stok
										</ThemedText>
									</View>
								)}
							</View>
						)}

						{/* Movements Tab */}
						{activeTab === "movements" && (
							<View className="px-6 pb-6">
								{filterStockMovements().map((movement) => (
									<View
										key={movement.id}
										className="bg-gray-800 rounded-xl p-4 mb-3 border border-gray-700">
										<View className="flex-row items-center justify-between mb-2">
											<View className="flex-1">
												<ThemedText className="text-white font-semibold" numberOfLines={1}>
													{movement.product_name}
												</ThemedText>
												<ThemedText className="text-gray-400 text-sm">
													SKU: {movement.sku}
												</ThemedText>
											</View>
											<View
												className={`px-2 py-1 rounded ${
													movement.quantity_change > 0 ? "bg-green-900/20" : "bg-red-900/20"
												}`}>
												<ThemedText
													className={`text-xs font-medium ${
														movement.quantity_change > 0 ? "text-green-400" : "text-red-400"
													}`}>
													{movement.transaction_type.toUpperCase()}
												</ThemedText>
											</View>
										</View>

										<View className="flex-row items-center justify-between mb-3">
											<View className="flex-row items-center gap-6">
												<View>
													<ThemedText className="text-gray-300">Sebelum:</ThemedText>
													<ThemedText className="text-white font-semibold">
														{movement.quantity_before}
													</ThemedText>
												</View>

												<View className="items-center">
													<IconSymbol
														name={movement.quantity_change > 0 ? "plus" : "minus"}
														size={16}
														color={movement.quantity_change > 0 ? "#10B981" : "#EF4444"}
													/>
													<ThemedText
														className={`font-bold ${
															movement.quantity_change > 0 ? "text-green-400" : "text-red-400"
														}`}>
														{Math.abs(movement.quantity_change)}
													</ThemedText>
												</View>

												<View>
													<ThemedText className="text-gray-300">Sesudah:</ThemedText>
													<ThemedText className="text-white font-semibold">
														{movement.quantity_after}
													</ThemedText>
												</View>
											</View>
										</View>

										<View className="border-t border-gray-700 pt-3">
											<ThemedText className="text-gray-400 text-sm mb-1">
												{formatDate(movement.created_at)}
											</ThemedText>
											{movement.reason && (
												<ThemedText className="text-gray-300 text-sm">
													Alasan: {movement.reason}
												</ThemedText>
											)}
											{movement.warehouse_location && (
												<ThemedText className="text-gray-300 text-sm">
													Lokasi: {movement.warehouse_location}
												</ThemedText>
											)}
										</View>
									</View>
								))}

								{filterStockMovements().length === 0 && (
									<View className="items-center justify-center py-20">
										<IconSymbol name="arrow.left.arrow.right" size={64} color="#6B7280" />
										<ThemedText className="text-gray-400 text-lg font-medium mt-4">
											Tidak ada mutasi stok
										</ThemedText>
									</View>
								)}
							</View>
						)}

						{/* Alerts Tab */}
						{activeTab === "alerts" && (
							<View className="px-6 pb-6">
								{inventoryAlerts.map((alert) => (
									<View
										key={alert.id}
										className={`rounded-xl p-4 mb-3 border ${getAlertPriorityColor(alert.priority)}`}>
										<View className="flex-row items-center justify-between mb-2">
											<View className="flex-1">
												<ThemedText className="text-white font-semibold">
													{alert.alert_type.replace(/_/g, " ").toUpperCase()}
												</ThemedText>
												<ThemedText className="text-gray-300 text-sm capitalize">
													Prioritas: {alert.priority}
												</ThemedText>
											</View>
											<Pressable
												onPress={() => handleAcknowledgeAlert(alert.id)}
												className="bg-blue-600 px-3 py-2 rounded-lg">
												<ThemedText className="text-white text-sm">Konfirmasi</ThemedText>
											</Pressable>
										</View>

										{alert.message && (
											<ThemedText className="text-gray-300 mb-3">{alert.message}</ThemedText>
										)}

										<View className="flex-row items-center justify-between">
											{alert.threshold_value && alert.current_value && (
												<View className="flex-row items-center gap-4">
													<View>
														<ThemedText className="text-gray-400 text-sm">Batas:</ThemedText>
														<ThemedText className="text-white font-semibold">
															{alert.threshold_value}
														</ThemedText>
													</View>
													<View>
														<ThemedText className="text-gray-400 text-sm">Saat Ini:</ThemedText>
														<ThemedText className="text-white font-semibold">
															{alert.current_value}
														</ThemedText>
													</View>
												</View>
											)}

											<ThemedText className="text-gray-400 text-sm">
												{formatDate(alert.created_at)}
											</ThemedText>
										</View>

										{alert.action_required && (
											<View className="mt-3 pt-3 border-t border-gray-600">
												<ThemedText className="text-yellow-400 text-sm font-medium">
													Aksi diperlukan: {alert.action_required}
												</ThemedText>
											</View>
										)}
									</View>
								))}

								{inventoryAlerts.length === 0 && (
									<View className="items-center justify-center py-20">
										<IconSymbol name="bell" size={64} color="#6B7280" />
										<ThemedText className="text-gray-400 text-lg font-medium mt-4">
											Tidak ada alert
										</ThemedText>
										<ThemedText className="text-gray-500 text-center mt-2">
											Semua stok dalam kondisi normal
										</ThemedText>
									</View>
								)}
							</View>
						)}

						{/* Adjustment Tab */}
						{activeTab === "adjustment" && (
							<View className="px-6 pb-6">
								<View className="bg-gray-800 rounded-xl p-6 border border-gray-700">
									<ThemedText type="subtitle" className="text-lg font-semibold text-white mb-6">
										Penyesuaian Stok
									</ThemedText>

									{/* Product Selection */}
									<View className="mb-4">
										<View className="flex-row items-center justify-between mb-2">
											<ThemedText className="text-sm font-medium text-gray-300">Produk</ThemedText>
											{adjustmentForm.productId && (
												<Pressable onPress={clearAdjustmentForm}>
													<ThemedText className="text-blue-400 text-sm">Bersihkan</ThemedText>
												</Pressable>
											)}
										</View>

										{adjustmentForm.productId ? (
											<View className="bg-blue-900/20 border border-blue-700 rounded-xl p-4">
												<ThemedText className="text-white font-semibold">
													{adjustmentForm.productName}
												</ThemedText>
												<ThemedText className="text-gray-400 text-sm">
													Stok saat ini: {adjustmentForm.currentStock}
												</ThemedText>
											</View>
										) : (
											<Pressable
												onPress={() => setShowProductSelector(!showProductSelector)}
												className="bg-gray-900 border border-gray-600 rounded-xl p-4">
												<ThemedText className="text-gray-400 text-center">
													Pilih produk dari tab Ringkasan atau cari di sini
												</ThemedText>
											</Pressable>
										)}

										{/* Product Selector Dropdown */}
										{showProductSelector && (
											<View className="mt-2 bg-gray-900 border border-gray-600 rounded-xl max-h-48">
												<View className="p-3 border-b border-gray-700">
													<TextInput
														value={searchQuery}
														onChangeText={handleSearch}
														placeholder="Cari produk..."
														placeholderTextColor="#6B7280"
														className="text-white text-base"
													/>
												</View>
												<ScrollView className="max-h-32">
													{filterProducts().map((product) => (
														<Pressable
															key={product.id}
															onPress={() => handleSelectProduct(product)}
															className="p-3 border-b border-gray-700 last:border-b-0">
															<ThemedText className="text-white font-medium">
																{product.name}
															</ThemedText>
															<ThemedText className="text-gray-400 text-sm">
																SKU: {product.sku} | Stok: {product.stock_quantity}
															</ThemedText>
														</Pressable>
													))}
													{filterProducts().length === 0 && (
														<View className="p-4">
															<ThemedText className="text-gray-400 text-center">
																Tidak ada produk ditemukan
															</ThemedText>
														</View>
													)}
												</ScrollView>
											</View>
										)}
										{/* Quantity */}
										<View className="mb-4">
											<ThemedText className="text-sm font-medium text-gray-300 mb-2">
												Jumlah Stok Baru
											</ThemedText>
											<TextInput
												value={adjustmentForm.quantity}
												onChangeText={(text) => {
													// Only allow numbers
													if (text === "" || /^\d+$/.test(text)) {
														setAdjustmentForm({ ...adjustmentForm, quantity: text });
													}
												}}
												placeholder="Masukkan jumlah stok baru"
												placeholderTextColor="#6B7280"
												keyboardType="numeric"
												className="bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white text-base"
											/>
											{adjustmentForm.productId && (
												<ThemedText className="text-gray-400 text-sm mt-1">
													Stok saat ini: {adjustmentForm.currentStock}
												</ThemedText>
											)}
										</View>

										{/* Reason */}
										<View className="mb-4">
											<ThemedText className="text-sm font-medium text-gray-300 mb-2">
												Alasan Penyesuaian
											</ThemedText>
											<TextInput
												value={adjustmentForm.reason}
												onChangeText={(text) =>
													setAdjustmentForm({ ...adjustmentForm, reason: text })
												}
												placeholder="Alasan penyesuaian stok"
												placeholderTextColor="#6B7280"
												className="bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white text-base"
											/>
										</View>

										{/* Notes */}
										<View className="mb-6">
											<ThemedText className="text-sm font-medium text-gray-300 mb-2">
												Catatan
											</ThemedText>
											<TextInput
												value={adjustmentForm.notes}
												onChangeText={(text) =>
													setAdjustmentForm({ ...adjustmentForm, notes: text })
												}
												placeholder="Catatan tambahan (opsional)"
												placeholderTextColor="#6B7280"
												multiline
												numberOfLines={3}
												className="bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white text-base"
											/>
										</View>

										{/* Submit Button */}
										<Pressable
											onPress={handleStockAdjustment}
											disabled={!adjustmentForm.productId || !adjustmentForm.quantity || loading}
											className={`py-4 rounded-xl items-center justify-center ${
												adjustmentForm.productId && adjustmentForm.quantity && !loading
													? "bg-blue-600"
													: "bg-gray-700"
											}`}>
											{loading ? (
												<ActivityIndicator color="#FFFFFF" />
											) : (
												<ThemedText className="text-white text-base font-semibold">
													Sesuaikan Stok
												</ThemedText>
											)}
										</Pressable>
									</View>
								</View>
							</View>
						)}

						<View className="h-6" />
					</ScrollView>
				)}
			</ThemedView>
		</Modal>
	);
}
