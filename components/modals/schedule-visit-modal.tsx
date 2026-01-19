import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { createConsultationVisit, getConsultants, getFarms } from "@/services/consultation";
import type { Consultant, CreateVisitForm, Farm } from "@/types/consultation";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";

interface ScheduleVisitModalProps {
	visible: boolean;
	onClose: () => void;
	onSuccess: () => void;
	preselectedFarmId?: string;
	preselectedConsultantId?: string;
}

export default function ScheduleVisitModal({
	visible,
	onClose,
	onSuccess,
	preselectedFarmId,
	preselectedConsultantId,
}: ScheduleVisitModalProps) {
	const [formData, setFormData] = useState<CreateVisitForm>({
		farm_id: "",
		consultant_id: "",
		scheduled_date: "",
		estimated_duration: 120,
		visit_type: "regular",
	});

	const [consultants, setConsultants] = useState<Consultant[]>([]);
	const [farms, setFarms] = useState<Farm[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [loadingData, setLoadingData] = useState(true);

	useEffect(() => {
		if (visible) {
			loadData();
		}
	}, [visible]);

	useEffect(() => {
		if (preselectedFarmId) {
			setFormData((prev) => ({ ...prev, farm_id: preselectedFarmId }));
		}
		if (preselectedConsultantId) {
			setFormData((prev) => ({ ...prev, consultant_id: preselectedConsultantId }));
		}
	}, [preselectedFarmId, preselectedConsultantId]);

	const loadData = async () => {
		try {
			setLoadingData(true);
			const [consultantData, farmData] = await Promise.all([getConsultants(), getFarms()]);
			setConsultants(consultantData as Consultant[]);
			setFarms(farmData as Farm[]);
		} catch (error) {
			console.error("Error loading data:", error);
		} finally {
			setLoadingData(false);
		}
	};

	const handleSubmit = async () => {
		if (!formData.farm_id || !formData.consultant_id || !formData.scheduled_date) {
			console.error("Please fill in all required fields");
			return;
		}

		const visitDate = new Date(formData.scheduled_date);
		if (visitDate < new Date()) {
			console.error("Visit date cannot be in the past");
			return;
		}

		setIsLoading(true);
		try {
			await createConsultationVisit(formData);
			console.log("Visit scheduled successfully");
			onSuccess();
			onClose();
			resetForm();
		} catch (error) {
			console.error("Error scheduling visit:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			farm_id: "",
			consultant_id: "",
			scheduled_date: "",
			estimated_duration: 120,
			visit_type: "regular",
		});
	};

	// Minimum date validation is handled in form submission

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<ThemedText type="title" className="text-xl font-bold text-white">
						Schedule Visit
					</ThemedText>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				{loadingData ? (
					<View className="flex-1 justify-center items-center">
						<ThemedText className="text-gray-400">Loading...</ThemedText>
					</View>
				) : (
					<>
						<ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
							<View className="mb-6">
								<ThemedText className="text-lg font-semibold text-white mb-4">
									Visit Details
								</ThemedText>

								<View className="mb-4">
									<ThemedText className="text-sm text-gray-300 mb-2">Farm *</ThemedText>
									<View className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
										<Picker
											selectedValue={formData.farm_id}
											style={{ color: "#FFFFFF" }}
											onValueChange={(value: string) =>
												setFormData((prev) => ({ ...prev, farm_id: value }))
											}
											enabled={!preselectedFarmId}>
											<Picker.Item label="Select a farm" value="" />
											{farms.map((farm) => (
												<Picker.Item
													key={farm.id}
													label={`${farm.farm_name} (${farm.owner_name})`}
													value={farm.id}
												/>
											))}
										</Picker>
									</View>
								</View>

								<View className="mb-4">
									<ThemedText className="text-sm text-gray-300 mb-2">Consultant *</ThemedText>
									<View className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
										<Picker
											selectedValue={formData.consultant_id}
											style={{ color: "#FFFFFF" }}
											onValueChange={(value: string) =>
												setFormData((prev) => ({ ...prev, consultant_id: value }))
											}
											enabled={!preselectedConsultantId}>
											<Picker.Item label="Select a consultant" value="" />
											{consultants
												.filter((c) => c.availability_status === "available")
												.map((consultant) => (
													<Picker.Item
														key={consultant.id}
														label={`${consultant.full_name} (${consultant.specialization})`}
														value={consultant.id}
													/>
												))}
										</Picker>
									</View>
								</View>

								<View className="mb-4">
									<ThemedText className="text-sm text-gray-300 mb-2">Visit Type</ThemedText>
									<View className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
										<Picker
											selectedValue={formData.visit_type}
											style={{ color: "#FFFFFF" }}
											onValueChange={(value: any) =>
												setFormData((prev) => ({ ...prev, visit_type: value }))
											}>
											<Picker.Item label="Regular Visit" value="regular" />
											<Picker.Item label="Initial Assessment" value="initial" />
											<Picker.Item label="Emergency Visit" value="emergency" />
											<Picker.Item label="Follow-up Visit" value="follow_up" />
										</Picker>
									</View>
								</View>

								<View className="mb-4">
									<ThemedText className="text-sm text-gray-300 mb-2">
										Scheduled Date & Time *
									</ThemedText>
									<TextInput
										className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
										placeholderTextColor="#6B7280"
										value={formData.scheduled_date}
										onChangeText={(text) =>
											setFormData((prev) => ({ ...prev, scheduled_date: text }))
										}
										placeholder="YYYY-MM-DD HH:MM"
										keyboardType="default"
									/>
									<ThemedText className="text-gray-400 text-sm mt-1">
										Format: 2024-12-25 14:30 (minimum 1 hour from now)
									</ThemedText>
								</View>

								<View className="mb-4">
									<ThemedText className="text-sm text-gray-300 mb-2">
										Estimated Duration (minutes)
									</ThemedText>
									<TextInput
										className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
										placeholderTextColor="#6B7280"
										value={formData.estimated_duration.toString()}
										onChangeText={(text) =>
											setFormData((prev) => ({
												...prev,
												estimated_duration: parseInt(text) || 120,
											}))
										}
										placeholder="120"
										keyboardType="numeric"
									/>
								</View>
							</View>

							{/* Show selected farm and consultant details */}
							{formData.farm_id && (
								<View className="mb-6 bg-blue-900/30 border border-blue-700 p-4 rounded-xl">
									<ThemedText className="font-semibold text-blue-300 mb-2">
										Selected Farm:
									</ThemedText>
									{(() => {
										const farm = farms.find((f) => f.id === formData.farm_id);
										return farm ? (
											<View>
												<ThemedText className="text-blue-200 font-medium">
													{farm.farm_name}
												</ThemedText>
												<ThemedText className="text-blue-300 text-sm">
													Owner: {farm.owner_name} | Area: {farm.total_area} ha
												</ThemedText>
												<ThemedText className="text-blue-300 text-sm">
													Crops: {farm.crop_types.join(", ")}
												</ThemedText>
											</View>
										) : null;
									})()}
								</View>
							)}

							{formData.consultant_id && (
								<View className="mb-6 bg-green-900/30 border border-green-700 p-4 rounded-xl">
									<ThemedText className="font-semibold text-green-300 mb-2">
										Selected Consultant:
									</ThemedText>
									{(() => {
										const consultant = consultants.find((c) => c.id === formData.consultant_id);
										return consultant ? (
											<View>
												<ThemedText className="text-green-200 font-medium">
													{consultant.full_name}
												</ThemedText>
												<ThemedText className="text-green-300 text-sm">
													Specialization: {consultant.specialization}
												</ThemedText>
												<ThemedText className="text-green-300 text-sm">
													Experience: {consultant.experience_years} years | Rating:{" "}
													{consultant.rating}/5
												</ThemedText>
											</View>
										) : null;
									})()}
								</View>
							)}
						</ScrollView>

						<View className="pb-10">
							<Pressable
								onPress={handleSubmit}
								disabled={isLoading}
								className={`py-4 rounded-xl items-center mx-6 ${isLoading ? "bg-gray-600" : "bg-blue-600"}`}>
								<ThemedText className="text-white text-center font-semibold">
									{isLoading ? "Scheduling..." : "Schedule Visit"}
								</ThemedText>
							</Pressable>
						</View>
					</>
				)}
			</ThemedView>
		</Modal>
	);
}
