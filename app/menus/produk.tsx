import { AddProductModal } from "@/components/modals/add-product-modal";
import { ContractMitraModal } from "@/components/modals/contract-mitra-modal";
import { ManageCatalogModal } from "@/components/modals/manage-catalog-modal";
import { ManageMitraModal } from "@/components/modals/manage-mitra-modal";
import { PerformanceMitraModal } from "@/components/modals/performance-mitra-modal";
import { PricingModal } from "@/components/modals/pricing-modal";
import { ProductAnalyticsModal } from "@/components/modals/product-analytics-modal";
import { RegisterMitraModal } from "@/components/modals/register-mitra-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useMitraStatus } from "@/hooks/use-mitra-status";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

type TabType = "produk" | "mitra";

export default function ProdukMenu() {
	const [activeTab, setActiveTab] = useState<TabType>("produk");
	const {
		hasMitra,
		isLoading: mitraLoading,
		mitra,
		isActive,
		isPending,
		refreshMitraStatus,
	} = useMitraStatus();

	// Mitra modals
	const [showRegisterModal, setShowRegisterModal] = useState(false);
	const [showManageModal, setShowManageModal] = useState(false);
	const [showPerformanceModal, setShowPerformanceModal] = useState(false);
	const [showContractModal, setShowContractModal] = useState(false);

	// Product modals
	const [showAddProductModal, setShowAddProductModal] = useState(false);
	const [showManageCatalogModal, setShowManageCatalogModal] = useState(false);
	const [showPricingModal, setShowPricingModal] = useState(false);
	const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

	const mitraFeatures = [
		{
			key: "register-mitra",
			label: "Daftar Mitra Baru",
			icon: "➕",
			description: "Registrasi mitra bisnis baru",
		},
		{
			key: "manage-mitra",
			label: "Kelola Mitra",
			icon: "👥",
			description: "Manajemen data mitra eksisting",
		},
		{
			key: "mitra-performance",
			label: "Performa Mitra",
			icon: "📊",
			description: "Analisis performa mitra",
		},
		{
			key: "partnership-agreements",
			label: "Kontrak Kemitraan",
			icon: "📄",
			description: "Kelola kontrak dan perjanjian",
		},
	];

	const produkFeatures = [
		{
			key: "add-product",
			label: "Tambah Produk",
			icon: "➕",
			description: "Tambah produk baru ke katalog",
			requiresActiveMitra: true,
		},
		{
			key: "manage-catalog",
			label: "Kelola Katalog",
			icon: "📦",
			description: "Manajemen katalog produk",
			requiresActiveMitra: true,
		},
		{
			key: "pricing",
			label: "Atur Harga",
			icon: "💰",
			description: "Kelola harga dan promosi",
			requiresActiveMitra: true,
		},
		{
			key: "product-analytics",
			label: "Analitik Produk",
			icon: "📈",
			description: "Analisis performa produk",
			requiresActiveMitra: true,
		},
	];

	const handleProductFeatureClick = (featureKey: string) => {
		// Check if user has active mitra for product features
		if (!hasMitra) {
			console.log("Please register as a mitra first to access product features");
			setActiveTab("mitra");
			return;
		}

		if (!isActive) {
			console.log("Your mitra registration is pending approval");
			return;
		}

		// Open the corresponding modal
		switch (featureKey) {
			case "add-product":
				setShowAddProductModal(true);
				break;
			case "manage-catalog":
				setShowManageCatalogModal(true);
				break;
			case "pricing":
				setShowPricingModal(true);
				break;
			case "product-analytics":
				setShowAnalyticsModal(true);
				break;
		}
	};

	return (
		<ThemedView className="flex-1">
			{/* Tab Navigation */}
			<View className="flex-row bg-gray-800 mx-5 mt-4 rounded-xl p-1 shadow-sm">
				<Pressable
					className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg gap-2 ${
						activeTab === "produk" ? "bg-blue-900/50 shadow-sm" : ""
					}`}
					onPress={() => setActiveTab("produk")}>
					<IconSymbol
						name="bag.fill"
						size={20}
						color={activeTab === "produk" ? "#3B82F6" : "#9CA3AF"}
					/>
					<ThemedText
						className={`text-sm font-semibold ${
							activeTab === "produk" ? "text-blue-400" : "text-gray-400"
						}`}>
						Produk
					</ThemedText>
				</Pressable>

				<Pressable
					className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg gap-2 ${
						activeTab === "mitra" ? "bg-blue-900/50 shadow-sm" : ""
					}`}
					onPress={() => setActiveTab("mitra")}>
					<IconSymbol
						name="house.fill"
						size={20}
						color={activeTab === "mitra" ? "#3B82F6" : "#9CA3AF"}
					/>
					<ThemedText
						className={`text-sm font-semibold ${
							activeTab === "mitra" ? "text-blue-400" : "text-gray-400"
						}`}>
						Mitra
					</ThemedText>
				</Pressable>
			</View>

			{/* Loading State */}
			{mitraLoading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#3B82F6" />
					<ThemedText className="text-gray-400 mt-3">Loading...</ThemedText>
				</View>
			) : (
				<ScrollView className="flex-1 pt-5" showsVerticalScrollIndicator={false}>
					{/* Product Tab */}
					{activeTab === "produk" && (
						<View className="px-5 pb-5">
							{/* Mitra Status Banner */}
							{!hasMitra && (
								<View className="mb-4 p-4 bg-yellow-900/20 border border-yellow-800 rounded-2xl">
									<View className="flex-row items-start gap-3">
										<IconSymbol name="exclamationmark.triangle.fill" size={24} color="#F59E0B" />
										<View className="flex-1">
											<ThemedText className="text-yellow-400 font-semibold text-base mb-1">
												Registrasi Kemitraan Diperlukan
											</ThemedText>
											<ThemedText className="text-yellow-400/80 text-sm leading-5 mb-3">
												Anda harus mendaftar sebagai mitra terlebih dahulu untuk mengakses fitur
												produk.
											</ThemedText>
											<Pressable
												onPress={() => setActiveTab("mitra")}
												className="bg-yellow-600 py-2.5 px-4 rounded-xl self-start">
												<ThemedText className="text-white font-semibold text-sm">
													Daftar Sekarang
												</ThemedText>
											</Pressable>
										</View>
									</View>
								</View>
							)}

							{isPending && (
								<View className="mb-4 p-4 bg-blue-900/20 border border-blue-800 rounded-2xl">
									<View className="flex-row items-start gap-3">
										<IconSymbol name="clock.fill" size={24} color="#3B82F6" />
										<View className="flex-1">
											<ThemedText className="text-blue-400 font-semibold text-base mb-1">
												Menunggu Persetujuan
											</ThemedText>
											<ThemedText className="text-blue-400/80 text-sm leading-5">
												Registrasi kemitraan Anda untuk &ldquo;{mitra?.company_name}&rdquo; sedang
												dalam proses review. Fitur produk akan tersedia setelah disetujui.
											</ThemedText>
										</View>
									</View>
								</View>
							)}

							{isActive && (
								<View className="mb-4 p-4 bg-green-900/20 border border-green-800 rounded-2xl">
									<View className="flex-row items-center gap-3">
										<IconSymbol name="checkmark.circle.fill" size={24} color="#10B981" />
										<View className="flex-1">
											<ThemedText className="text-green-400 font-semibold text-base">
												Mitra Aktif: {mitra?.company_name}
											</ThemedText>
										</View>
									</View>
								</View>
							)}

							{/* Product Features */}
							<View className="gap-3">
								{produkFeatures.map((feature) => (
									<FeatureCard
										key={feature.key}
										feature={feature}
										onPress={() => handleProductFeatureClick(feature.key)}
										disabled={!isActive}
									/>
								))}
							</View>
						</View>
					)}

					{activeTab === "mitra" && (
						<View className="px-5 pb-5 gap-3">
							{mitraFeatures.map((feature) => (
								<FeatureCard
									key={feature.key}
									feature={feature}
									onPress={() => {
										switch (feature.key) {
											case "register-mitra":
												setShowRegisterModal(true);
												break;
											case "manage-mitra":
												setShowManageModal(true);
												break;
											case "mitra-performance":
												setShowPerformanceModal(true);
												break;
											case "partnership-agreements":
												setShowContractModal(true);
												break;
										}
									}}
									disabled={feature.key === "register-mitra" && hasMitra}
								/>
							))}
						</View>
					)}
				</ScrollView>
			)}

			{/* All Mitra Modals */}
			<RegisterMitraModal
				visible={showRegisterModal}
				onClose={() => setShowRegisterModal(false)}
				onSuccess={refreshMitraStatus}
			/>
			<ManageMitraModal visible={showManageModal} onClose={() => setShowManageModal(false)} />
			<PerformanceMitraModal
				visible={showPerformanceModal}
				onClose={() => setShowPerformanceModal(false)}
			/>
			<ContractMitraModal visible={showContractModal} onClose={() => setShowContractModal(false)} />

			{/* All Product Modals */}
			<AddProductModal
				visible={showAddProductModal}
				onClose={() => setShowAddProductModal(false)}
			/>
			<ManageCatalogModal
				visible={showManageCatalogModal}
				onClose={() => setShowManageCatalogModal(false)}
			/>
			<PricingModal visible={showPricingModal} onClose={() => setShowPricingModal(false)} />
			<ProductAnalyticsModal
				visible={showAnalyticsModal}
				onClose={() => setShowAnalyticsModal(false)}
			/>
		</ThemedView>
	);
}

function FeatureCard({
	feature,
	onPress,
	disabled,
}: {
	feature: { key: string; label: string; icon: string; description: string };
	onPress?: () => void;
	disabled?: boolean;
}) {
	return (
		<Pressable
			className={`flex-row items-center bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-sm gap-3 ${
				disabled ? "opacity-50" : ""
			}`}
			onPress={disabled ? undefined : onPress}
			disabled={disabled}>
			<View className="w-11 h-11 rounded-xl bg-blue-900/30 items-center justify-center border border-blue-800/50">
				<ThemedText className="text-xl">{feature.icon}</ThemedText>
			</View>
			<View className="flex-1 gap-0.5">
				<ThemedText type="defaultSemiBold" className="text-base font-semibold text-white leading-5">
					{feature.label}
				</ThemedText>
				<ThemedText className="text-sm text-gray-400 leading-4.5">{feature.description}</ThemedText>
			</View>
			{!disabled && <IconSymbol name="chevron.right" size={16} color="#6B7280" />}
			{disabled && <IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />}
		</Pressable>
	);
}
