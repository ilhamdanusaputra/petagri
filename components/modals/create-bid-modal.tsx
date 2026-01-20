import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { createBid, updateBid } from "@/services/tender";
import type { CreateBidForm, TenderBidWithDetails, TenderWithDetails } from "@/types/tender";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, TextInput, View } from "react-native";

interface CreateBidModalProps {
	visible: boolean;
	onClose: () => void;
	onSuccess: () => void;
	tender: TenderWithDetails | null;
	existingBid?: TenderBidWithDetails | null;
	userId: string; // The ID of the user placing the bid (any authenticated user)
}

export default function CreateBidModal({
	visible,
	onClose,
	onSuccess,
	tender,
	existingBid,
	userId,
}: CreateBidModalProps) {
	const [formData, setFormData] = useState<CreateBidForm>({
		tender_id: "",
		mitra_id: undefined, // Will be set if user has mitra record
		user_id: userId, // Always set for authenticated users
		bid_price: 0,
		quantity: 1,
		unit: "unit",
		delivery_terms: "",
		payment_terms: "",
		notes: "",
	});
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!tender || !userId) return;

		const initializeForm = async () => {
			// Try to fetch mitra record if user is a mitra partner
			const { data: mitra } = await supabase
				.from("mitra")
				.select("id")
				.eq("created_by", userId)
				.single();

			// Use mitra_id if user has a mitra record, otherwise null
			const mitraId = mitra?.id || null;

			// EDIT MODE
			if (existingBid) {
				setFormData({
					tender_id: tender.id,
					mitra_id: existingBid.mitra_id || mitraId || undefined,
					user_id: userId,
					bid_price: existingBid.bid_price,
					quantity: existingBid.quantity,
					unit: existingBid.unit,
					delivery_terms: existingBid.delivery_terms || "",
					payment_terms: existingBid.payment_terms || "",
					notes: existingBid.notes || "",
				});
			}
			// CREATE MODE
			else {
				setFormData({
					tender_id: tender.id,
					mitra_id: mitraId || undefined,
					user_id: userId,
					bid_price: tender.estimated_price || 0,
					quantity: tender.quantity,
					unit: tender.unit,
					delivery_terms: "",
					payment_terms: "",
					notes: "",
				});
			}
		};

		initializeForm();
	}, [tender, userId, existingBid]);

	const handleSubmit = async () => {
		if (!formData.bid_price || formData.bid_price <= 0) {
			Alert.alert("Error", "Please enter a valid bid price");
			console.error("Invalid bid price:", formData.bid_price);
			return;
		}

		if (!formData.quantity || formData.quantity <= 0) {
			Alert.alert("Error", "Please enter a valid quantity");
			console.error("Invalid quantity:", formData.quantity);
			return;
		}

		if (!tender) {
			Alert.alert("Error", "No tender selected");
			console.error("No tender selected");
			return;
		}

		setIsLoading(true);
		try {
			if (existingBid) {
				// Update existing bid
				await updateBid(existingBid.id, {
					bid_price: formData.bid_price,
					quantity: formData.quantity,
					delivery_terms: formData.delivery_terms || undefined,
					payment_terms: formData.payment_terms || undefined,
					notes: formData.notes || undefined,
				});
				Alert.alert("Success", "Bid updated successfully");
			} else {
				// Create new bid
				await createBid(formData);
				console.log("Bid submitted successfully");
			}
			onSuccess();
			onClose();
		} catch (error) {
			console.error("Error submitting bid:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (!tender) {
		return null;
	}

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<View className="flex-1">
						<ThemedText type="title" className="text-xl font-bold text-white">
							{existingBid ? "Edit Bid" : "Place Bid"}
						</ThemedText>
						<ThemedText className="text-gray-400 text-sm mt-1">{tender.title}</ThemedText>
					</View>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				<ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
					{/* Tender Info */}
					<View className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
						<ThemedText className="text-sm text-gray-400 mb-1">Tender Details</ThemedText>
						<ThemedText className="text-base text-white font-semibold mb-2">
							{tender.product?.name}
						</ThemedText>
						<View className="gap-1">
							<ThemedText className="text-sm text-gray-300">
								Requested Qty: {tender.quantity} {tender.unit}
							</ThemedText>
							{tender.estimated_price && (
								<ThemedText className="text-sm text-gray-300">
									Est. Price:{" "}
									{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
										tender.estimated_price,
									)}
								</ThemedText>
							)}
							<ThemedText className="text-sm text-gray-300">
								Close Date:{" "}
								{tender.close_date
									? new Date(tender.close_date).toLocaleDateString()
									: "Not specified"}
							</ThemedText>
						</View>
					</View>

					{/* Bid Form */}
					<View className="mb-6">
						<ThemedText className="text-lg font-semibold text-white mb-4">Your Bid</ThemedText>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Bid Price (IDR) *</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.bid_price.toString()}
								onChangeText={(text) =>
									setFormData((prev) => ({ ...prev, bid_price: parseFloat(text) || 0 }))
								}
								placeholder="Enter your bid price"
								keyboardType="numeric"
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Quantity *</ThemedText>
							<View className="flex-row gap-2">
								<TextInput
									className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									placeholderTextColor="#6B7280"
									value={formData.quantity.toString()}
									onChangeText={(text) =>
										setFormData((prev) => ({ ...prev, quantity: parseInt(text) || 0 }))
									}
									placeholder="Quantity"
									keyboardType="numeric"
								/>
								<TextInput
									className="w-24 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
									placeholderTextColor="#6B7280"
									value={formData.unit}
									onChangeText={(text) => setFormData((prev) => ({ ...prev, unit: text }))}
									placeholder="Unit"
								/>
							</View>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Delivery Terms</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.delivery_terms}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, delivery_terms: text }))}
								placeholder="e.g., FOB, CIF, DDP..."
								multiline
								numberOfLines={2}
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Payment Terms</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.payment_terms}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, payment_terms: text }))}
								placeholder="e.g., Net 30, 50% down payment..."
								multiline
								numberOfLines={2}
							/>
						</View>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-300 mb-2">Additional Notes</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
								placeholderTextColor="#6B7280"
								value={formData.notes}
								onChangeText={(text) => setFormData((prev) => ({ ...prev, notes: text }))}
								placeholder="Any additional information about your bid..."
								multiline
								numberOfLines={4}
							/>
						</View>
					</View>

					{/* Requirements */}
					{tender.requirements && tender.requirements.length > 0 && (
						<View className="mb-6">
							<ThemedText className="text-sm text-gray-400 mb-2 uppercase font-semibold">
								Tender Requirements
							</ThemedText>
							{tender.requirements.map((req, idx) => (
								<View
									key={idx}
									className="bg-yellow-900/20 border border-yellow-700 p-3 rounded-xl mb-2">
									<ThemedText className="text-sm text-yellow-200">• {req}</ThemedText>
								</View>
							))}
						</View>
					)}
				</ScrollView>

				<View className="px-6 pb-10">
					<Pressable
						onPress={handleSubmit}
						disabled={isLoading}
						className={`py-4 rounded-xl items-center ${isLoading ? "bg-gray-600" : "bg-blue-600"}`}>
						<ThemedText className="text-white text-center font-semibold">
							{isLoading ? "Submitting..." : existingBid ? "Update Bid" : "Submit Bid"}
						</ThemedText>
					</Pressable>
				</View>
			</ThemedView>
		</Modal>
	);
}
