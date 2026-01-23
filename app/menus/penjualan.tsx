import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Product } from "@/types/product";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export default function PenjualanMenu() {
	const [products, setProducts] = useState<Product[]>([]);
	const [orders, setOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [showSellProductModal, setShowSellProductModal] = useState(false);
	const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

	useEffect(() => {
		loadMitraAndData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadMitraAndData = async () => {
		setLoading(true);
		setError(null);
		try {
			// Get logged-in user's mitra
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
				throw new Error(
					"Mitra tidak ditemukan. Anda harus memiliki akun mitra aktif untuk menjual produk.",
				);
			}

			await loadProducts(mitraData.id);
			await loadOrders(mitraData.id);
		} catch (e: any) {
			setError(e.message || "Gagal memuat data.");
			console.error("Error loading data:", e);
		} finally {
			setLoading(false);
		}
	};

	const loadProducts = async (mId: string) => {
		try {
			// Load products that belong to this mitra only
			const { data, error } = await supabase
				.from("products")
				.select(
					`
					*,
					category:product_categories(id, name)
				`,
				)
				.order("created_at", { ascending: false });

			if (error) throw error;
			setProducts(data || []);
		} catch (e: any) {
			console.error("Error loading products:", e);
			setProducts([]);
		}
	};

	const loadOrders = async (mId: string) => {
		try {
			const { data, error } = await supabase
				.from("orders")
				.select(
					`
					*,
					product:products(name),
					mitra:mitra(company_name)
				`,
				)
				.order("delivery_date", { ascending: false })
				.limit(10);

			if (error) throw error;
			setOrders(data || []);
		} catch (e: any) {
			console.error("Error loading orders:", e);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadMitraAndData();
		setRefreshing(false);
	};

	const handleViewDetail = (product: Product) => {
		setSelectedProduct(product);
		setShowDetailModal(true);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "bg-green-600";
			case "pending":
				return "bg-yellow-600";
			case "cancelled":
				return "bg-red-600";
			default:
				return "bg-gray-600";
		}
	};

	const handleSellProduct = async (saleData: {
		productId: string;
		quantity: string;
		customerName: string;
		deliveryAddress: string;
		notes: string;
	}) => {
		try {
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
				throw new Error("Mitra tidak ditemukan");
			}

			// Get product details
			const { data: product, error: productError } = await supabase
				.from("products")
				.select("*")
				.eq("id", saleData.productId)
				.single();

			if (productError || !product) throw new Error("Produk tidak ditemukan");

			const quantity = Number(saleData.quantity);
			if (quantity > product.stock_quantity) {
				throw new Error("Stok tidak mencukupi");
			}

			const totalAmount = quantity * product.selling_price;
			const orderNumber = `ORD-${Date.now()}`;

			// Create order
			const { data: orderData, error: orderError } = await supabase
				.from("orders")
				.insert({
					order_number: orderNumber,
					customer_name: saleData.customerName,
					mitra_id: mitraData.id,
					product_id: product.id,
					items_count: quantity,
					total_amount: totalAmount,
					status: "pending",
					delivery_date: new Date().toISOString(),
				})
				.select()
				.single();

			if (orderError) throw orderError;

			// Create delivery record
			const deliveryNumber = `DEL-${Date.now()}`;
			const { error: deliveryError } = await supabase.from("deliveries").insert({
				delivery_number: deliveryNumber,
				order_id: orderData.id,
				mitra_id: mitraData.id,
				quantity: quantity,
				unit: product.unit_type,
				delivery_address: saleData.deliveryAddress,
				status: "pending",
				delivery_notes: saleData.notes || null,
				scheduled_delivery_date: new Date().toISOString(),
				product_condition: "good",
			});

			if (deliveryError) throw deliveryError;

			// Update stock
			const { error: stockError } = await supabase
				.from("products")
				.update({ stock_quantity: product.stock_quantity - quantity })
				.eq("id", product.id);

			if (stockError) throw stockError;

			Alert.alert(
				"Berhasil",
				`Penjualan berhasil dibuat!\nNomor Order: ${orderNumber}\nPembeli: ${saleData.customerName}`,
			);
			setShowSellProductModal(false);
			await loadMitraAndData();
		} catch (error: any) {
			console.error("Error creating sale:", error);
			Alert.alert("Error", error.message || "Gagal membuat penjualan");
		}
	};

	return (
		<ThemedView className="flex-1 bg-black">
			{/* Header */}
			<View className="px-6 py-4 border-b border-gray-800">
				<View className="flex-row items-center justify-between mb-1">
					<ThemedText type="title" className="text-2xl font-bold">
						PENJUALAN SAYA
					</ThemedText>
					{activeTab === "products" && (
						<TouchableOpacity
							onPress={() => setShowSellProductModal(true)}
							className="bg-green-600 px-4 py-2 rounded-xl flex-row items-center gap-2">
							<ThemedText className="text-white font-bold text-lg">+</ThemedText>
							<ThemedText className="text-white font-semibold">Jual Produk</ThemedText>
						</TouchableOpacity>
					)}
				</View>
				<ThemedText className="text-gray-400 text-sm">
					Kelola produk dan pesanan penjualan Anda
				</ThemedText>
			</View>

			{/* Tab Navigation */}
			<View className="flex-row px-6 pt-4 gap-2">
				<TouchableOpacity
					onPress={() => setActiveTab("products")}
					className={`flex-1 py-3 rounded-xl ${
						activeTab === "products" ? "bg-green-600" : "bg-gray-800"
					}`}>
					<ThemedText className="text-white text-center font-semibold">
						Produk ({products.length})
					</ThemedText>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setActiveTab("orders")}
					className={`flex-1 py-3 rounded-xl ${
						activeTab === "orders" ? "bg-green-600" : "bg-gray-800"
					}`}>
					<ThemedText className="text-white text-center font-semibold">
						Pesanan ({orders.length})
					</ThemedText>
				</TouchableOpacity>
			</View>

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#22c55e" />
					<ThemedText className="mt-3 text-gray-400">Memuat data...</ThemedText>
				</View>
			) : error ? (
				<View className="flex-1 items-center justify-center px-6">
					<IconSymbol name="bell.fill" size={48} color="#ef4444" />
					<ThemedText className="text-red-500 text-center mt-4">{error}</ThemedText>
					<TouchableOpacity
						className="mt-4 bg-green-600 px-6 py-3 rounded-xl"
						onPress={loadMitraAndData}>
						<ThemedText className="text-white font-semibold">Coba Lagi</ThemedText>
					</TouchableOpacity>
				</View>
			) : (
				<ScrollView
					className="flex-1"
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					showsVerticalScrollIndicator={false}>
					<View className="p-6 gap-4">
						{activeTab === "products" ? (
							products.length === 0 ? (
								<View className="items-center justify-center py-20">
									<IconSymbol name="cart.fill" size={64} color="#6b7280" />
									<ThemedText className="text-gray-400 mt-4 text-center">
										Belum ada produk
									</ThemedText>
								</View>
							) : (
								products.map((product) => (
									<SalesProductCard
										key={product.id}
										product={product}
										onViewDetail={() => handleViewDetail(product)}
									/>
								))
							)
						) : orders.length === 0 ? (
							<View className="items-center justify-center py-20">
								<IconSymbol name="archivebox.fill" size={64} color="#6b7280" />
								<ThemedText className="text-gray-400 mt-4 text-center">
									Belum ada pesanan
								</ThemedText>
							</View>
						) : (
							orders.map((order) => (
								<OrderCard key={order.id} order={order} getStatusColor={getStatusColor} />
							))
						)}
					</View>
				</ScrollView>
			)}

			{/* Sell Product Modal */}
			{showSellProductModal && (
				<SellProductModal
					visible={showSellProductModal}
					products={products}
					onClose={() => setShowSellProductModal(false)}
					onSubmit={handleSellProduct}
				/>
			)}

			{/* Product Detail Modal */}
			{showDetailModal && selectedProduct && (
				<ProductDetailModal
					visible={showDetailModal}
					product={selectedProduct}
					onClose={() => {
						setShowDetailModal(false);
						setSelectedProduct(null);
					}}
				/>
			)}
		</ThemedView>
	);
}

interface SalesProductCardProps {
	product: Product;
	onViewDetail: () => void;
}

function SalesProductCard({ product, onViewDetail }: SalesProductCardProps) {
	const hasStock = product.stock_quantity > 0;
	const isLowStock = product.stock_quantity <= product.min_stock_level;
	const imageUrl =
		product.images?.[0]?.url || "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8";

	return (
		<Pressable
			onPress={onViewDetail}
			className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden shadow-lg active:opacity-80">
			{/* Product Image */}
			<View className="relative">
				<Image
					source={{ uri: imageUrl }}
					style={{ width: "100%", height: 200 }}
					resizeMode="cover"
				/>
				{product.is_featured && (
					<View className="absolute top-3 right-3 bg-yellow-500 px-3 py-1 rounded-full">
						<ThemedText className="text-black text-xs font-bold">⭐ Featured</ThemedText>
					</View>
				)}
				{!hasStock && (
					<View className="absolute inset-0 bg-black/60 items-center justify-center">
						<ThemedText className="text-white text-lg font-bold">Stok Habis</ThemedText>
					</View>
				)}
			</View>

			{/* Product Info */}
			<View className="p-4">
				<View className="flex-row items-start justify-between mb-2">
					<View className="flex-1">
						<ThemedText className="text-lg font-bold text-white mb-1" numberOfLines={2}>
							{product.name}
						</ThemedText>
						{product.category?.name && (
							<ThemedText className="text-xs text-gray-400 mb-1">
								{product.category.name}
							</ThemedText>
						)}
					</View>
				</View>

				{product.description && (
					<ThemedText className="text-gray-400 text-sm mb-3" numberOfLines={2}>
						{product.description}
					</ThemedText>
				)}

				{/* Price and Stock */}
				<View className="flex-row items-center justify-between mb-3">
					<View>
						<ThemedText className="text-2xl font-bold text-green-400">
							Rp {product.selling_price.toLocaleString("id-ID")}
						</ThemedText>
					</View>
					<View className="items-end">
						<ThemedText
							className={`text-sm font-semibold ${
								!hasStock ? "text-red-400" : isLowStock ? "text-yellow-400" : "text-green-400"
							}`}>
							Stok: {product.stock_quantity}
						</ThemedText>
						<ThemedText className="text-xs text-gray-500">{product.unit_type}</ThemedText>
					</View>
				</View>

				{/* View Detail Button */}
				<TouchableOpacity
					onPress={onViewDetail}
					className="bg-gray-800 py-3 rounded-xl border border-gray-700">
					<ThemedText className="text-white text-center font-semibold">Lihat Detail</ThemedText>
				</TouchableOpacity>
			</View>
		</Pressable>
	);
}

// Order Card Component
interface OrderCardProps {
	order: any;
	getStatusColor: (status: string) => string;
}

function OrderCard({ order, getStatusColor }: OrderCardProps) {
	return (
		<View className="rounded-2xl border border-gray-800 bg-gray-900 p-4 shadow-lg">
			<View className="flex-row justify-between items-start mb-3">
				<View className="flex-1">
					<ThemedText className="text-white font-bold text-base mb-1">
						{order.order_number}
					</ThemedText>
					<ThemedText className="text-gray-400 text-sm">
						{order.product?.name || "Produk dari Tender"}
					</ThemedText>
				</View>
				<View className={`${getStatusColor(order.status)} px-3 py-1 rounded-full`}>
					<ThemedText className="text-white text-xs font-bold uppercase">{order.status}</ThemedText>
				</View>
			</View>

			<View className="border-t border-gray-800 pt-3 gap-2">
				<View className="flex-row justify-between">
					<ThemedText className="text-gray-400 text-sm">Jumlah:</ThemedText>
					<ThemedText className="text-white font-semibold">
						{order.quantity} {order.product?.unit_type || "unit"}
					</ThemedText>
				</View>
				<View className="flex-row justify-between">
					<ThemedText className="text-gray-400 text-sm">Total:</ThemedText>
					<ThemedText className="text-green-400 font-bold text-lg">
						Rp {order.total_amount.toLocaleString("id-ID")}
					</ThemedText>
				</View>
				<View className="flex-row justify-between">
					<ThemedText className="text-gray-400 text-sm">Tanggal:</ThemedText>
					<ThemedText className="text-white text-sm">
						{new Date(order.delivery_date).toLocaleDateString("id-ID")}
					</ThemedText>
				</View>
			</View>
		</View>
	);
}

// Sell Product Modal Component
interface SellProductModalProps {
	visible: boolean;
	products: Product[];
	onClose: () => void;
	onSubmit: (data: {
		productId: string;
		quantity: string;
		customerName: string;
		deliveryAddress: string;
		notes: string;
	}) => Promise<void>;
}

function SellProductModal({ visible, products, onClose, onSubmit }: SellProductModalProps) {
	const [selectedProductId, setSelectedProductId] = useState<string>("");
	const [quantity, setQuantity] = useState("");
	const [customerName, setCustomerName] = useState("");
	const [deliveryAddress, setDeliveryAddress] = useState("");
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(false);

	const selectedProduct = products.find((p) => p.id === selectedProductId);

	const resetForm = () => {
		setSelectedProductId("");
		setQuantity("");
		setCustomerName("");
		setDeliveryAddress("");
		setNotes("");
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	const handleSubmit = async () => {
		if (!selectedProductId || !quantity.trim() || !customerName.trim() || !deliveryAddress.trim()) {
			Alert.alert("Error", "Mohon lengkapi semua field yang wajib diisi");
			return;
		}

		setLoading(true);
		try {
			await onSubmit({
				productId: selectedProductId,
				quantity,
				customerName,
				deliveryAddress,
				notes,
			});
			resetForm();
		} catch {
			// Error handled in parent
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				{/* Header */}
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<ThemedText type="title" className="text-xl font-bold flex-1">
						Jual Produk Baru
					</ThemedText>
					<Pressable
						onPress={handleClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				<ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
					{/* Select Product */}
					<View className="mb-4">
						<ThemedText className="text-white font-semibold mb-2">Pilih Produk *</ThemedText>
						{products.length === 0 ? (
							<View className="bg-red-900/20 p-4 rounded-xl border border-red-800">
								<ThemedText className="text-red-400 text-center">
									Tidak ada produk tersedia
								</ThemedText>
							</View>
						) : (
							<View className="gap-2">
								{products.map((product) => (
									<TouchableOpacity
										key={product.id}
										onPress={() => setSelectedProductId(product.id)}
										className={`p-4 rounded-xl border ${
											selectedProductId === product.id
												? "bg-green-600 border-green-600"
												: "bg-gray-900 border-gray-800"
										}`}>
										<View className="flex-row justify-between items-start">
											<View className="flex-1">
												<ThemedText className="text-white font-bold mb-1">
													{product.name}
												</ThemedText>
												<ThemedText className="text-gray-300 text-sm">
													Rp {product.selling_price.toLocaleString("id-ID")} / {product.unit_type}
												</ThemedText>
											</View>
											<View className="items-end">
												<ThemedText
													className={`text-sm font-semibold ${
														product.stock_quantity === 0
															? "text-red-400"
															: product.stock_quantity <= product.min_stock_level
																? "text-yellow-400"
																: "text-green-400"
													}`}>
													Stok: {product.stock_quantity}
												</ThemedText>
											</View>
										</View>
									</TouchableOpacity>
								))}
							</View>
						)}
					</View>

					{/* Selected Product Info */}
					{selectedProduct && (
						<View className="mb-4 bg-green-900/20 p-4 rounded-xl border border-green-800">
							<ThemedText className="text-green-400 font-bold mb-1">
								{selectedProduct.name}
							</ThemedText>
							<ThemedText className="text-gray-300 text-sm">
								Harga: Rp {selectedProduct.selling_price.toLocaleString("id-ID")} /{" "}
								{selectedProduct.unit_type}
							</ThemedText>
							<ThemedText className="text-gray-300 text-sm">
								Stok Tersedia: {selectedProduct.stock_quantity} {selectedProduct.unit_type}
							</ThemedText>
						</View>
					)}

					{/* Quantity */}
					<View className="mb-4">
						<ThemedText className="text-white font-semibold mb-2">Jumlah *</ThemedText>
						<TextInput
							value={quantity}
							onChangeText={setQuantity}
							placeholder="Masukkan jumlah"
							placeholderTextColor="#6b7280"
							keyboardType="numeric"
							className="bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-800"
						/>
						{selectedProduct && quantity && (
							<ThemedText className="text-gray-400 text-sm mt-1">
								Total: Rp{" "}
								{(Number(quantity) * selectedProduct.selling_price).toLocaleString("id-ID")}
							</ThemedText>
						)}
					</View>

					{/* Customer Name */}
					<View className="mb-4">
						<ThemedText className="text-white font-semibold mb-2">Nama Pembeli *</ThemedText>
						<TextInput
							value={customerName}
							onChangeText={setCustomerName}
							placeholder="Masukkan nama pembeli"
							placeholderTextColor="#6b7280"
							className="bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-800"
						/>
					</View>

					{/* Delivery Address */}
					<View className="mb-4">
						<ThemedText className="text-white font-semibold mb-2">Alamat Pengiriman *</ThemedText>
						<TextInput
							value={deliveryAddress}
							onChangeText={setDeliveryAddress}
							placeholder="Masukkan alamat lengkap pengiriman"
							placeholderTextColor="#6b7280"
							multiline
							numberOfLines={3}
							className="bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-800"
							style={{ textAlignVertical: "top" }}
						/>
					</View>

					{/* Notes */}
					<View className="mb-4">
						<ThemedText className="text-white font-semibold mb-2">Catatan</ThemedText>
						<TextInput
							value={notes}
							onChangeText={setNotes}
							placeholder="Catatan tambahan (opsional)"
							placeholderTextColor="#6b7280"
							multiline
							numberOfLines={2}
							className="bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-800"
							style={{ textAlignVertical: "top" }}
						/>
					</View>

					<View className="mb-6 bg-blue-900/20 p-4 rounded-xl border border-blue-800">
						<ThemedText className="text-blue-400 text-sm">
							💡 Penjualan akan langsung dicatat dan stok produk akan berkurang secara otomatis.
						</ThemedText>
					</View>
				</ScrollView>

				{/* Action Buttons */}
				<View className="px-6 pb-10 border-t border-gray-800 pt-4 gap-3">
					<TouchableOpacity
						onPress={handleSubmit}
						disabled={loading || products.length === 0}
						className={`py-4 rounded-xl ${loading || products.length === 0 ? "bg-gray-700" : "bg-green-600"}`}>
						{loading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<ThemedText className="text-white text-center font-bold text-lg">
								Buat Penjualan
							</ThemedText>
						)}
					</TouchableOpacity>
					<TouchableOpacity
						onPress={handleClose}
						disabled={loading}
						className="bg-gray-800 py-3 rounded-xl">
						<ThemedText className="text-white text-center font-semibold">Batal</ThemedText>
					</TouchableOpacity>
				</View>
			</ThemedView>
		</Modal>
	);
}

// Product Detail Modal
interface ProductDetailModalProps {
	visible: boolean;
	product: Product;
	onClose: () => void;
}

function ProductDetailModal({ visible, product, onClose }: ProductDetailModalProps) {
	const imageUrl =
		product.images?.[0]?.url || "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8";
	const hasStock = product.stock_quantity > 0;

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				{/* Header */}
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<ThemedText type="title" className="text-xl font-bold flex-1">
						Detail Produk
					</ThemedText>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
					{/* Product Image */}
					<Image
						source={{ uri: imageUrl }}
						style={{ width: "100%", height: 300 }}
						resizeMode="cover"
					/>

					<View className="p-6">
						{/* Product Name and Category */}
						<View className="mb-4">
							{product.category?.name && (
								<ThemedText className="text-green-400 text-sm mb-1">
									{product.category.name}
								</ThemedText>
							)}
							<ThemedText className="text-2xl font-bold text-white mb-2">{product.name}</ThemedText>
							{product.sku && (
								<ThemedText className="text-gray-500 text-xs">SKU: {product.sku}</ThemedText>
							)}
						</View>

						{/* Price */}
						<View className="mb-6 p-4 bg-gray-900 rounded-xl border border-gray-800">
							<ThemedText className="text-3xl font-bold text-green-400 mb-1">
								Rp {product.selling_price.toLocaleString("id-ID")}
							</ThemedText>
							{product.discount_percentage && product.discount_percentage > 0 && (
								<View className="flex-row items-center gap-2">
									<ThemedText className="text-sm text-gray-500 line-through">
										Rp {product.base_price.toLocaleString("id-ID")}
									</ThemedText>
									<View className="bg-red-600 px-2 py-1 rounded">
										<ThemedText className="text-white text-xs font-bold">
											HEMAT {product.discount_percentage}%
										</ThemedText>
									</View>
								</View>
							)}
						</View>

						{/* Description */}
						{product.description && (
							<View className="mb-6">
								<ThemedText className="text-lg font-semibold text-white mb-2">Deskripsi</ThemedText>
								<ThemedText className="text-gray-400 leading-6">{product.description}</ThemedText>
							</View>
						)}

						{/* Stock Info */}
						<View className="mb-6">
							<ThemedText className="text-lg font-semibold text-white mb-3">
								Informasi Stok
							</ThemedText>
							<View className="flex-row flex-wrap gap-3">
								<View className="bg-gray-900 px-4 py-3 rounded-xl border border-gray-800 flex-1 min-w-[45%]">
									<ThemedText className="text-gray-400 text-xs mb-1">Stok Tersedia</ThemedText>
									<ThemedText
										className={`text-lg font-bold ${hasStock ? "text-green-400" : "text-red-400"}`}>
										{product.stock_quantity} {product.unit_type}
									</ThemedText>
								</View>
								<View className="bg-gray-900 px-4 py-3 rounded-xl border border-gray-800 flex-1 min-w-[45%]">
									<ThemedText className="text-gray-400 text-xs mb-1">Batas Minimum</ThemedText>
									<ThemedText className="text-lg font-bold text-yellow-400">
										{product.min_stock_level} {product.unit_type}
									</ThemedText>
								</View>
							</View>
						</View>

						{/* Additional Info */}
						{(product.weight || product.brand) && (
							<View className="mb-6">
								<ThemedText className="text-lg font-semibold text-white mb-3">
									Informasi Tambahan
								</ThemedText>
								<View className="gap-2">
									{product.weight && (
										<View className="flex-row justify-between py-2 border-b border-gray-800">
											<ThemedText className="text-gray-400">Berat</ThemedText>
											<ThemedText className="text-white font-semibold">
												{product.weight} kg
											</ThemedText>
										</View>
									)}
									{product.brand && (
										<View className="flex-row justify-between py-2 border-b border-gray-800">
											<ThemedText className="text-gray-400">Brand</ThemedText>
											<ThemedText className="text-white font-semibold">{product.brand}</ThemedText>
										</View>
									)}
									<View className="flex-row justify-between py-2 border-b border-gray-800">
										<ThemedText className="text-gray-400">Status</ThemedText>
										<ThemedText
											className={`font-semibold ${product.status === "active" ? "text-green-400" : "text-gray-400"}`}>
											{product.status === "active" ? "Aktif" : "Tidak Aktif"}
										</ThemedText>
									</View>
								</View>
							</View>
						)}

						{/* Tags */}
						{product.tags && product.tags.length > 0 && (
							<View className="mb-6">
								<ThemedText className="text-lg font-semibold text-white mb-3">Tags</ThemedText>
								<View className="flex-row flex-wrap gap-2">
									{product.tags.map((tag, index) => (
										<View key={index} className="bg-gray-800 px-3 py-1 rounded-full">
											<ThemedText className="text-gray-300 text-xs">{tag}</ThemedText>
										</View>
									))}
								</View>
							</View>
						)}
					</View>
				</ScrollView>
			</ThemedView>
		</Modal>
	);
}
