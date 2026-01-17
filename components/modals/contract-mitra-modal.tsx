import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React, { useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, TextInput, View } from "react-native";

interface ContractModalProps {
	visible: boolean;
	onClose: () => void;
}

// Mock contract data
const mockContracts = [
	{
		id: "1",
		contractNumber: "CTR-2024-001",
		partnerName: "PT Agro Mandiri Sejahtera",
		contractType: "Distribusi Eksklusif",
		status: "active",
		startDate: "2024-01-15",
		endDate: "2025-01-14",
		value: 500000000,
		description: "Kontrak distribusi eksklusif untuk wilayah Jakarta dan sekitarnya",
	},
	{
		id: "2",
		contractNumber: "CTR-2024-002",
		partnerName: "CV Tani Makmur Bersama",
		contractType: "Supply Agreement",
		status: "pending",
		startDate: "2024-03-01",
		endDate: "2025-02-28",
		value: 350000000,
		description: "Kontrak pasokan pupuk organik dan pestisida alami",
	},
	{
		id: "3",
		contractNumber: "CTR-2024-003",
		partnerName: "UD Berkah Tani Nusantara",
		contractType: "Retail Partnership",
		status: "expired",
		startDate: "2023-06-01",
		endDate: "2024-05-31",
		value: 200000000,
		description: "Kontrak kemitraan retail untuk distribusi produk pertanian",
	},
	{
		id: "4",
		contractNumber: "CTR-2024-004",
		partnerName: "PT Sumber Rejeki Pertanian",
		contractType: "Technology License",
		status: "draft",
		startDate: "2024-04-01",
		endDate: "2026-03-31",
		value: 750000000,
		description: "Kontrak lisensi teknologi smart farming dan IoT monitoring",
	},
];

const contractTypes = [
	"Distribusi Eksklusif",
	"Supply Agreement",
	"Retail Partnership",
	"Technology License",
	"Joint Venture",
	"Franchise Agreement",
];

export function ContractMitraModal({ visible, onClose }: ContractModalProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<
		"all" | "active" | "pending" | "expired" | "draft"
	>("all");
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [newContract, setNewContract] = useState({
		partnerName: "",
		contractType: "",
		startDate: "",
		endDate: "",
		value: "",
		description: "",
	});

	const filteredContracts = mockContracts.filter((contract) => {
		const matchesSearch =
			contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
			contract.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			contract.contractType.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = selectedStatus === "all" || contract.status === selectedStatus;
		return matchesSearch && matchesStatus;
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-600";
			case "pending":
				return "bg-yellow-600";
			case "expired":
				return "bg-red-600";
			case "draft":
				return "bg-gray-600";
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
			case "expired":
				return "Kadaluarsa";
			case "draft":
				return "Draft";
			default:
				return status;
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("id-ID", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	const handleCreateContract = () => {
		// Here you would typically save to database
		console.log("Creating contract:", newContract);
		setNewContract({
			partnerName: "",
			contractType: "",
			startDate: "",
			endDate: "",
			value: "",
			description: "",
		});
		setShowCreateForm(false);
	};

	if (showCreateForm) {
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
								Buat Kontrak Baru
							</ThemedText>
						</View>
						<Pressable
							onPress={() => setShowCreateForm(false)}
							className="w-8 h-8 items-center justify-center rounded-full bg-gray-700">
							<IconSymbol name="xmark" size={16} color="#9CA3AF" />
						</Pressable>
					</View>

					<ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
						<View className="gap-4">
							{/* Partner Name */}
							<View>
								<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
									Nama Mitra *
								</ThemedText>
								<TextInput
									className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
									placeholder="Pilih atau masukkan nama mitra"
									placeholderTextColor="#6B7280"
									value={newContract.partnerName}
									onChangeText={(value) =>
										setNewContract((prev) => ({ ...prev, partnerName: value }))
									}
								/>
							</View>

							{/* Contract Type */}
							<View>
								<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
									Jenis Kontrak *
								</ThemedText>
								<View className="flex-row flex-wrap gap-2">
									{contractTypes.map((type) => (
										<Pressable
											key={type}
											className={`px-3 py-2 rounded-lg border ${
												newContract.contractType === type
													? "bg-blue-600 border-blue-600"
													: "bg-gray-800 border-gray-600"
											}`}
											onPress={() => setNewContract((prev) => ({ ...prev, contractType: type }))}>
											<ThemedText
												className={`text-sm ${
													newContract.contractType === type ? "text-white" : "text-gray-400"
												}`}>
												{type}
											</ThemedText>
										</Pressable>
									))}
								</View>
							</View>

							{/* Date Range */}
							<View className="flex-row gap-3">
								<View className="flex-1">
									<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
										Tanggal Mulai *
									</ThemedText>
									<TextInput
										className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
										placeholder="YYYY-MM-DD"
										placeholderTextColor="#6B7280"
										value={newContract.startDate}
										onChangeText={(value) =>
											setNewContract((prev) => ({ ...prev, startDate: value }))
										}
									/>
								</View>
								<View className="flex-1">
									<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
										Tanggal Berakhir *
									</ThemedText>
									<TextInput
										className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
										placeholder="YYYY-MM-DD"
										placeholderTextColor="#6B7280"
										value={newContract.endDate}
										onChangeText={(value) =>
											setNewContract((prev) => ({ ...prev, endDate: value }))
										}
									/>
								</View>
							</View>

							{/* Contract Value */}
							<View>
								<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
									Nilai Kontrak (IDR)
								</ThemedText>
								<TextInput
									className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
									placeholder="500000000"
									placeholderTextColor="#6B7280"
									keyboardType="numeric"
									value={newContract.value}
									onChangeText={(value) => setNewContract((prev) => ({ ...prev, value: value }))}
								/>
							</View>

							{/* Description */}
							<View>
								<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
									Deskripsi Kontrak
								</ThemedText>
								<TextInput
									className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
									placeholder="Jelaskan detail kontrak..."
									placeholderTextColor="#6B7280"
									multiline
									numberOfLines={4}
									style={{ minHeight: 100, textAlignVertical: "top" }}
									value={newContract.description}
									onChangeText={(value) =>
										setNewContract((prev) => ({ ...prev, description: value }))
									}
								/>
							</View>
						</View>
					</ScrollView>

					{/* Footer */}
					<View className="p-5 border-t border-gray-700 gap-3">
						<Pressable
							className="bg-blue-600 rounded-xl p-4 items-center"
							onPress={handleCreateContract}>
							<ThemedText className="text-white font-semibold text-base">Buat Kontrak</ThemedText>
						</Pressable>
						<Pressable
							className="bg-gray-700 rounded-xl p-4 items-center"
							onPress={() => setShowCreateForm(false)}>
							<ThemedText className="text-gray-300 font-semibold text-base">Batal</ThemedText>
						</Pressable>
					</View>
				</ThemedView>
			</Modal>
		);
	}

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
							Kontrak Kemitraan
						</ThemedText>
						<ThemedText className="text-sm text-gray-400 mt-1">
							{filteredContracts.length} kontrak ditemukan
						</ThemedText>
					</View>
					<View className="flex-row gap-2">
						<Pressable
							onPress={() => setShowCreateForm(true)}
							className="w-8 h-8 items-center justify-center rounded-full bg-blue-600">
							<IconSymbol name="plus" size={16} color="#FFFFFF" />
						</Pressable>
						<Pressable
							onPress={onClose}
							className="w-8 h-8 items-center justify-center rounded-full bg-gray-700">
							<IconSymbol name="xmark" size={16} color="#9CA3AF" />
						</Pressable>
					</View>
				</View>

				{/* Search and Filter */}
				<View className="p-5 gap-4">
					{/* Search Bar */}
					<View>
						<TextInput
							className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
							placeholder="Cari nomor kontrak, mitra, atau jenis kontrak..."
							placeholderTextColor="#6B7280"
							value={searchQuery}
							onChangeText={setSearchQuery}
						/>
					</View>

					{/* Status Filter */}
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<View className="flex-row gap-2">
							{[
								{ key: "all", label: "Semua" },
								{ key: "active", label: "Aktif" },
								{ key: "pending", label: "Pending" },
								{ key: "draft", label: "Draft" },
								{ key: "expired", label: "Kadaluarsa" },
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

				{/* Contract List */}
				<FlatList
					data={filteredContracts}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ padding: 20 }}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<View className="bg-gray-800 p-4 rounded-2xl border border-gray-700 mb-4">
							<View className="flex-row justify-between items-start mb-3">
								<View className="flex-1">
									<ThemedText className="text-lg font-bold text-white mb-1">
										{item.contractNumber}
									</ThemedText>
									<ThemedText className="text-sm text-gray-400 mb-1">{item.partnerName}</ThemedText>
									<ThemedText className="text-sm text-blue-400">{item.contractType}</ThemedText>
								</View>
								<View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
									<ThemedText className="text-xs font-medium text-white">
										{getStatusText(item.status)}
									</ThemedText>
								</View>
							</View>

							<View className="gap-2 mb-4">
								<View className="flex-row justify-between">
									<ThemedText className="text-sm text-gray-400">Periode:</ThemedText>
									<ThemedText className="text-sm text-white">
										{formatDate(item.startDate)} - {formatDate(item.endDate)}
									</ThemedText>
								</View>
								<View className="flex-row justify-between">
									<ThemedText className="text-sm text-gray-400">Nilai:</ThemedText>
									<ThemedText className="text-sm text-white font-semibold">
										{formatCurrency(item.value)}
									</ThemedText>
								</View>
							</View>

							<ThemedText className="text-sm text-gray-400 mb-4" numberOfLines={2}>
								{item.description}
							</ThemedText>

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
								<Pressable className="px-4 py-3 bg-gray-700 rounded-xl">
									<IconSymbol name="doc.fill" size={16} color="#9CA3AF" />
								</Pressable>
							</View>
						</View>
					)}
					ListEmptyComponent={() => (
						<View className="items-center justify-center py-20">
							<ThemedText className="text-gray-400 text-center">
								Tidak ada kontrak yang ditemukan
							</ThemedText>
						</View>
					)}
				/>
			</ThemedView>
		</Modal>
	);
}
