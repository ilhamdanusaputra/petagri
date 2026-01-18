import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProductService } from "@/services/product";
import { CategoryFormData, ProductCategory } from "@/types/product";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Alert,
	Modal,
	Pressable,
	ScrollView,
	TextInput,
	View,
} from "react-native";

interface AddCategoryModalProps {
	visible: boolean;
	onClose: () => void;
	onCategoryAdded?: () => void;
}

export function AddCategoryModal({ visible, onClose, onCategoryAdded }: AddCategoryModalProps) {
	const [loading, setLoading] = useState(false);
	const [parentCategories, setParentCategories] = useState<ProductCategory[]>([]);

	const {
		control,
		handleSubmit,
		setValue,
		reset,
		watch,
		formState: { errors },
	} = useForm<CategoryFormData>({
		defaultValues: {
			name: "",
			description: "",
			parent_id: "",
			sort_order: "0",
			status: "active",
		},
	});

	const parent_id = watch("parent_id");

	useEffect(() => {
		if (visible) loadParentCategories();
	}, [visible]);

	const loadParentCategories = async () => {
		try {
			const response = await ProductService.getCategories();
			setParentCategories(response.data || []);
		} catch (error) {
			console.error("Error loading categories:", error);
		}
	};

	const onSubmit = async (formData: CategoryFormData) => {
		setLoading(true);

		try {
			console.log("Creating category with data:", formData);

			const category = await ProductService.createCategory(formData);
			console.log("Category created successfully:", category);

			Alert.alert("Sukses", "Kategori berhasil ditambahkan", [
				{
					text: "OK",
					onPress: () => {
						onCategoryAdded?.();
						onClose();
						reset();
					},
				},
			]);
		} catch (error) {
			console.error("Error creating category:", error);
			Alert.alert(
				"Error",
				`Gagal menambahkan kategori: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<ThemedText type="title" className="text-xl font-bold text-white">
						Tambah Kategori Baru
					</ThemedText>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				<ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
					<View className="mb-6">
						<ThemedText className="text-lg font-semibold text-white mb-4">
							Informasi Kategori
						</ThemedText>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Nama Kategori *</ThemedText>
							<Controller
								control={control}
								name="name"
								rules={{ required: "Nama kategori wajib diisi" }}
								render={({ field }) => (
									<TextInput
										{...field}
										placeholder="Nama kategori"
										placeholderTextColor="#6B7280"
										className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									/>
								)}
							/>
							{errors.name && (
								<ThemedText className="text-red-400 text-sm mt-1">{errors.name.message}</ThemedText>
							)}
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Deskripsi</ThemedText>
							<Controller
								control={control}
								name="description"
								render={({ field }) => (
									<TextInput
										{...field}
										multiline
										numberOfLines={3}
										placeholder="Deskripsi kategori"
										placeholderTextColor="#6B7280"
										className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									/>
								)}
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Kategori Induk</ThemedText>
							<ScrollView horizontal>
								<View className="flex-row gap-2">
									<Pressable
										onPress={() => setValue("parent_id", "")}
										className={`px-3 py-2 rounded-lg ${
											!parent_id ? "bg-blue-600" : "bg-gray-700"
										}`}>
										<ThemedText className="text-white">Tanpa Induk</ThemedText>
									</Pressable>

									{parentCategories.map((category) => (
										<Pressable
											key={category.id}
											onPress={() => setValue("parent_id", category.id)}
											className={`px-3 py-2 rounded-lg ${
												parent_id === category.id ? "bg-blue-600" : "bg-gray-700"
											}`}>
											<ThemedText className="text-white">{category.name}</ThemedText>
										</Pressable>
									))}
								</View>
							</ScrollView>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Urutan Tampil</ThemedText>
							<Controller
								control={control}
								name="sort_order"
								render={({ field }) => (
									<TextInput
										{...field}
										placeholder="0"
										placeholderTextColor="#6B7280"
										keyboardType="numeric"
										className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									/>
								)}
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Status</ThemedText>
							<Controller
								control={control}
								name="status"
								render={({ field }) => (
									<View className="flex-row gap-2">
										<Pressable
											onPress={() => field.onChange("active")}
											className={`px-4 py-2 rounded-lg ${
												field.value === "active" ? "bg-green-600" : "bg-gray-700"
											}`}>
											<ThemedText className="text-white">Aktif</ThemedText>
										</Pressable>
										<Pressable
											onPress={() => field.onChange("inactive")}
											className={`px-4 py-2 rounded-lg ${
												field.value === "inactive" ? "bg-red-600" : "bg-gray-700"
											}`}>
											<ThemedText className="text-white">Tidak Aktif</ThemedText>
										</Pressable>
									</View>
								)}
							/>
						</View>
					</View>

					<View className="pb-10">
						<Pressable
							onPress={handleSubmit(onSubmit)}
							disabled={loading}
							className="bg-blue-600 py-4 rounded-xl items-center">
							{loading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<ThemedText className="text-white font-semibold">Tambah Kategori</ThemedText>
							)}
						</Pressable>
					</View>
				</ScrollView>
			</ThemedView>
		</Modal>
	);
}
