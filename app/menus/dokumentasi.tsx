import { ExternalLink } from "@/components/external-link";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Code, Layers } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function DokumentasiMenu() {
	return (
		<ThemedView style={styles.container} className="flex-1">
			<ScrollView
				contentContainerStyle={{ paddingBottom: 32 }}
				showsVerticalScrollIndicator={false}>
				{/* Sections */}
				<DocCard
					title="Panduan Pengguna"
					icon={<Layers className="text-green-600 dark:text-green-400" size={20} />}>
					<DocItem>Login & Registrasi Akun</DocItem>
					<DocItem>Manajemen Kebun & Konsultasi</DocItem>
					<DocItem>Produk, Toko & Katalog</DocItem>
					<DocItem>Distribusi & Penugasan Supir</DocItem>
					<DocItem>Gudang & Manajemen Stok</DocItem>
				</DocCard>

				<DocCard
					title="Referensi Developer"
					icon={<Code className="text-green-600 dark:text-green-400" size={20} />}>
					<DocItem>
						<ExternalLink href="https://supabase.com/docs">Supabase Documentation</ExternalLink>
					</DocItem>
					<DocItem>
						<ExternalLink href="https://reactnative.dev/docs/getting-started">
							React Native Documentation
						</ExternalLink>
					</DocItem>
					<DocItem>
						<ExternalLink href="https://expo.dev">Expo Documentation</ExternalLink>
					</DocItem>
					<DocItem>
						<ExternalLink href="https://tailwindcss.com/docs">Tailwind CSS Docs</ExternalLink>
					</DocItem>
				</DocCard>

				<DocCard title="Struktur Fitur Utama">
					<DocItem>CORE — Beranda & Ringkasan</DocItem>
					<DocItem>KONSULTASI & KEBUN — Visit, Catatan, Rekomendasi</DocItem>
					<DocItem>PRODUK & TOKO — Produk, Kategori, Katalog</DocItem>
					<DocItem>TENDER & PENAWARAN — Tender, Penawaran, Kontrak</DocItem>
					<DocItem>PENJUALAN — Order & Transaksi</DocItem>
					<DocItem>DISTRIBUSI & LOGISTIK — Pengiriman & Supir</DocItem>
					<DocItem>GUDANG & STOK — Inventaris</DocItem>
					<DocItem>KEUANGAN — Pembayaran & Laporan</DocItem>
					<DocItem>LAPORAN & ANALITIK — Statistik & Insight</DocItem>
					<DocItem>NOTIFIKASI & SISTEM</DocItem>
					<DocItem>PENGATURAN — Aplikasi & Akun</DocItem>
					<DocItem>DEVELOPER TOOLS</DocItem>
					<DocItem>DOKUMENTASI</DocItem>
				</DocCard>

				{/* Footer */}
				<ThemedText className="mt-10 text-xs text-center text-gray-400 dark:text-gray-600">
					© {new Date().getFullYear()} Petagri — Smart Agriculture Platform
				</ThemedText>
			</ScrollView>
		</ThemedView>
	);
}
/* =========================
   Reusable Components
========================= */

function DocCard({
	title,
	icon,
	children,
}: {
	title: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<ThemedView className="mb-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-neutral-900 p-4 shadow-sm">
			<ThemedView className="flex-row items-center mb-3 gap-2">
				{icon && (
					<ThemedView className="p-1 rounded-md bg-green-100 dark:bg-green-900">{icon}</ThemedView>
				)}
				<ThemedText className="text-lg font-semibold text-green-700 dark:text-green-300">
					{title}
				</ThemedText>
			</ThemedView>
			<ThemedView className="gap-1">{children}</ThemedView>
		</ThemedView>
	);
}

function DocItem({ children }: { children: React.ReactNode }) {
	return (
		<ThemedText className="text-base text-gray-700 dark:text-gray-300">• {children}</ThemedText>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, gap: 8 },
});
