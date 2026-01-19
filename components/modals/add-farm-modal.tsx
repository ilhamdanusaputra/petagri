import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { createFarm } from "@/services/consultation";
import type { CreateFarmForm } from "@/types/consultation";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, TextInput, View } from "react-native";

interface AddFarmModalProps {
	visible: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export default function AddFarmModal({ visible, onClose, onSuccess }: AddFarmModalProps) {
	const [formData, setFormData] = useState<CreateFarmForm>({
		farm_name: "",
		owner_name: "",
		contact_email: "",
		contact_phone: "",
		address: "",
		province: "",
		city: "",
		postal_code: "",
		total_area: 0,
		crop_types: [],
		farming_method: "conventional",
		established_year: new Date().getFullYear(),
		current_season: "",
		irrigation_system: "",
		soil_type: "",
		climate_zone: "",
	});

	const [cropTypeInput, setCropTypeInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async () => {
		if (
			!formData.farm_name ||
			!formData.owner_name ||
			!formData.contact_email ||
			!formData.contact_phone ||
			!formData.address ||
			!formData.total_area
		) {
			Alert.alert("Error", "Please fill in all required fields");
			return;
		}

		setIsLoading(true);
		try {
			await createFarm(formData);
			Alert.alert("Success", "Farm added successfully");
			onSuccess();
			onClose();
			resetForm();
		} catch (error) {
			console.error("Error creating farm:", error);
			Alert.alert("Error", "Failed to add farm");
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			farm_name: "",
			owner_name: "",
			contact_email: "",
			contact_phone: "",
			address: "",
			province: "",
			city: "",
			postal_code: "",
			total_area: 0,
			crop_types: [],
			farming_method: "conventional",
			established_year: new Date().getFullYear(),
			current_season: "",
			irrigation_system: "",
			soil_type: "",
			climate_zone: "",
		});
		setCropTypeInput("");
	};

	const addCropType = () => {
		if (cropTypeInput.trim()) {
			setFormData((prev) => ({
				...prev,
				crop_types: [...prev.crop_types, cropTypeInput.trim()],
			}));
			setCropTypeInput("");
		}
	};

	const removeCropType = (index: number) => {
		setFormData((prev) => ({
			...prev,
			crop_types: prev.crop_types.filter((_, i) => i !== index),
		}));
	};

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<ThemedText type="title" className="text-xl font-bold text-white">
						Add New Farm
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
							<ThemedText className="text-sm text-gray-300 mb-2">Farm Name *</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.farm_name}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, farm_name: text }))}
								placeholder="Enter farm name"
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Owner Name *</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.owner_name}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, owner_name: text }))}
								placeholder="Enter owner's name"
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Contact Email *</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.contact_email}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, contact_email: text }))}
								placeholder="Enter email address"
								keyboardType="email-address"
								autoCapitalize="none"
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Contact Phone *</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.contact_phone}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, contact_phone: text }))}
								placeholder="Enter phone number"
								keyboardType="phone-pad"
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Address *</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.address}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, address: text }))}
								placeholder="Enter complete address"
								multiline
								numberOfLines={3}
							/>
						</View>

						<View className="flex-row gap-3 mb-4">
							<View className="flex-1">
								<ThemedText className="text-sm text-gray-300 mb-2">Province</ThemedText>
								<TextInput
									className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									placeholderTextColor="#6B7280"
									value={formData.province}
									onChangeText={(text) => setFormData((prev) => ({ ...prev, province: text }))}
									placeholder="Province"
								/>
							</View>
							<View className="flex-1">
								<ThemedText className="text-sm text-gray-300 mb-2">City</ThemedText>
								<TextInput
									className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									placeholderTextColor="#6B7280"
									value={formData.city}
									onChangeText={(text) => setFormData((prev) => ({ ...prev, city: text }))}
									placeholder="City"
								/>
							</View>
						</View>
					</View>

					<View className="mb-6">
						<ThemedText className="text-lg font-semibold text-white mb-4">Farm Details</ThemedText>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">
								Total Area (hectares) *
							</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.total_area.toString()}
								onChangeText={(text) =>
									setFormData((prev) => ({
										...prev,
										total_area: parseFloat(text) || 0,
									}))
								}
								placeholder="0.0"
								keyboardType="decimal-pad"
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Farming Method</ThemedText>
							<View className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
								<Picker
									selectedValue={formData.farming_method}
									style={{ color: "#FFFFFF" }}
									onValueChange={(value: any) =>
										setFormData((prev) => ({ ...prev, farming_method: value }))
									}>
									<Picker.Item label="Conventional" value="conventional" />
									<Picker.Item label="Organic" value="organic" />
									<Picker.Item label="Hydroponic" value="hydroponic" />
									<Picker.Item label="Mixed" value="mixed" />
								</Picker>
							</View>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Crop Types</ThemedText>
							<View className="flex-row mb-2 gap-2">
								<TextInput
									className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									placeholderTextColor="#6B7280"
									value={cropTypeInput}
									onChangeText={setCropTypeInput}
									placeholder="Add crop type (e.g., Rice, Corn)"
								/>
								<Pressable className="bg-green-600 px-4 py-3 rounded-xl" onPress={addCropType}>
									<ThemedText className="text-white font-medium">Add</ThemedText>
								</Pressable>
							</View>
							{formData.crop_types.map((crop, index) => (
								<View
									key={index}
									className="flex-row justify-between items-center bg-gray-700 p-3 rounded-lg mb-2">
									<ThemedText className="text-white">{crop}</ThemedText>
									<Pressable onPress={() => removeCropType(index)}>
										<ThemedText className="text-red-400">Remove</ThemedText>
									</Pressable>
								</View>
							))}
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Established Year</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.established_year?.toString()}
								onChangeText={(text) =>
									setFormData((prev) => ({
										...prev,
										established_year: parseInt(text) || undefined,
									}))
								}
								placeholder="2024"
								keyboardType="numeric"
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Current Season</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.current_season}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, current_season: text }))}
								placeholder="e.g., Dry Season 2024"
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Irrigation System</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.irrigation_system}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, irrigation_system: text }))
								}
								placeholder="e.g., Drip irrigation, Sprinkler"
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Soil Type</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.soil_type}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, soil_type: text }))}
								placeholder="e.g., Clay, Sandy, Loamy"
							/>
						</View>
					</View>

					<View className="pb-10">
						<Pressable
							onPress={handleSubmit}
							disabled={isLoading}
							className={`py-4 rounded-xl items-center ${isLoading ? "bg-gray-600" : "bg-green-600"}`}>
							<ThemedText className="text-white text-center font-semibold">
								{isLoading ? "Adding..." : "Add Farm"}
							</ThemedText>
						</Pressable>
					</View>
				</ScrollView>
			</ThemedView>
		</Modal>
	);
}
