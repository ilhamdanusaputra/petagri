import { ScrollView, View } from "react-native";

import { MenuGrid } from "@/components/menu-grid";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";

export default function HomeScreen() {
	const router = useRouter();
	const { user } = useAuth();

	const menuItems = [
		{ key: "core", label: "CORE", icon: "house.fill", onPress: () => router.push("/menus/core") },
		{
			key: "konsultasi",
			label: "KONSULTASI & KEBUN",
			icon: "leaf.fill",
			onPress: () => router.push("/menus/konsultasi"),
		},
		{
			key: "produk",
			label: "PRODUK & TOKO",
			icon: "bag.fill",
			onPress: () => router.push("/menus/produk"),
		},
		{
			key: "tender",
			label: "TENDER & PENAWARAN",
			icon: "gavel",
			onPress: () => router.push("/menus/tender"),
		},
		{
			key: "penjualan",
			label: "PENJUALAN",
			icon: "cart.fill",
			onPress: () => router.push("/menus/penjualan"),
		},
		{
			key: "distribusi",
			label: "DISTRIBUSI & LOGISTIK",
			icon: "truck",
			onPress: () => router.push("/menus/distribusi"),
		},
		{
			key: "gudang",
			label: "GUDANG & STOK",
			icon: "archivebox.fill",
			onPress: () => router.push("/menus/gudang"),
		},
		{
			key: "all",
			label: "SEMUA MENU",
			icon: "chevron.right",
			onPress: () => router.push("/menus"),
		},
	];

	return (
		<ThemedView className="flex-1">
			<ScrollView showsVerticalScrollIndicator={false} className="flex-1">
				{/* Header Section */}
				<View className="px-6 pt-8 pb-2">
					<ThemedText type="title" className="text-2xl font-bold mb-1">
						Selamat Datang, {user?.user_metadata?.full_name || "User"}! 👋
					</ThemedText>
				</View>

				{/* Quick Stats Card */}
				<View className="mx-6 mb-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
					<ThemedText type="subtitle" className="font-semibold mb-2">
						📊 Dashboard Cepat
					</ThemedText>
					<ThemedText type="default" className="text-sm text-gray-600 dark:text-gray-400">
						Akses semua fitur utama dari satu tempat
					</ThemedText>
				</View>

				{/* Menu Grid */}
				<View className="px-2 pb-8">
					<MenuGrid items={menuItems} />
				</View>
			</ScrollView>
		</ThemedView>
	);
}
