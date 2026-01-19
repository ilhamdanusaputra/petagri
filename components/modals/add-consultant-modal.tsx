import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { createConsultant } from "@/services/consultation";
import type { CreateConsultantForm } from "@/types/consultation";
import React, { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, TextInput, View } from "react-native";

interface AddConsultantModalProps {
	visible: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export default function AddConsultantModal({
	visible,
	onClose,
	onSuccess,
}: AddConsultantModalProps) {
	const [formData, setFormData] = useState<CreateConsultantForm>({
		full_name: "",
		email: "",
		phone: "",
		specialization: "",
		experience_years: 0,
		certification: [],
		bio: "",
		service_areas: [],
	});

	const [certificationInput, setCertificationInput] = useState("");
	const [serviceAreaInput, setServiceAreaInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async () => {
		if (!formData.full_name || !formData.email || !formData.phone || !formData.specialization) {
			Alert.alert("Error", "Please fill in all required fields");
			return;
		}

		setIsLoading(true);
		try {
			await createConsultant(formData);
			Alert.alert("Success", "Consultant added successfully");
			onSuccess();
			onClose();
			resetForm();
		} catch (error) {
			console.error("Error creating consultant:", error);
			Alert.alert("Error", "Failed to add consultant");
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			full_name: "",
			email: "",
			phone: "",
			specialization: "",
			experience_years: 0,
			certification: [],
			bio: "",
			service_areas: [],
		});
		setCertificationInput("");
		setServiceAreaInput("");
	};

	const addCertification = () => {
		if (certificationInput.trim()) {
			setFormData((prev) => ({
				...prev,
				certification: [...prev.certification, certificationInput.trim()],
			}));
			setCertificationInput("");
		}
	};

	const addServiceArea = () => {
		if (serviceAreaInput.trim()) {
			setFormData((prev) => ({
				...prev,
				service_areas: [...prev.service_areas, serviceAreaInput.trim()],
			}));
			setServiceAreaInput("");
		}
	};

	const removeCertification = (index: number) => {
		setFormData((prev) => ({
			...prev,
			certification: prev.certification.filter((_, i) => i !== index),
		}));
	};

	const removeServiceArea = (index: number) => {
		setFormData((prev) => ({
			...prev,
			service_areas: prev.service_areas.filter((_, i) => i !== index),
		}));
	};

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<ThemedText type="title" className="text-xl font-bold text-white">
						Add New Consultant
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
							Basic Information
						</ThemedText>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Full Name *</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.full_name}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, full_name: text }))}
								placeholder="Enter consultant's full name"
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Email *</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.email}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
								placeholder="Enter email address"
								keyboardType="email-address"
								autoCapitalize="none"
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Phone *</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.phone}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
								placeholder="Enter phone number"
								keyboardType="phone-pad"
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Specialization *</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.specialization}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, specialization: text }))}
								placeholder="e.g., Crop Management, Soil Health, Pest Control"
							/>
						</View>
					</View>

					<View className="mb-6">
						<ThemedText className="text-lg font-semibold text-white mb-4">
							Professional Details
						</ThemedText>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Years of Experience</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.experience_years.toString()}
								onChangeText={(text) =>
									setFormData((prev) => ({
										...prev,
										experience_years: parseInt(text) || 0,
									}))
								}
								placeholder="0"
								keyboardType="numeric"
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Bio</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.bio}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, bio: text }))}
								placeholder="Brief description of consultant's background"
								multiline
								numberOfLines={3}
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Certifications</ThemedText>
							<View className="flex-row mb-2 gap-2">
								<TextInput
									className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									placeholderTextColor="#6B7280"
									value={certificationInput}
									onChangeText={setCertificationInput}
									placeholder="Add certification"
								/>
								<Pressable className="bg-blue-600 px-4 py-3 rounded-xl" onPress={addCertification}>
									<ThemedText className="text-white font-medium">Add</ThemedText>
								</Pressable>
							</View>
							{formData.certification.map((cert, index) => (
								<View
									key={index}
									className="flex-row justify-between items-center bg-gray-700 p-3 rounded-lg mb-2">
									<ThemedText className="text-white">{cert}</ThemedText>
									<Pressable onPress={() => removeCertification(index)}>
										<ThemedText className="text-red-400">Remove</ThemedText>
									</Pressable>
								</View>
							))}
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Service Areas</ThemedText>
							<View className="flex-row mb-2 gap-2">
								<TextInput
									className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									placeholderTextColor="#6B7280"
									value={serviceAreaInput}
									onChangeText={setServiceAreaInput}
									placeholder="Add service area"
								/>
								<Pressable className="bg-blue-600 px-4 py-3 rounded-xl" onPress={addServiceArea}>
									<ThemedText className="text-white font-medium">Add</ThemedText>
								</Pressable>
							</View>
							{formData.service_areas.map((area, index) => (
								<View
									key={index}
									className="flex-row justify-between items-center bg-gray-700 p-3 rounded-lg mb-2">
									<ThemedText className="text-white">{area}</ThemedText>
									<Pressable onPress={() => removeServiceArea(index)}>
										<ThemedText className="text-red-400">Remove</ThemedText>
									</Pressable>
								</View>
							))}
						</View>
					</View>
				</ScrollView>
				<View className="pb-10">
					<Pressable
						onPress={handleSubmit}
						disabled={isLoading}
						className={`py-4 rounded-xl items-center mx-6 ${isLoading ? "bg-gray-600" : "bg-green-600"}`}>
						<ThemedText className="text-white text-center font-semibold">
							{isLoading ? "Adding..." : "Add Consultant"}
						</ThemedText>
					</Pressable>
				</View>
			</ThemedView>
		</Modal>
	);
}
