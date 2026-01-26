import { MenuGrid } from "@/components/menu-grid";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

export default function AllMenus() {
	const router = useRouter();
	const { user } = useAuth();
	const [profile, setProfile] = useState<any>(null);
	const [loadingProfile, setLoadingProfile] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			if (user) {
				const { data } = await supabase.from("profiles").select("roles").eq("id", user.id).single();
				setProfile(data || {});
			}
			setLoadingProfile(false);
		};
		fetchProfile();
	}, [user]);

	const items = [
		{ key: "core", label: "CORE", icon: "house.fill", onPress: () => router.push("/menus/core") },
		profile &&
			["owner_platform", "developer", "admin_platform", "pemilik_kebun", "konsultan"].includes(
				profile?.roles,
			) && {
				key: "konsultasi",
				label: "KONSULTASI & KEBUN",
				icon: "leaf.fill",
				onPress: () => router.push("/menus/konsultasi"),
			},
		profile &&
			["owner_platform", "developer", "admin_platform", "mitra_toko"].includes(profile?.roles) && {
				key: "produk",
				label: "PRODUK & TOKO",
				icon: "bag.fill",
				onPress: () => router.push("/menus/produk-mitra"),
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
			key: "keuangan",
			label: "KEUANGAN",
			icon: "dollarsign.circle.fill",
			onPress: () => router.push("/menus/keuangan"),
		},
		{
			key: "laporan",
			label: "LAPORAN & ANALITIK",
			icon: "chart.bar.fill",
			onPress: () => router.push("/menus/laporan"),
		},
		{
			key: "notifikasi",
			label: "NOTIFIKASI & SISTEM",
			icon: "bell.fill",
			onPress: () => router.push("/menus/notifikasi"),
		},
		{
			key: "pengaturan",
			label: "PENGATURAN",
			icon: "gear",
			onPress: () => router.push("/menus/pengaturan"),
		},
		{
			key: "developer",
			label: "DEVELOPER TOOLS",
			icon: "chevron.left.forwardslash.chevron.right",
			onPress: () => router.push("/menus/developer"),
		},
		{
			key: "dokumentasi",
			label: "DOKUMENTASI",
			icon: "book",
			onPress: () => router.push("/menus/dokumentasi"),
		},
	].filter(Boolean);

	if (loadingProfile) {
		return (
			<ThemedView style={styles.container}>
				<ThemedText type="title">Semua Menu</ThemedText>
				<ThemedText>Memuat data...</ThemedText>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">Semua Menu</ThemedText>
			<MenuGrid items={items} />
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		gap: 12,
	},
});
