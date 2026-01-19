import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { TenderBidWithDetails } from "@/types/tender";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

interface AcceptBidModalProps {
	visible: boolean;
	onClose: () => void;
	onAccept: (bidId: string) => Promise<void>;
	onReject: (bidId: string) => Promise<void>;
	bid: TenderBidWithDetails | null;
}

export default function AcceptBidModal({
	visible,
	onClose,
	onAccept,
	onReject,
	bid,
}: AcceptBidModalProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleAccept = async () => {
		if (!bid) return;
		setIsLoading(true);
		try {
			await onAccept(bid.id);
			console.info("Bid accepted successfully");
			onClose();
		} catch (error) {
			console.error("Error accepting bid:", error);
			// Optionally show a toast or silent fail
		} finally {
			setIsLoading(false);
		}
	};

	const handleReject = async () => {
		if (!bid) return;
		setIsLoading(true);
		try {
			await onReject(bid.id);
			console.info("Bid rejected successfully");
			onClose();
		} catch (error) {
			console.error("Error rejecting bid:", error);
			// Optionally show a toast or silent fail
		} finally {
			setIsLoading(false);
		}
	};

	if (!bid) {
		return null;
	}

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<View className="flex-1">
						<ThemedText type="title" className="text-xl font-bold text-white">
							Review Bid
						</ThemedText>
						<ThemedText className="text-gray-400 text-sm mt-1">
							{bid.tender?.title || "Tender"}
						</ThemedText>
					</View>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				<ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
					{/* Bidder Info */}
					<View className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
						<ThemedText className="text-sm text-gray-400 mb-2 uppercase font-semibold">
							Bidder Information
						</ThemedText>
						{bid.mitra ? (
							<>
								<ThemedText className="text-lg text-white font-bold mb-1">
									{bid.mitra.company_name}
								</ThemedText>
								<ThemedText className="text-sm text-gray-300">
									Contact: {bid.mitra.contact_person}
								</ThemedText>
								<ThemedText className="text-sm text-gray-300">Email: {bid.mitra.email}</ThemedText>
								<ThemedText className="text-sm text-gray-300">Phone: {bid.mitra.phone}</ThemedText>
							</>
						) : (
							<ThemedText className="text-sm text-gray-300">Individual Bidder</ThemedText>
						)}
						<View className="mt-2 pt-2 border-t border-gray-700">
							<ThemedText className="text-xs text-gray-400">
								Submitted: {new Date(bid.submitted_at || bid.created_at).toLocaleString()}
							</ThemedText>
						</View>
					</View>

					{/* Bid Details */}
					<View className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
						<ThemedText className="text-sm text-gray-400 mb-3 uppercase font-semibold">
							Bid Details
						</ThemedText>

						<View className="mb-4">
							<ThemedText className="text-sm text-gray-400">Bid Price</ThemedText>
							<ThemedText className="text-2xl text-white font-bold mt-1">
								{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(
									bid.bid_price,
								)}
							</ThemedText>
						</View>

						<View className="flex-row gap-4 mb-4">
							<View className="flex-1">
								<ThemedText className="text-sm text-gray-400">Quantity</ThemedText>
								<ThemedText className="text-lg text-white font-semibold mt-1">
									{bid.quantity} {bid.unit}
								</ThemedText>
							</View>
							<View className="flex-1">
								<ThemedText className="text-sm text-gray-400">Unit Price</ThemedText>
								<ThemedText className="text-lg text-white font-semibold mt-1">
									{new Intl.NumberFormat("id-ID", {
										style: "currency",
										currency: "IDR",
										maximumFractionDigits: 0,
									}).format(bid.bid_price / bid.quantity)}
								</ThemedText>
							</View>
						</View>

						{bid.delivery_terms && (
							<View className="mb-3">
								<ThemedText className="text-sm text-gray-400">Delivery Terms</ThemedText>
								<ThemedText className="text-sm text-white mt-1">{bid.delivery_terms}</ThemedText>
							</View>
						)}

						{bid.payment_terms && (
							<View className="mb-3">
								<ThemedText className="text-sm text-gray-400">Payment Terms</ThemedText>
								<ThemedText className="text-sm text-white mt-1">{bid.payment_terms}</ThemedText>
							</View>
						)}

						{bid.notes && (
							<View className="mb-3">
								<ThemedText className="text-sm text-gray-400">Notes</ThemedText>
								<ThemedText className="text-sm text-white mt-1">{bid.notes}</ThemedText>
							</View>
						)}

						<View className="mt-2 pt-3 border-t border-gray-700">
							<View
								className={`px-3 py-2 rounded-lg self-start ${
									bid.status === "submitted"
										? "bg-blue-900/30"
										: bid.status === "accepted"
											? "bg-green-900/30"
											: bid.status === "rejected"
												? "bg-red-900/30"
												: "bg-gray-700"
								}`}>
								<ThemedText
									className={`text-xs font-semibold uppercase ${
										bid.status === "submitted"
											? "text-blue-300"
											: bid.status === "accepted"
												? "text-green-300"
												: bid.status === "rejected"
													? "text-red-300"
													: "text-gray-300"
									}`}>
									{bid.status}
								</ThemedText>
							</View>
						</View>
					</View>

					{/* Comparison with Tender Requirements */}
					{bid.tender && (
						<View className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
							<ThemedText className="text-sm text-gray-400 mb-3 uppercase font-semibold">
								Comparison with Requirements
							</ThemedText>

							<View className="flex-row mb-2">
								<View className="flex-1">
									<ThemedText className="text-xs text-gray-400">Required Qty</ThemedText>
									<ThemedText className="text-sm text-white mt-1">
										{bid.tender.quantity} {bid.tender.unit}
									</ThemedText>
								</View>
								<View className="flex-1">
									<ThemedText className="text-xs text-gray-400">Bid Qty</ThemedText>
									<ThemedText className="text-sm text-white mt-1">
										{bid.quantity} {bid.unit}
									</ThemedText>
								</View>
							</View>

							{bid.tender.estimated_price && (
								<View className="flex-row">
									<View className="flex-1">
										<ThemedText className="text-xs text-gray-400">Estimated Price</ThemedText>
										<ThemedText className="text-sm text-white mt-1">
											{new Intl.NumberFormat("id-ID", {
												style: "currency",
												currency: "IDR",
											}).format(bid.tender.estimated_price)}
										</ThemedText>
									</View>
									<View className="flex-1">
										<ThemedText className="text-xs text-gray-400">Price Difference</ThemedText>
										<ThemedText
											className={`text-sm mt-1 font-semibold ${
												bid.bid_price <= bid.tender.estimated_price
													? "text-green-400"
													: "text-red-400"
											}`}>
											{bid.bid_price <= bid.tender.estimated_price ? "↓" : "↑"}{" "}
											{new Intl.NumberFormat("id-ID", {
												style: "currency",
												currency: "IDR",
											}).format(Math.abs(bid.bid_price - bid.tender.estimated_price))}
										</ThemedText>
									</View>
								</View>
							)}
						</View>
					)}
				</ScrollView>

				{/* Action Buttons */}
				{bid.status === "submitted" && (
					<View className="px-6 pb-10 gap-3">
						<Pressable
							onPress={handleAccept}
							disabled={isLoading}
							className={`py-4 rounded-xl items-center ${isLoading ? "bg-gray-600" : "bg-green-600"}`}>
							<ThemedText className="text-white text-center font-semibold">
								{isLoading ? "Processing..." : "Accept Bid"}
							</ThemedText>
						</Pressable>

						<Pressable
							onPress={handleReject}
							disabled={isLoading}
							className={`py-4 rounded-xl items-center border-2 ${isLoading ? "border-gray-600 bg-gray-800" : "border-red-600 bg-red-900/20"}`}>
							<ThemedText
								className={`text-center font-semibold ${isLoading ? "text-gray-400" : "text-red-400"}`}>
								{isLoading ? "Processing..." : "Reject Bid"}
							</ThemedText>
						</Pressable>
					</View>
				)}

				{bid.status !== "submitted" && (
					<View className="px-6 pb-10">
						<Pressable onPress={onClose} className="py-4 rounded-xl items-center bg-gray-700">
							<ThemedText className="text-white text-center font-semibold">Close</ThemedText>
						</Pressable>
					</View>
				)}
			</ThemedView>
		</Modal>
	);
}
