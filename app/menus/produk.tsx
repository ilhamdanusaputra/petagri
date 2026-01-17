import { AddProductModal } from "@/components/modals/add-product-modal";
import { ContractMitraModal } from "@/components/modals/contract-mitra-modal";
import { InventoryModal } from "@/components/modals/inventory-modal";
import { ManageCatalogModal } from "@/components/modals/manage-catalog-modal";
import { ManageMitraModal } from "@/components/modals/manage-mitra-modal";
import { PerformanceMitraModal } from "@/components/modals/performance-mitra-modal";
import { PricingModal } from "@/components/modals/pricing-modal";
import { ProductAnalyticsModal } from "@/components/modals/product-analytics-modal";
import { RegisterMitraModal } from "@/components/modals/register-mitra-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

type TabType = "produk" | "mitra";

export default function ProdukMenu() {
	const [activeTab, setActiveTab] = useState<TabType>("produk");

	// Mitra modals
	const [showRegisterModal, setShowRegisterModal] = useState(false);
	const [showManageModal, setShowManageModal] = useState(false);
	const [showPerformanceModal, setShowPerformanceModal] = useState(false);
	const [showContractModal, setShowContractModal] = useState(false);

	// Product modals
	const [showAddProductModal, setShowAddProductModal] = useState(false);
	const [showManageCatalogModal, setShowManageCatalogModal] = useState(false);
	const [showPricingModal, setShowPricingModal] = useState(false);
	const [showInventoryModal, setShowInventoryModal] = useState(false);
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
		},
		{
			key: "manage-catalog",
			label: "Kelola Katalog",
			icon: "📦",
			description: "Manajemen katalog produk",
		},
		{ key: "pricing", label: "Atur Harga", icon: "💰", description: "Kelola harga dan promosi" },
		{
			key: "inventory",
			label: "Stok Produk",
			icon: "📊",
			description: "Monitor stok dan ketersediaan",
		},
		{
			key: "product-analytics",
			label: "Analitik Produk",
			icon: "📈",
			description: "Analisis performa produk",
		},
	];

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

			{/* Content */}
			<ScrollView className="flex-1 pt-5" showsVerticalScrollIndicator={false}>
				{activeTab === "produk" && (
					<View className="px-5 pb-5 gap-3">
						{produkFeatures.map((feature) => (
							<FeatureCard
								key={feature.key}
								feature={feature}
								onPress={() => {
									switch (feature.key) {
										case "add-product":
											setShowAddProductModal(true);
											break;
										case "manage-catalog":
											setShowManageCatalogModal(true);
											break;
										case "pricing":
											setShowPricingModal(true);
											break;
										case "inventory":
											setShowInventoryModal(true);
											break;
										case "product-analytics":
											setShowAnalyticsModal(true);
											break;
									}
								}}
							/>
						))}
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
							/>
						))}
					</View>
				)}
			</ScrollView>

			{/* All Mitra Modals */}
			<RegisterMitraModal visible={showRegisterModal} onClose={() => setShowRegisterModal(false)} />
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
			<InventoryModal visible={showInventoryModal} onClose={() => setShowInventoryModal(false)} />
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
}: {
	feature: { key: string; label: string; icon: string; description: string };
	onPress?: () => void;
}) {
	return (
		<Pressable
			className="flex-row items-center bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-sm gap-3"
			onPress={onPress}>
			<View className="w-11 h-11 rounded-xl bg-blue-900/30 items-center justify-center border border-blue-800/50">
				<ThemedText className="text-xl">{feature.icon}</ThemedText>
			</View>
			<View className="flex-1 gap-0.5">
				<ThemedText type="defaultSemiBold" className="text-base font-semibold text-white leading-5">
					{feature.label}
				</ThemedText>
				<ThemedText className="text-sm text-gray-400 leading-4.5">{feature.description}</ThemedText>
			</View>
			<IconSymbol name="chevron.right" size={16} color="#6B7280" />
		</Pressable>
	);
}
