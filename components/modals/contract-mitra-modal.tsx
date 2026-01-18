import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ContractService } from "@/services/contract";
import { MitraService } from "@/services/mitra";
import {
	CONTRACT_STATUSES,
	CONTRACT_TYPES,
	ContractFilterForm,
	ContractFormData,
	ContractSummary,
	ContractWithMitra,
} from "@/types/contract";
import { Mitra } from "@/types/mitra";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
	TextInput,
	View,
} from "react-native";

interface ContractModalProps {
	visible: boolean;
	onClose: () => void;
}

interface CreateContractFormProps {
	visible: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

function CreateContractForm({ visible, onClose, onSuccess }: CreateContractFormProps) {
	const [loading, setLoading] = useState(false);
	const [mitras, setMitras] = useState<Mitra[]>([]);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ContractFormData>({
		defaultValues: {
			mitra_id: "",
			contract_type: "",
			title: "",
			description: "",
			value: "",
			start_date: "",
			end_date: "",
			payment_terms: "",
			delivery_terms: "",
		},
	});

	// Load mitras for selection
	const loadMitras = useCallback(async () => {
		try {
			const { data: mitrasData } = await MitraService.getMitraList();
			setMitras(mitrasData);
		} catch (error) {
			console.error("Error loading mitras:", error);
		}
	}, []);

	useEffect(() => {
		if (visible) {
			loadMitras();
		}
	}, [visible, loadMitras]);

	const onSubmit = async (data: ContractFormData) => {
		try {
			setLoading(true);
			await ContractService.createContract(data);
			Alert.alert("Berhasil", "Kontrak berhasil dibuat");
			reset();
			onClose();
			onSuccess();
		} catch (error) {
			console.error("Error creating contract:", error);
			Alert.alert("Error", "Gagal membuat kontrak");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="formSheet">
			<ThemedView className="flex-1 bg-gray-900">
				<View className="flex-row items-center justify-between p-5 border-b border-gray-700">
					<View className="flex-1">
						<ThemedText type="title" className="text-xl font-bold text-white">
							Buat Kontrak Baru
						</ThemedText>
					</View>
					<Pressable
						onPress={onClose}
						className="w-10 h-10 items-center justify-center rounded-full bg-gray-700">
						<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				<ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
					{/* Mitra Selection */}
					<View className="mb-4">
						<ThemedText className="text-white font-medium mb-2">Pilih Mitra *</ThemedText>
						<Controller
							control={control}
							render={({ field: { onChange, value } }) => (
								<View className="bg-gray-800 rounded-xl border border-gray-700">
									<ScrollView horizontal showsHorizontalScrollIndicator={false}>
										<View className="flex-row p-2 gap-2">
											{mitras.map((mitra) => (
												<Pressable
													key={mitra.id}
													onPress={() => onChange(mitra.id)}
													className={`px-4 py-2 rounded-full border ${
														value === mitra.id ? "bg-blue-600 border-blue-600" : "border-gray-600"
													}`}>
													<ThemedText
														className={`text-sm font-medium ${
															value === mitra.id ? "text-white" : "text-gray-400"
														}`}>
														{mitra.company_name}
													</ThemedText>
												</Pressable>
											))}
										</View>
									</ScrollView>
								</View>
							)}
							name="mitra_id"
							rules={{ required: "Mitra harus dipilih" }}
						/>
						{errors.mitra_id && (
							<ThemedText className="text-red-400 text-sm mt-1">
								{errors.mitra_id.message}
							</ThemedText>
						)}
					</View>

					{/* Contract Type */}
					<View className="mb-4">
						<ThemedText className="text-white font-medium mb-2">Tipe Kontrak *</ThemedText>
						<Controller
							control={control}
							render={({ field: { onChange, value } }) => (
								<View className="bg-gray-800 rounded-xl border border-gray-700">
									<ScrollView horizontal showsHorizontalScrollIndicator={false}>
										<View className="flex-row p-2 gap-2">
											{CONTRACT_TYPES.map((type) => (
												<Pressable
													key={type}
													onPress={() => onChange(type)}
													className={`px-4 py-2 rounded-full border ${
														value === type ? "bg-blue-600 border-blue-600" : "border-gray-600"
													}`}>
													<ThemedText
														className={`text-sm font-medium ${
															value === type ? "text-white" : "text-gray-400"
														}`}>
														{type}
													</ThemedText>
												</Pressable>
											))}
										</View>
									</ScrollView>
								</View>
							)}
							name="contract_type"
							rules={{ required: "Tipe kontrak harus dipilih" }}
						/>
						{errors.contract_type && (
							<ThemedText className="text-red-400 text-sm mt-1">
								{errors.contract_type.message}
							</ThemedText>
						)}
					</View>

					{/* Title */}
					<View className="mb-4">
						<ThemedText className="text-white font-medium mb-2">Judul Kontrak *</ThemedText>
						<Controller
							control={control}
							render={({ field: { onChange, value } }) => (
								<TextInput
									value={value}
									onChangeText={onChange}
									placeholder="Masukkan judul kontrak..."
									placeholderTextColor="#6B7280"
									className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
								/>
							)}
							name="title"
							rules={{ required: "Judul kontrak harus diisi" }}
						/>
						{errors.title && (
							<ThemedText className="text-red-400 text-sm mt-1">{errors.title.message}</ThemedText>
						)}
					</View>

					{/* Value */}
					<View className="mb-4">
						<ThemedText className="text-white font-medium mb-2">Nilai Kontrak (IDR) *</ThemedText>
						<Controller
							control={control}
							render={({ field: { onChange, value } }) => (
								<TextInput
									value={value}
									onChangeText={onChange}
									placeholder="500000000"
									placeholderTextColor="#6B7280"
									keyboardType="numeric"
									className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
								/>
							)}
							name="value"
							rules={{
								required: "Nilai kontrak harus diisi",
								min: { value: 1, message: "Nilai harus lebih dari 0" },
							}}
						/>
						{errors.value && (
							<ThemedText className="text-red-400 text-sm mt-1">{errors.value.message}</ThemedText>
						)}
					</View>

					{/* Date Range */}
					<View className="flex-row gap-4 mb-4">
						<View className="flex-1">
							<ThemedText className="text-white font-medium mb-2">Tanggal Mulai *</ThemedText>
							<Controller
								control={control}
								render={({ field: { onChange, value } }) => (
									<TextInput
										value={value}
										onChangeText={onChange}
										placeholder="YYYY-MM-DD"
										placeholderTextColor="#6B7280"
										className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
									/>
								)}
								name="start_date"
								rules={{ required: "Tanggal mulai harus diisi" }}
							/>
							{errors.start_date && (
								<ThemedText className="text-red-400 text-sm mt-1">
									{errors.start_date.message}
								</ThemedText>
							)}
						</View>
						<View className="flex-1">
							<ThemedText className="text-white font-medium mb-2">Tanggal Berakhir *</ThemedText>
							<Controller
								control={control}
								render={({ field: { onChange, value } }) => (
									<TextInput
										value={value}
										onChangeText={onChange}
										placeholder="YYYY-MM-DD"
										placeholderTextColor="#6B7280"
										className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
									/>
								)}
								name="end_date"
								rules={{ required: "Tanggal berakhir harus diisi" }}
							/>
							{errors.end_date && (
								<ThemedText className="text-red-400 text-sm mt-1">
									{errors.end_date.message}
								</ThemedText>
							)}
						</View>
					</View>

					{/* Description */}
					<View className="mb-4">
						<ThemedText className="text-white font-medium mb-2">Deskripsi</ThemedText>
						<Controller
							control={control}
							render={({ field: { onChange, value } }) => (
								<TextInput
									value={value}
									onChangeText={onChange}
									placeholder="Deskripsi kontrak..."
									placeholderTextColor="#6B7280"
									multiline
									numberOfLines={3}
									textAlignVertical="top"
									className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
								/>
							)}
							name="description"
						/>
					</View>

					{/* Payment Terms */}
					<View className="mb-4">
						<ThemedText className="text-white font-medium mb-2">Syarat Pembayaran</ThemedText>
						<Controller
							control={control}
							render={({ field: { onChange, value } }) => (
								<TextInput
									value={value}
									onChangeText={onChange}
									placeholder="Misalnya: 30% DP, 70% setelah delivery..."
									placeholderTextColor="#6B7280"
									multiline
									numberOfLines={2}
									textAlignVertical="top"
									className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
								/>
							)}
							name="payment_terms"
						/>
					</View>

					{/* Delivery Terms */}
					<View className="mb-6">
						<ThemedText className="text-white font-medium mb-2">Syarat Pengiriman</ThemedText>
						<Controller
							control={control}
							render={({ field: { onChange, value } }) => (
								<TextInput
									value={value}
									onChangeText={onChange}
									placeholder="Misalnya: FOB Jakarta, maksimal 14 hari..."
									placeholderTextColor="#6B7280"
									multiline
									numberOfLines={2}
									textAlignVertical="top"
									className="bg-gray-800 text-white p-4 rounded-xl border border-gray-700"
								/>
							)}
							name="delivery_terms"
						/>
					</View>

					{/* Submit Button */}
					<Pressable
						onPress={handleSubmit(onSubmit as any)}
						disabled={loading}
						className={`py-4 rounded-xl ${loading ? "bg-gray-600" : "bg-blue-600"}`}>
						{loading ? (
							<ActivityIndicator color="#FFFFFF" />
						) : (
							<ThemedText className="text-center text-white font-bold text-lg">
								Buat Kontrak
							</ThemedText>
						)}
					</Pressable>
				</ScrollView>
			</ThemedView>
		</Modal>
	);
}

export function ContractMitraModal({ visible, onClose }: ContractModalProps) {
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [contracts, setContracts] = useState<ContractWithMitra[]>([]);
	const [summary, setSummary] = useState<ContractSummary | null>(null);
	const [showCreateForm, setShowCreateForm] = useState(false);

	// Form for filtering contracts
	const { control, watch, setValue } = useForm<ContractFilterForm>({
		defaultValues: {
			searchQuery: "",
			status: "all",
			contract_type: "all",
			date_range: "all",
		},
		mode: "onChange",
	});

	// Watch form values for reactive filtering
	const searchQuery = watch("searchQuery");
	const selectedStatus = watch("status");
	const selectedType = watch("contract_type");
	const selectedDateRange = watch("date_range");

	// Load contracts data
	const loadContractsData = useCallback(async () => {
		try {
			setLoading(true);
			console.log("Loading contracts data with filters:", {
				searchQuery,
				status: selectedStatus,
				contract_type: selectedType,
				date_range: selectedDateRange,
			});

			const [contractsData, summaryData] = await Promise.all([
				ContractService.getContracts({
					searchQuery,
					status: selectedStatus,
					contract_type: selectedType === "all" ? undefined : selectedType,
					date_range: selectedDateRange,
				}),
				ContractService.getContractSummary(),
			]);

			setContracts(contractsData);
			setSummary(summaryData);
			console.log("Contracts data loaded:", { contractsData, summaryData });
		} catch (error) {
			console.error("Error loading contracts data:", error);
			Alert.alert("Error", "Gagal memuat data kontrak");
		} finally {
			setLoading(false);
		}
	}, [searchQuery, selectedStatus, selectedType, selectedDateRange]);

	// Refresh data
	const onRefresh = async () => {
		setRefreshing(true);
		await loadContractsData();
		setRefreshing(false);
	};

	// Load data when modal opens or filters change
	useEffect(() => {
		if (visible) {
			loadContractsData();
		}
	}, [visible, loadContractsData]);

	// Update contract status
	const updateContractStatus = async (
		contractId: string,
		newStatus: ContractWithMitra["status"],
	) => {
		try {
			await ContractService.updateContractStatus(contractId, newStatus);

			// Update local state
			setContracts((prev) =>
				prev.map((contract) =>
					contract.id === contractId ? { ...contract, status: newStatus } : contract,
				),
			);

			Alert.alert("Berhasil", "Status kontrak berhasil diupdate");
			await loadContractsData(); // Refresh to get updated summary
		} catch (error) {
			console.error("Error updating contract status:", error);
			Alert.alert("Error", "Gagal mengupdate status kontrak");
		}
	};

	// Delete contract
	const deleteContract = async (contractId: string, contractNumber: string) => {
		Alert.alert(
			"Konfirmasi Hapus",
			`Yakin ingin menghapus kontrak ${contractNumber}? Tindakan ini tidak dapat dibatalkan.`,
			[
				{ text: "Batal", style: "cancel" },
				{
					text: "Hapus",
					style: "destructive",
					onPress: async () => {
						try {
							await ContractService.deleteContract(contractId);
							setContracts((prev) => prev.filter((contract) => contract.id !== contractId));
							Alert.alert("Berhasil", "Kontrak berhasil dihapus");
							await loadContractsData(); // Refresh summary
						} catch (error) {
							console.error("Error deleting contract:", error);
							Alert.alert("Error", "Gagal menghapus kontrak");
						}
					},
				},
			],
		);
	};

	const getStatusColor = (status: string) => {
		const statusConfig = CONTRACT_STATUSES.find((s) => s.value === status);
		return statusConfig?.color || "bg-gray-600";
	};

	const getStatusText = (status: string) => {
		const statusConfig = CONTRACT_STATUSES.find((s) => s.value === status);
		return statusConfig?.label || status;
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("id-ID");
	};

	return (
		<>
			<Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
				<ThemedView className="flex-1 bg-gray-900">
					{/* Header */}
					<View className="flex-row items-center justify-between p-5 border-b border-gray-700">
						<View className="flex-1">
							<ThemedText type="title" className="text-xl font-bold text-white">
								Kontrak Kemitraan
							</ThemedText>
							{summary && (
								<ThemedText className="text-sm text-gray-400 mt-1">
									{summary.total_contracts} kontrak • {summary.active_contracts} aktif •{" "}
									{formatCurrency(summary.total_value)}
								</ThemedText>
							)}
						</View>
						<View className="flex-row gap-2">
							<Pressable
								onPress={() => setShowCreateForm(true)}
								className="w-10 h-10 items-center justify-center rounded-full bg-blue-600">
								<IconSymbol name="plus" size={16} color="#FFFFFF" />
							</Pressable>
							<Pressable
								onPress={onClose}
								className="w-10 h-10 items-center justify-center rounded-full bg-gray-700">
								<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
							</Pressable>
						</View>
					</View>

					<ScrollView
						className="flex-1"
						showsVerticalScrollIndicator={false}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
						{/* Filters */}
						<View className="p-5 gap-4">
							{/* Search */}
							<View className="flex-row items-center bg-gray-800 rounded-xl px-4 py-3">
								<IconSymbol name="house.fill" size={20} color="#6B7280" />
								<Controller
									control={control}
									render={({
										field: { onChange, value },
									}: {
										field: { onChange: (value: string) => void; value: string };
									}) => (
										<TextInput
											value={value}
											onChangeText={onChange}
											placeholder="Cari kontrak, mitra, atau tipe..."
											placeholderTextColor="#6B7280"
											className="flex-1 text-white ml-3"
										/>
									)}
									name="searchQuery"
								/>
							</View>

							{/* Status Filter */}
							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								<View className="flex-row gap-2">
									<Pressable
										onPress={() => setValue("status", "all")}
										className={`px-4 py-2 rounded-full border ${
											selectedStatus === "all" ? "bg-blue-600 border-blue-600" : "border-gray-600"
										}`}>
										<ThemedText
											className={`text-sm font-medium ${
												selectedStatus === "all" ? "text-white" : "text-gray-400"
											}`}>
											Semua
										</ThemedText>
									</Pressable>
									{CONTRACT_STATUSES.map((status) => (
										<Pressable
											key={status.value}
											onPress={() => setValue("status", status.value as any)}
											className={`px-4 py-2 rounded-full border ${
												selectedStatus === status.value
													? "bg-blue-600 border-blue-600"
													: "border-gray-600"
											}`}>
											<ThemedText
												className={`text-sm font-medium ${
													selectedStatus === status.value ? "text-white" : "text-gray-400"
												}`}>
												{status.label}
											</ThemedText>
										</Pressable>
									))}
								</View>
							</ScrollView>
						</View>

						{/* Loading State */}
						{loading && (
							<View className="flex-1 items-center justify-center py-20">
								<ActivityIndicator size="large" color="#3B82F6" />
								<ThemedText className="text-gray-400 mt-2">Memuat data kontrak...</ThemedText>
							</View>
						)}

						{/* Contracts List */}
						{!loading && (
							<FlatList
								data={contracts}
								keyExtractor={(item) => item.id}
								contentContainerStyle={{ padding: 20 }}
								showsVerticalScrollIndicator={false}
								ListEmptyComponent={
									<View className="items-center justify-center py-20">
										<IconSymbol name="archivebox.fill" size={64} color="#6B7280" />
										<ThemedText className="text-gray-400 text-lg mt-4">
											Tidak ada kontrak ditemukan
										</ThemedText>
										<ThemedText className="text-gray-500 text-sm mt-2 text-center">
											Coba ubah filter pencarian atau buat kontrak baru
										</ThemedText>
									</View>
								}
								renderItem={({ item }) => (
									<View className="bg-gray-800 p-4 rounded-2xl border border-gray-700 mb-4">
										<View className="flex-row justify-between items-start mb-3">
											<View className="flex-1">
												<ThemedText className="text-lg font-bold text-white mb-1">
													{item.contract_number}
												</ThemedText>
												<ThemedText className="text-sm text-gray-400">
													{item.mitra.company_name} • {item.contract_type}
												</ThemedText>
											</View>
											<View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
												<ThemedText className="text-xs font-medium text-white">
													{getStatusText(item.status)}
												</ThemedText>
											</View>
										</View>

										<ThemedText className="text-white font-medium mb-2">{item.title}</ThemedText>

										{item.description && (
											<ThemedText className="text-gray-400 text-sm mb-3" numberOfLines={2}>
												{item.description}
											</ThemedText>
										)}

										<View className="flex-row justify-between items-center mb-3">
											<View>
												<ThemedText className="text-gray-400 text-xs">Nilai Kontrak</ThemedText>
												<ThemedText className="text-white font-semibold">
													{formatCurrency(item.value)}
												</ThemedText>
											</View>
											<View>
												<ThemedText className="text-gray-400 text-xs">Periode</ThemedText>
												<ThemedText className="text-white font-semibold">
													{formatDate(item.start_date)} - {formatDate(item.end_date)}
												</ThemedText>
											</View>
										</View>

										<View className="flex-row gap-2">
											{item.status === "draft" && (
												<Pressable
													className="flex-1 bg-green-600 py-3 rounded-xl"
													onPress={() => updateContractStatus(item.id, "active")}>
													<ThemedText className="text-center text-white font-medium text-sm">
														Aktifkan
													</ThemedText>
												</Pressable>
											)}
											{item.status === "pending" && (
												<Pressable
													className="flex-1 bg-blue-600 py-3 rounded-xl"
													onPress={() => updateContractStatus(item.id, "active")}>
													<ThemedText className="text-center text-white font-medium text-sm">
														Approve
													</ThemedText>
												</Pressable>
											)}
											{item.status === "active" && (
												<Pressable
													className="flex-1 bg-orange-600 py-3 rounded-xl"
													onPress={() => updateContractStatus(item.id, "suspended")}>
													<ThemedText className="text-center text-white font-medium text-sm">
														Suspend
													</ThemedText>
												</Pressable>
											)}
											<Pressable
												className="flex-1 bg-gray-700 py-3 rounded-xl"
												onPress={() => deleteContract(item.id, item.contract_number)}>
												<ThemedText className="text-center text-gray-300 font-medium text-sm">
													Hapus
												</ThemedText>
											</Pressable>
										</View>
									</View>
								)}
							/>
						)}
					</ScrollView>
				</ThemedView>
			</Modal>

			{/* Create Contract Form Modal */}
			<CreateContractForm
				visible={showCreateForm}
				onClose={() => setShowCreateForm(false)}
				onSuccess={loadContractsData}
			/>
		</>
	);
}
