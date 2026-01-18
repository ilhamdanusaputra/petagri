import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { MitraFormData } from "@/types/mitra";
import { supabase } from "@/utils/supabase";
import React, { useState } from "react";
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

interface RegisterMitraModalProps {
	visible: boolean;
	onClose: () => void;
}

export function RegisterMitraModal({ visible, onClose }: RegisterMitraModalProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<MitraFormData>({
		defaultValues: {
			companyName: "",
			contactPerson: "",
			email: "",
			phone: "",
			address: "",
			businessType: "",
			description: "",
			website: "",
		},
		mode: "onChange",
	});

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email) || "Format email tidak valid";
	};

	const validatePhone = (phone: string) => {
		const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
		return phoneRegex.test(phone) || "Format nomor telepon tidak valid";
	};

	const onSubmit = async (data: MitraFormData) => {
		console.log("Form submitted with data:", data);
		setIsSubmitting(true);

		try {
			// Test Supabase connection first
			console.log("Testing Supabase connection...");
			const { data: testData, error: testError } = await supabase
				.from("mitra")
				.select("count")
				.limit(1);

			console.log("Connection test:", { testData, testError });

			// Check if email already exists
			console.log("Checking if email exists...");
			const { data: existingMitra, error: checkError } = await supabase
				.from("mitra")
				.select("id")
				.eq("email", data.email.toLowerCase().trim())
				.single();

			console.log("Email check result:", { existingMitra, checkError });

			if (checkError && checkError.code !== "PGRST116") {
				console.error("Error checking email:", checkError);
				throw new Error(`Gagal memeriksa email: ${checkError.message}`);
			}

			if (existingMitra) {
				Alert.alert("Error", "Email sudah terdaftar. Gunakan email lain.");
				return;
			}

			// Prepare data for insert
			const insertData = {
				company_name: data.companyName.trim(),
				contact_person: data.contactPerson.trim(),
				email: data.email.toLowerCase().trim(),
				phone: data.phone.trim(),
				address: data.address?.trim() || null,
				business_type: data.businessType?.trim() || null,
				description: data.description?.trim() || null,
				website: data.website?.trim() || null,
				status: "pending",
			};
			const { data: newMitra, error: insertError } = await supabase
				.from("mitra")
				.insert([insertData])
				.select()
				.single();
			console.log("Insert result:", { newMitra, insertError });
			if (insertError) {
				console.error("Insert error:", insertError);
				Alert.alert("Error", `Gagal menyimpan data mitra: ${insertError.message}`);
				return;
			}
			console.log("Success! New mitra created:", newMitra);
			Alert.alert("Berhasil!", `Mitra "${newMitra.company_name}" berhasil didaftarkan`, [
				{
					text: "OK",
					onPress: () => {
						reset();
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
		reset();
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
							<Controller
								control={control}
								rules={{
									required: "Nama perusahaan wajib diisi",
									minLength: { value: 2, message: "Minimal 2 karakter" },
								}}
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										className={`bg-gray-800 border rounded-xl p-4 text-white text-base ${
											errors.companyName ? "border-red-500" : "border-gray-600"
										}`}
										placeholder="Masukkan nama perusahaan"
										placeholderTextColor="#6B7280"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
									/>
								)}
								name="companyName"
							/>
							{errors.companyName && (
								<ThemedText className="text-red-400 text-sm mt-1">
									{errors.companyName.message}
								</ThemedText>
							)}
						</View>

						{/* Contact Person */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
								Nama Kontak Person *
							</ThemedText>
							<Controller
								control={control}
								rules={{
									required: "Nama kontak person wajib diisi",
									minLength: { value: 2, message: "Minimal 2 karakter" },
								}}
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										className={`bg-gray-800 border rounded-xl p-4 text-white text-base ${
											errors.contactPerson ? "border-red-500" : "border-gray-600"
										}`}
										placeholder="Masukkan nama kontak person"
										placeholderTextColor="#6B7280"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
									/>
								)}
								name="contactPerson"
							/>
							{errors.contactPerson && (
								<ThemedText className="text-red-400 text-sm mt-1">
									{errors.contactPerson.message}
								</ThemedText>
							)}
						</View>

						{/* Email */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">Email *</ThemedText>
							<Controller
								control={control}
								rules={{
									required: "Email wajib diisi",
									validate: validateEmail,
								}}
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										className={`bg-gray-800 border rounded-xl p-4 text-white text-base ${
											errors.email ? "border-red-500" : "border-gray-600"
										}`}
										placeholder="nama@email.com"
										placeholderTextColor="#6B7280"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										keyboardType="email-address"
										autoCapitalize="none"
									/>
								)}
								name="email"
							/>
							{errors.email && (
								<ThemedText className="text-red-400 text-sm mt-1">
									{errors.email.message}
								</ThemedText>
							)}
						</View>

						{/* Phone */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
								Nomor Telepon *
							</ThemedText>
							<Controller
								control={control}
								rules={{
									required: "Nomor telepon wajib diisi",
									validate: validatePhone,
								}}
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										className={`bg-gray-800 border rounded-xl p-4 text-white text-base ${
											errors.phone ? "border-red-500" : "border-gray-600"
										}`}
										placeholder="08xxxxxxxxxx"
										placeholderTextColor="#6B7280"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										keyboardType="phone-pad"
									/>
								)}
								name="phone"
							/>
							{errors.phone && (
								<ThemedText className="text-red-400 text-sm mt-1">
									{errors.phone.message}
								</ThemedText>
							)}
						</View>

						{/* Business Type */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
								Jenis Bisnis
							</ThemedText>
							<Controller
								control={control}
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
										placeholder="Contoh: Distributor, Retailer, Supplier"
										placeholderTextColor="#6B7280"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
									/>
								)}
								name="businessType"
							/>
						</View>

						{/* Website */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">Website</ThemedText>
							<Controller
								control={control}
								rules={{
									pattern: {
										value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
										message: "Format URL tidak valid",
									},
								}}
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										className={`bg-gray-800 border rounded-xl p-4 text-white text-base ${
											errors.website ? "border-red-500" : "border-gray-600"
										}`}
										placeholder="https://www.website.com"
										placeholderTextColor="#6B7280"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										keyboardType="url"
										autoCapitalize="none"
									/>
								)}
								name="website"
							/>
							{errors.website && (
								<ThemedText className="text-red-400 text-sm mt-1">
									{errors.website.message}
								</ThemedText>
							)}
						</View>

						{/* Address */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">Alamat</ThemedText>
							<Controller
								control={control}
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
										placeholder="Masukkan alamat lengkap"
										placeholderTextColor="#6B7280"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										multiline
										numberOfLines={3}
										style={{ minHeight: 80, textAlignVertical: "top" }}
									/>
								)}
								name="address"
							/>
						</View>

						{/* Description */}
						<View>
							<ThemedText className="text-sm font-semibold text-gray-300 mb-2">
								Deskripsi Bisnis
							</ThemedText>
							<Controller
								control={control}
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										className="bg-gray-800 border border-gray-600 rounded-xl p-4 text-white text-base"
										placeholder="Jelaskan secara singkat tentang bisnis mitra"
										placeholderTextColor="#6B7280"
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										multiline
										numberOfLines={4}
										style={{ minHeight: 100, textAlignVertical: "top" }}
									/>
								)}
								name="description"
							/>
						</View>
					</View>
				</ScrollView>

				{/* Footer */}
				<View className="p-5 border-t border-gray-700 gap-3">
					<Pressable
						className={`bg-blue-600 rounded-xl p-4 items-center flex-row justify-center gap-2 ${
							isSubmitting ? "opacity-50" : ""
						}`}
						onPress={handleSubmit(onSubmit)}
						disabled={isSubmitting}>
						{isSubmitting && <ActivityIndicator size="small" color="#FFFFFF" />}
						<ThemedText className="text-white font-semibold text-base">
							{isSubmitting ? "Menyimpan..." : "Daftar Mitra"}
						</ThemedText>
					</Pressable>

					<Pressable
						className="bg-gray-700 rounded-xl p-4 items-center"
						onPress={handleClose}
						disabled={isSubmitting}>
						<ThemedText className="text-gray-300 font-semibold text-base">Batal</ThemedText>
					</Pressable>
				</View>
			</ThemedView>
		</Modal>
	);
}
