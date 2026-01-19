import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { updateVisitOutcome } from "@/services/consultation";
import type { ConsultationVisitWithDetails, UpdateVisitOutcomeForm } from "@/types/consultation";
import React, { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Switch, TextInput, View } from "react-native";

interface VisitOutcomeModalProps {
	visible: boolean;
	onClose: () => void;
	onSuccess: () => void;
	visit: ConsultationVisitWithDetails | null;
}

export default function VisitOutcomeModal({
	visible,
	onClose,
	onSuccess,
	visit,
}: VisitOutcomeModalProps) {
	const [formData, setFormData] = useState<UpdateVisitOutcomeForm>({
		consultation_notes: "",
		problems_identified: [],
		recommendations: [],
		recommended_products: [],
		visit_rating: 5,
		farmer_feedback: "",
		consultant_feedback: "",
		follow_up_required: false,
		follow_up_date: "",
		follow_up_notes: "",
		photos: [],
		documents: [],
	});

	const [problemInput, setProblemInput] = useState("");
	const [recommendationInput, setRecommendationInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (visit) {
			setFormData({
				consultation_notes: visit.consultation_notes || "",
				problems_identified: visit.problems_identified || [],
				recommendations: visit.recommendations || [],
				recommended_products: visit.recommended_products || [],
				visit_rating: visit.visit_rating || 5,
				farmer_feedback: visit.farmer_feedback || "",
				consultant_feedback: visit.consultant_feedback || "",
				follow_up_required: visit.follow_up_required || false,
				follow_up_date: visit.follow_up_date || "",
				follow_up_notes: visit.follow_up_notes || "",
				photos: visit.photos || [],
				documents: visit.documents || [],
			});
		}
	}, [visit]);

	const handleSubmit = async () => {
		if (!formData.consultation_notes.trim()) {
			Alert.alert("Error", "Please provide consultation notes");
			return;
		}

		if (!visit) {
			Alert.alert("Error", "No visit selected");
			return;
		}

		setIsLoading(true);
		try {
			await updateVisitOutcome(visit.id, formData);
			Alert.alert("Success", "Visit outcome updated successfully");
			onSuccess();
			onClose();
		} catch (error) {
			console.error("Error updating visit outcome:", error);
			Alert.alert("Error", "Failed to update visit outcome");
		} finally {
			setIsLoading(false);
		}
	};

	const addProblem = () => {
		if (problemInput.trim()) {
			setFormData((prev) => ({
				...prev,
				problems_identified: [...prev.problems_identified, problemInput.trim()],
			}));
			setProblemInput("");
		}
	};

	const addRecommendation = () => {
		if (recommendationInput.trim()) {
			setFormData((prev) => ({
				...prev,
				recommendations: [...prev.recommendations, recommendationInput.trim()],
			}));
			setRecommendationInput("");
		}
	};

	const removeProblem = (index: number) => {
		setFormData((prev) => ({
			...prev,
			problems_identified: prev.problems_identified.filter((_, i) => i !== index),
		}));
	};

	const removeRecommendation = (index: number) => {
		setFormData((prev) => ({
			...prev,
			recommendations: prev.recommendations.filter((_, i) => i !== index),
		}));
	};

	if (!visit) {
		return null;
	}

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<View className="flex-1">
						<ThemedText type="title" className="text-xl font-bold text-white">
							Visit Outcome
						</ThemedText>
						<ThemedText className="text-gray-400 text-sm mt-1">
							{visit.farm.farm_name} - {visit.consultant.full_name}
						</ThemedText>
					</View>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				<ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
					<View className="mb-6">
						<ThemedText className="text-lg font-semibold text-white mb-4">
							Consultation Summary
						</ThemedText>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Consultation Notes *</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.consultation_notes}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, consultation_notes: text }))
								}
								placeholder="Detailed notes about the consultation..."
								multiline
								numberOfLines={4}
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Problems Identified</ThemedText>
							<View className="flex-row mb-2 gap-2">
								<TextInput
									className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									placeholderTextColor="#6B7280"
									value={problemInput}
									onChangeText={setProblemInput}
									placeholder="Add identified problem"
								/>
								<Pressable className="bg-red-600 px-4 py-3 rounded-xl" onPress={addProblem}>
									<ThemedText className="text-white font-medium">Add</ThemedText>
								</Pressable>
							</View>
							{formData.problems_identified.map((problem, index) => (
								<View
									key={index}
									className="flex-row justify-between items-center bg-red-900/30 border border-red-700 p-3 rounded-xl mb-2">
									<ThemedText className="flex-1 text-red-200">{problem}</ThemedText>
									<Pressable onPress={() => removeProblem(index)}>
										<ThemedText className="text-red-400 ml-2">Remove</ThemedText>
									</Pressable>
								</View>
							))}
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Recommendations</ThemedText>
							<View className="flex-row mb-2 gap-2">
								<TextInput
									className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									placeholderTextColor="#6B7280"
									value={recommendationInput}
									onChangeText={setRecommendationInput}
									placeholder="Add recommendation"
								/>
								<Pressable
									className="bg-green-600 px-4 py-3 rounded-xl"
									onPress={addRecommendation}>
									<ThemedText className="text-white font-medium">Add</ThemedText>
								</Pressable>
							</View>
							{formData.recommendations.map((recommendation, index) => (
								<View
									key={index}
									className="flex-row justify-between items-center bg-green-900/30 border border-green-700 p-3 rounded-xl mb-2">
									<ThemedText className="flex-1 text-green-200">{recommendation}</ThemedText>
									<Pressable onPress={() => removeRecommendation(index)}>
										<ThemedText className="text-green-400 ml-2">Remove</ThemedText>
									</Pressable>
								</View>
							))}
						</View>
					</View>

					<View className="mb-6">
						<ThemedText className="text-lg font-semibold text-white mb-4">
							Feedback & Rating
						</ThemedText>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Visit Rating</ThemedText>
							<View className="flex-row justify-between items-center bg-gray-800 border border-gray-700 rounded-xl p-4">
								<ThemedText className="text-gray-300">Rate this visit (1-5 stars)</ThemedText>
								<View className="flex-row">
									{[1, 2, 3, 4, 5].map((rating) => (
										<Pressable
											key={rating}
											onPress={() => setFormData((prev) => ({ ...prev, visit_rating: rating }))}
											className={`w-10 h-10 rounded-full mx-1 items-center justify-center ${
												rating <= (formData.visit_rating || 0) ? "bg-yellow-500" : "bg-gray-700"
											}`}>
											<ThemedText className="text-white font-bold">{rating}</ThemedText>
										</Pressable>
									))}
								</View>
							</View>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Farmer Feedback</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.farmer_feedback}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, farmer_feedback: text }))}
								placeholder="Feedback from the farmer..."
								multiline
								numberOfLines={3}
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Consultant Feedback</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.consultant_feedback}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, consultant_feedback: text }))
								}
								placeholder="Internal notes from consultant..."
								multiline
								numberOfLines={3}
							/>
						</View>
					</View>

					<View className="mb-6">
						<ThemedText className="text-lg font-semibold text-white mb-4">Follow-up</ThemedText>

						<View className="mb-4">
							<View className="flex-row justify-between items-center bg-gray-800 border border-gray-700 rounded-xl p-4">
								<ThemedText className="text-gray-300 font-medium">Follow-up Required</ThemedText>
								<Switch
									value={formData.follow_up_required}
									onValueChange={(value) =>
										setFormData((prev) => ({ ...prev, follow_up_required: value }))
									}
								/>
							</View>

							{formData.follow_up_required && (
								<View className="mt-4 space-y-3">
									<View className="mb-3">
										<ThemedText className="text-sm text-gray-300 mb-2">Follow-up Date</ThemedText>
										<TextInput
											className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
											placeholderTextColor="#6B7280"
											value={formData.follow_up_date}
											onChangeText={(text) =>
												setFormData((prev) => ({ ...prev, follow_up_date: text }))
											}
											placeholder="YYYY-MM-DD HH:MM"
										/>
									</View>

									<View>
										<ThemedText className="text-sm text-gray-300 mb-2">Follow-up Notes</ThemedText>
										<TextInput
											className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
											placeholderTextColor="#6B7280"
											value={formData.follow_up_notes}
											onChangeText={(text) =>
												setFormData((prev) => ({ ...prev, follow_up_notes: text }))
											}
											placeholder="What needs to be followed up..."
											multiline
											numberOfLines={2}
										/>
									</View>
								</View>
							)}
						</View>
					</View>
				</ScrollView>

				<View className="pb-10">
					<Pressable
						onPress={handleSubmit}
						disabled={isLoading}
						className={`py-4 rounded-xl items-center mx-6 ${isLoading ? "bg-gray-600" : "bg-blue-600"}`}>
						<ThemedText className="text-white text-center font-semibold">
							{isLoading ? "Saving..." : "Complete Visit"}
						</ThemedText>
					</Pressable>
				</View>
			</ThemedView>
		</Modal>
	);
}
