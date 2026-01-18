import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Mitra } from "@/types/mitra";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
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

interface ManageMitraModalProps {
	visible: boolean;
	onClose: () => void;
}

interface FilterFormData {
	search: string;
	status: "all" | "active" | "pending" | "inactive";
}

export function ManageMitraModal({ visible, onClose }: ManageMitraModalProps) {
	const [mitraData, setMitraData] = useState<Mitra[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedMitra, setSelectedMitra] = useState<Mitra | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);

	const {
		control,
		watch,
		reset: resetFilters,
	} = useForm<FilterFormData>({
		defaultValues: {
			search: "",
			status: "all",
		},
		mode: "onChange",
	});

	const searchQuery = watch("search");
	const selectedStatus = watch("status");

	// Load mitra data from Supabase
	const loadMitraData = async () => {
		setLoading(true);
		try {
			const { data, error } = await supabase
				.from("mitra")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) {
				throw error;
			}

			setMitraData(data || []);
			console.log("Loaded mitra data:", data);
		} catch (error) {
			console.error("Error loading mitra data:", error);
			Alert.alert("Error", "Gagal memuat data mitra");
		} finally {
			setLoading(false);
		}
	};

	// Refresh data
	const onRefresh = async () => {
		setRefreshing(true);
		await loadMitraData();
		setRefreshing(false);
	};

	// Update mitra status
	const updateMitraStatus = async (
		mitraId: string,
		newStatus: "active" | "pending" | "inactive",
	) => {
		try {
			const { error } = await supabase
				.from("mitra")
				.update({ status: newStatus, updated_at: new Date().toISOString() })
				.eq("id", mitraId);

			if (error) {
				throw error;
			}

			// Update local state
			setMitraData((prev) =>
				prev.map((mitra) => (mitra.id === mitraId ? { ...mitra, status: newStatus } : mitra)),
			);

			Alert.alert("Berhasil", "Status mitra berhasil diupdate");
		} catch (error) {
			console.error("Error updating mitra status:", error);
			Alert.alert("Error", "Gagal mengupdate status mitra");
		}
	};

	// Delete mitra
	const deleteMitra = (mitraId: string, companyName: string) => {
		Alert.alert(
			"Konfirmasi Hapus",
			`Apakah Anda yakin ingin menghapus mitra "${companyName}"? Tindakan ini tidak dapat dibatalkan.`,
			[
				{ text: "Batal", style: "cancel" },
				{
					text: "Hapus",
					style: "destructive",
					onPress: async () => {
						try {
							const { error } = await supabase.from("mitra").delete().eq("id", mitraId);

							if (error) {
								throw error;
							}

							setMitraData((prev) => prev.filter((mitra) => mitra.id !== mitraId));
							Alert.alert("Berhasil", "Mitra berhasil dihapus");
						} catch (error) {
							console.error("Error deleting mitra:", error);
							Alert.alert("Error", "Gagal menghapus mitra");
						}
					},
				},
			],
		);
	};

	// Load data when modal opens
	useEffect(() => {
		if (visible) {
			loadMitraData();
		}
	}, [visible]);

	const filteredMitra = mitraData.filter((mitra) => {
		const matchesSearch =
			mitra.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			mitra.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
			mitra.email.toLowerCase().includes(searchQuery.toLowerCase());
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
						<Controller
							control={control}
							render={({ field: { onChange, value } }) => (
								<TextInput
									className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
									placeholder="Cari nama perusahaan atau kontak person..."
									placeholderTextColor="#6B7280"
									value={value}
									onChangeText={onChange}
								/>
							)}
							name="search"
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
									onPress={() => {
										// Update form value using Controller
										resetFilters({ search: searchQuery, status: filter.key as any });
									}}>
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

				{/* Loading State */}
				{loading && (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size="large" color="#3B82F6" />
						<ThemedText className="text-gray-400 mt-2">Memuat data mitra...</ThemedText>
					</View>
				)}

				{/* Mitra List */}
				{!loading && (
					<FlatList
						data={filteredMitra}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{ padding: 20 }}
						showsVerticalScrollIndicator={false}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
						ListEmptyComponent={
							<View className="items-center justify-center py-20">
								<IconSymbol name="house.fill" size={64} color="#6B7280" />
								<ThemedText className="text-gray-400 text-lg mt-4">
									Tidak ada mitra ditemukan
								</ThemedText>
								<ThemedText className="text-gray-500 text-sm mt-2 text-center">
									Coba ubah filter pencarian atau tambah mitra baru
								</ThemedText>
							</View>
						}
						renderItem={({ item }) => (
							<View className="bg-gray-800 p-4 rounded-2xl border border-gray-700 mb-4">
								<View className="flex-row justify-between items-start mb-3">
									<View className="flex-1">
										<ThemedText className="text-lg font-bold text-white mb-1">
											{item.company_name}
										</ThemedText>
										<ThemedText className="text-sm text-gray-400">
											{item.contact_person} • {item.business_type}
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
										<IconSymbol name="bag.fill" size={14} color="#9CA3AF" />
										<ThemedText className="text-sm text-gray-400">{item.email}</ThemedText>
									</View>
									<View className="flex-row items-center gap-2">
										<IconSymbol name="gear" size={14} color="#9CA3AF" />
										<ThemedText className="text-sm text-gray-400">{item.phone}</ThemedText>
									</View>
									{item.address && (
										<View className="flex-row items-center gap-2">
											<IconSymbol name="house.fill" size={14} color="#9CA3AF" />
											<ThemedText className="text-sm text-gray-400 flex-1" numberOfLines={2}>
												{item.address}
											</ThemedText>
										</View>
									)}
									<View className="flex-row items-center gap-2">
										<IconSymbol name="bell.fill" size={14} color="#9CA3AF" />
										<ThemedText className="text-sm text-gray-400">
											Bergabung: {new Date(item.created_at).toLocaleDateString("id-ID")}
										</ThemedText>
									</View>
								</View>

								<View className="flex-row gap-2">
									<Pressable
										className="flex-1 bg-blue-600 py-3 rounded-xl"
										onPress={() => {
											setSelectedMitra(item);
											setShowEditModal(true);
										}}>
										<ThemedText className="text-center text-white font-medium text-sm">
											Edit
										</ThemedText>
									</Pressable>
									<Pressable
										className="flex-1 bg-gray-700 py-3 rounded-xl"
										onPress={() => {
											deleteMitra(item.id, item.company_name);
										}}>
										<ThemedText className="text-center text-gray-300 font-medium text-sm">
											Hapus
										</ThemedText>
									</Pressable>
									<Pressable
										className="px-4 py-3 bg-gray-700 rounded-xl"
										onPress={() => {
											const newStatus = item.status === "active" ? "inactive" : "active";
											updateMitraStatus(item.id, newStatus);
										}}>
										<IconSymbol name="gear" size={16} color="#9CA3AF" />
									</Pressable>
								</View>
							</View>
						)}
					/>
				)}
			</ThemedView>

			{/* Edit Mitra Modal */}
			{showEditModal && selectedMitra && (
				<EditMitraModal
					visible={showEditModal}
					onClose={() => {
						setShowEditModal(false);
						setSelectedMitra(null);
					}}
					mitra={selectedMitra}
					onUpdate={(updatedMitra) => {
						setMitraData((prev) =>
							prev.map((item) => (item.id === updatedMitra.id ? updatedMitra : item)),
						);
						setShowEditModal(false);
						setSelectedMitra(null);
					}}
				/>
			)}
		</Modal>
	);
}

// Simple Edit Modal Component (to be implemented)
interface EditMitraModalProps {
	visible: boolean;
	onClose: () => void;
	mitra: Mitra;
	onUpdate: (mitra: Mitra) => void;
}

function EditMitraModal({ visible, onClose, mitra, onUpdate }: EditMitraModalProps) {
	const { control, handleSubmit, reset } = useForm<Mitra>({
		defaultValues: mitra,
	});

	useEffect(() => {
		if (visible) {
			reset(mitra);
		}
	}, [visible, mitra, reset]);

	const onSubmit = async (data: Mitra) => {
		try {
			const { error } = await supabase
				.from("mitra")
				.update({
					company_name: data.company_name,
					contact_person: data.contact_person,
					email: data.email,
					phone: data.phone,
					business_type: data.business_type,
					address: data.address,
					updated_at: new Date().toISOString(),
				})
				.eq("id", mitra.id);

			if (error) throw error;

			onUpdate({ ...mitra, ...data, updated_at: new Date().toISOString() });
			Alert.alert("Berhasil", "Data mitra berhasil diupdate");
		} catch (error) {
			console.error("Error updating mitra:", error);
			Alert.alert("Error", "Gagal mengupdate data mitra");
		}
	};

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-gray-900">
				{/* Header */}
				<View className="flex-row items-center justify-between p-5 border-b border-gray-800">
					<ThemedText className="text-xl font-bold text-white">Edit Mitra</ThemedText>
					<Pressable onPress={onClose}>
						<IconSymbol name="xmark" size={24} color="#9CA3AF" />
					</Pressable>
				</View>

				{/* Form */}
				<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
					<View className="p-5 gap-4">
						{/* Company Name */}
						<View>
							<ThemedText className="text-white mb-2 font-medium">Nama Perusahaan*</ThemedText>
							<Controller
								control={control}
								rules={{ required: "Nama perusahaan wajib diisi" }}
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<>
										<TextInput
											className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
											value={value}
											onChangeText={onChange}
											placeholder="PT. Contoh Indonesia"
											placeholderTextColor="#6B7280"
										/>
										{error && (
											<ThemedText className="text-red-400 text-sm mt-1">{error.message}</ThemedText>
										)}
									</>
								)}
								name="company_name"
							/>
						</View>

						{/* Contact Person */}
						<View>
							<ThemedText className="text-white mb-2 font-medium">Kontak Person*</ThemedText>
							<Controller
								control={control}
								rules={{ required: "Kontak person wajib diisi" }}
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<>
										<TextInput
											className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
											value={value}
											onChangeText={onChange}
											placeholder="John Doe"
											placeholderTextColor="#6B7280"
										/>
										{error && (
											<ThemedText className="text-red-400 text-sm mt-1">{error.message}</ThemedText>
										)}
									</>
								)}
								name="contact_person"
							/>
						</View>

						{/* Email */}
						<View>
							<ThemedText className="text-white mb-2 font-medium">Email*</ThemedText>
							<Controller
								control={control}
								rules={{
									required: "Email wajib diisi",
									pattern: {
										value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message: "Format email tidak valid",
									},
								}}
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<>
										<TextInput
											className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
											value={value}
											onChangeText={onChange}
											placeholder="john@company.com"
											placeholderTextColor="#6B7280"
											keyboardType="email-address"
											autoCapitalize="none"
										/>
										{error && (
											<ThemedText className="text-red-400 text-sm mt-1">{error.message}</ThemedText>
										)}
									</>
								)}
								name="email"
							/>
						</View>

						{/* Phone */}
						<View>
							<ThemedText className="text-white mb-2 font-medium">Nomor Telepon*</ThemedText>
							<Controller
								control={control}
								rules={{ required: "Nomor telepon wajib diisi" }}
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<>
										<TextInput
											className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
											value={value}
											onChangeText={onChange}
											placeholder="+62 812 3456 7890"
											placeholderTextColor="#6B7280"
											keyboardType="phone-pad"
										/>
										{error && (
											<ThemedText className="text-red-400 text-sm mt-1">{error.message}</ThemedText>
										)}
									</>
								)}
								name="phone"
							/>
						</View>

						{/* Business Type */}
						<View>
							<ThemedText className="text-white mb-2 font-medium">Jenis Bisnis*</ThemedText>
							<Controller
								control={control}
								rules={{ required: "Jenis bisnis wajib diisi" }}
								render={({ field: { onChange, value }, fieldState: { error } }) => (
									<>
										<TextInput
											className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
											value={value}
											onChangeText={onChange}
											placeholder="Retail, Distributor, Petani, dll"
											placeholderTextColor="#6B7280"
										/>
										{error && (
											<ThemedText className="text-red-400 text-sm mt-1">{error.message}</ThemedText>
										)}
									</>
								)}
								name="business_type"
							/>
						</View>

						{/* Address */}
						<View>
							<ThemedText className="text-white mb-2 font-medium">Alamat</ThemedText>
							<Controller
								control={control}
								render={({ field: { onChange, value } }) => (
									<TextInput
										className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
										value={value || ""}
										onChangeText={onChange}
										placeholder="Alamat lengkap perusahaan"
										placeholderTextColor="#6B7280"
										multiline
										numberOfLines={3}
										textAlignVertical="top"
									/>
								)}
								name="address"
							/>
						</View>
					</View>

					{/* Submit Button */}
					<View className="p-5">
						<Pressable className="bg-blue-600 py-4 rounded-xl" onPress={handleSubmit(onSubmit)}>
							<ThemedText className="text-center text-white font-semibold text-base">
								Simpan Perubahan
							</ThemedText>
						</Pressable>
					</View>
				</ScrollView>
			</ThemedView>
		</Modal>
	);
}
