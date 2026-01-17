import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MitraService } from "@/services/mitra";
import { MitraFormData } from "@/types/mitra";
import React, { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, TextInput, View } from "react-native";

interface RegisterMitraModalProps {
	visible: boolean;
	onClose: () => void;
}

export function RegisterMitraModal({ visible, onClose }: RegisterMitraModalProps) {
	const [formData, setFormData] = useState<MitraFormData>({
		companyName: "",
		contactPerson: "",
		email: "",
		phone: "",
		address: "",
		businessType: "",
		description: "",
		website: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleInputChange = (field: keyof MitraFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validatePhone = (phone: string) => {
		const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
		return phoneRegex.test(phone);
	};

	const resetForm = () => {
		setFormData({
			companyName: "",
			contactPerson: "",
			email: "",
			phone: "",
			address: "",
			businessType: "",
			description: "",
			website: "",
		});
	};

	const handleSubmit = async () => {
		// Comprehensive validation
		if (!formData.companyName.trim()) {
			Alert.alert("Error", "Nama perusahaan wajib diisi");
			return;
		}

		if (!formData.contactPerson.trim()) {
			Alert.alert("Error", "Nama kontak person wajib diisi");
			return;
		}

		if (!formData.email.trim()) {
			Alert.alert("Error", "Email wajib diisi");
			return;
		}

		if (!validateEmail(formData.email)) {
			Alert.alert("Error", "Format email tidak valid");
			return;
		}

		if (!formData.phone.trim()) {
			Alert.alert("Error", "Nomor telepon wajib diisi");
			return;
		}

		if (!validatePhone(formData.phone)) {
			Alert.alert("Error", "Format nomor telepon tidak valid");
			return;
		}

		setIsSubmitting(true);

		try {
			// Check if email already exists
			const emailExists = await MitraService.checkEmailExists(formData.email);
			if (emailExists) {
				Alert.alert("Error", "Email sudah terdaftar. Gunakan email lain.");
				setIsSubmitting(false);
				return;
			}

			// Create mitra in database
			const mitraData = {
				company_name: formData.companyName.trim(),
				contact_person: formData.contactPerson.trim(),
				email: formData.email.toLowerCase().trim(),
				phone: formData.phone.trim(),
				address: formData.address.trim() || undefined,
				business_type: formData.businessType.trim() || undefined,
				description: formData.description.trim() || undefined,
				website: formData.website.trim() || undefined,
			};

			const newMitra = await MitraService.createMitra(mitraData);

			Alert.alert("Berhasil!", `Mitra "${newMitra.company_name}" berhasil didaftarkan`, [
				{
					text: "OK",
					onPress: () => {
						resetForm();
						onClose();
					},
				},
			]);
		} catch (error) {
			console.error("Error creating mitra:", error);
			Alert.alert("Error", error instanceof Error ? error.message : "Gagal menyimpan data mitra");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
			onRequestClose={handleClose}>
			<ThemedView className="flex-1 bg-gray-900">
				{/* Header */}
				<View className="flex-row items-center justify-between p-5 border-b border-gray-700">
					<ThemedText type="title" className="text-xl font-bold text-white">
						Daftar Mitra Baru
					</ThemedText>
					<Pressable
						onPress={handleClose}
						className="w-8 h-8 items-center justify-center rounded-full bg-gray-700">
						<IconSymbol name="xmark" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				<ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
					<View className="gap-4">
						{/* Company Name */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
								Nama Perusahaan *
							</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
								placeholder="Masukkan nama perusahaan"
								placeholderTextColor="#6B7280"
								value={formData.companyName}
								onChangeText={(value) => handleInputChange("companyName", value)}
							/>
						</View>

						{/* Contact Person */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
								Nama Kontak Person *
							</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
								placeholder="Masukkan nama kontak person"
								placeholderTextColor="#6B7280"
								value={formData.contactPerson}
								onChangeText={(value) => handleInputChange("contactPerson", value)}
							/>
						</View>

						{/* Email */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">Email *</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
								placeholder="nama@email.com"
								placeholderTextColor="#6B7280"
								value={formData.email}
								onChangeText={(value) => handleInputChange("email", value)}
								keyboardType="email-address"
								autoCapitalize="none"
							/>
						</View>

						{/* Phone */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
								Nomor Telepon *
							</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
								placeholder="08xxxxxxxxxx"
								placeholderTextColor="#6B7280"
								value={formData.phone}
								onChangeText={(value) => handleInputChange("phone", value)}
								keyboardType="phone-pad"
							/>
						</View>

						{/* Business Type */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
								Jenis Bisnis
							</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
								placeholder="Contoh: Distributor, Retailer, Supplier"
								placeholderTextColor="#6B7280"
								value={formData.businessType}
								onChangeText={(value) => handleInputChange("businessType", value)}
							/>
						</View>

						{/* Website */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">Website</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
								placeholder="https://www.website.com"
								placeholderTextColor="#6B7280"
								value={formData.website}
								onChangeText={(value) => handleInputChange("website", value)}
								keyboardType="url"
								autoCapitalize="none"
							/>
						</View>

						{/* Address */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">Alamat</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
								placeholder="Masukkan alamat lengkap"
								placeholderTextColor="#6B7280"
								value={formData.address}
								onChangeText={(value) => handleInputChange("address", value)}
								multiline
								numberOfLines={3}
								style={{ minHeight: 80, textAlignVertical: "top" }}
							/>
						</View>

						{/* Description */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
								Deskripsi Bisnis
							</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
								placeholder="Jelaskan secara singkat tentang bisnis mitra"
								placeholderTextColor="#6B7280"
								value={formData.description}
								onChangeText={(value) => handleInputChange("description", value)}
								multiline
								numberOfLines={4}
								style={{ minHeight: 100, textAlignVertical: "top" }}
							/>
						</View>
					</View>
				</ScrollView>

				{/* Footer */}
				<View className="p-5 border-t border-gray-700 gap-3">
					<Pressable
						className={`bg-blue-600 rounded-xl p-4 items-center ${isSubmitting ? "opacity-50" : ""}`}
						onPress={handleSubmit}
						disabled={isSubmitting}>
						<ThemedText className="text-white font-semibold text-base">
							{isSubmitting ? "Menyimpan..." : "Daftar Mitra"}
						</ThemedText>
					</Pressable>

					<Pressable className="bg-gray-700 rounded-xl p-4 items-center" onPress={handleClose}>
						<ThemedText className="text-gray-300 font-semibold text-base">Batal</ThemedText>
					</Pressable>
				</View>
			</ThemedView>
		</Modal>
	);
}
