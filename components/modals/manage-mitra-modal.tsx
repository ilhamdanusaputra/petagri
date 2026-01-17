import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React, { useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, TextInput, View } from "react-native";

interface ManageMitraModalProps {
	visible: boolean;
	onClose: () => void;
}

// Mock data for demonstration
const mockMitraData = [
	{
		id: "1",
		companyName: "PT Agro Mandiri Sejahtera",
		contactPerson: "Budi Santoso",
		email: "budi@agromandiri.com",
		phone: "+62-21-5555-1234",
		businessType: "Distributor",
		status: "active",
		joinDate: "2024-01-15",
	},
	{
		id: "2",
		companyName: "CV Tani Makmur Bersama",
		contactPerson: "Siti Rahayu",
		email: "siti@tanimakmur.co.id",
		phone: "+62-274-555-5678",
		businessType: "Supplier",
		status: "active",
		joinDate: "2024-02-20",
	},
	{
		id: "3",
		companyName: "UD Berkah Tani Nusantara",
		contactPerson: "Ahmad Wijaya",
		email: "ahmad@berkahtani.com",
		phone: "+62-31-7777-9012",
		businessType: "Retailer",
		status: "pending",
		joinDate: "2024-03-10",
	},
];

export function ManageMitraModal({ visible, onClose }: ManageMitraModalProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "pending" | "inactive">(
		"all",
	);

	const filteredMitra = mockMitraData.filter((mitra) => {
		const matchesSearch =
			mitra.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			mitra.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = selectedStatus === "all" || mitra.status === selectedStatus;
		return matchesSearch && matchesStatus;
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-600";
			case "pending":
				return "bg-yellow-600";
			case "inactive":
				return "bg-red-600";
			default:
				return "bg-gray-600";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "active":
				return "Aktif";
			case "pending":
				return "Pending";
			case "inactive":
				return "Tidak Aktif";
			default:
				return status;
		}
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
							Kelola Mitra
						</ThemedText>
						<ThemedText className="text-sm text-gray-400 mt-1">
							{filteredMitra.length} mitra ditemukan
						</ThemedText>
					</View>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 items-center justify-center rounded-full bg-gray-700">
						<IconSymbol name="xmark" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				{/* Search and Filter */}
				<View className="p-5 gap-4">
					{/* Search Bar */}
					<View>
						<TextInput
							className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
							placeholder="Cari nama perusahaan atau kontak person..."
							placeholderTextColor="#6B7280"
							value={searchQuery}
							onChangeText={setSearchQuery}
						/>
					</View>

					{/* Status Filter */}
					<ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
						<View className="flex-row gap-2">
							{[
								{ key: "all", label: "Semua" },
								{ key: "active", label: "Aktif" },
								{ key: "pending", label: "Pending" },
								{ key: "inactive", label: "Tidak Aktif" },
							].map((filter) => (
								<Pressable
									key={filter.key}
									className={`px-4 py-2 rounded-full border ${
										selectedStatus === filter.key
											? "bg-blue-600 border-blue-600"
											: "bg-gray-800 border-gray-600"
									}`}
									onPress={() => setSelectedStatus(filter.key as any)}>
									<ThemedText
										className={`text-sm font-medium ${
											selectedStatus === filter.key ? "text-white" : "text-gray-400"
										}`}>
										{filter.label}
									</ThemedText>
								</Pressable>
							))}
						</View>
					</ScrollView>
				</View>

				{/* Mitra List */}
				<FlatList
					data={filteredMitra}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ padding: 20 }}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<View className="bg-gray-800 p-4 rounded-2xl border border-gray-700 mb-4">
							<View className="flex-row justify-between items-start mb-3">
								<View className="flex-1">
									<ThemedText className="text-lg font-bold text-white mb-1">
										{item.companyName}
									</ThemedText>
									<ThemedText className="text-sm text-gray-400">
										{item.contactPerson} • {item.businessType}
									</ThemedText>
								</View>
								<View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
									<ThemedText className="text-xs font-medium text-white">
										{getStatusText(item.status)}
									</ThemedText>
								</View>
							</View>

							<View className="gap-2 mb-4">
								<View className="flex-row items-center gap-2">
									<IconSymbol name="envelope" size={14} color="#9CA3AF" />
									<ThemedText className="text-sm text-gray-400">{item.email}</ThemedText>
								</View>
								<View className="flex-row items-center gap-2">
									<IconSymbol name="phone" size={14} color="#9CA3AF" />
									<ThemedText className="text-sm text-gray-400">{item.phone}</ThemedText>
								</View>
								<View className="flex-row items-center gap-2">
									<IconSymbol name="calendar" size={14} color="#9CA3AF" />
									<ThemedText className="text-sm text-gray-400">
										Bergabung: {new Date(item.joinDate).toLocaleDateString("id-ID")}
									</ThemedText>
								</View>
							</View>

							<View className="flex-row gap-2">
								<Pressable className="flex-1 bg-blue-600 py-3 rounded-xl">
									<ThemedText className="text-center text-white font-medium text-sm">
										Edit
									</ThemedText>
								</Pressable>
								<Pressable className="flex-1 bg-gray-700 py-3 rounded-xl">
									<ThemedText className="text-center text-gray-300 font-medium text-sm">
										Detail
									</ThemedText>
								</Pressable>
							</View>
						</View>
					)}
					ListEmptyComponent={() => (
						<View className="items-center justify-center py-20">
							<ThemedText className="text-gray-400 text-center">
								Tidak ada mitra yang ditemukan
							</ThemedText>
						</View>
					)}
				/>
			</ThemedView>
		</Modal>
	);
}
