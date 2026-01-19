import AcceptBidModal from "@/components/modals/accept-bid-modal";
import CreateBidModal from "@/components/modals/create-bid-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { acceptBid, getBids, getTenders, rejectBid, withdrawBid } from "@/services/tender";
import type { TenderBidWithDetails, TenderWithDetails } from "@/types/tender";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";

export default function TenderMenu() {
	const [tenders, setTenders] = useState<TenderWithDetails[]>([]);
	const [selectedTender, setSelectedTender] = useState<TenderWithDetails | null>(null);
	const [bids, setBids] = useState<TenderBidWithDetails[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [showBidsModal, setShowBidsModal] = useState(false);
	const [showBidModal, setShowBidModal] = useState(false);
	const [showAcceptBidModal, setShowAcceptBidModal] = useState(false);
	const [selectedBid, setSelectedBid] = useState<TenderBidWithDetails | null>(null);
	const [activeTab, setActiveTab] = useState<"all" | "open" | "closed" | "locked">("all");

	// Get authenticated user ID from auth context
	const { user } = useAuth();
	const currentUserId = user?.id || "00000000-0000-0000-0000-000000000001"; // Fallback to placeholder

	const fetchTenders = useCallback(async () => {
		try {
			setLoading(true);
			const filters = activeTab === "all" ? {} : { status: [activeTab] };
			const data = await getTenders(filters);
			setTenders(data);
		} catch (error) {
			console.error("Error fetching tenders:", error);
		} finally {
			setLoading(false);
		}
	}, [activeTab]);

	useEffect(() => {
		fetchTenders();
	}, [fetchTenders]);

	const fetchBidsForTender = async (tenderId: string) => {
		try {
			const data = await getBids({ tender_id: tenderId });
			setBids(data);
		} catch (error) {
			console.error("Error fetching bids:", error);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await fetchTenders();
		setRefreshing(false);
	};

	const openTenderDetails = async (tender: TenderWithDetails) => {
		setSelectedTender(tender);
		setShowDetailModal(true);
		await fetchBidsForTender(tender.id);
	};

	const openBidsList = async (tender: TenderWithDetails) => {
		setSelectedTender(tender);
		await fetchBidsForTender(tender.id);
		setShowBidsModal(true);
	};

	const openBidModal = (tender: TenderWithDetails, existingBid?: TenderBidWithDetails) => {
		setSelectedTender(tender);
		setSelectedBid(existingBid || null);
		setShowBidModal(true);
	};

	const handleWithdrawBid = async (bidId: string) => {
		if (!confirm("Are you sure you want to withdraw this bid?")) return;
		try {
			await withdrawBid(bidId);
			console.log("Bid withdrawn successfully");
			await fetchTenders();
			if (selectedTender) {
				await fetchBidsForTender(selectedTender.id);
			}
		} catch (error) {
			console.error("Error withdrawing bid:", error);
		}
	};

	const getUserBidForTender = (tenderId: string): TenderBidWithDetails | undefined => {
		return bids.find((bid) => bid.tender_id === tenderId && bid.mitra_id === currentUserId);
	};
	const handleAcceptBid = async (bidId: string) => {
		try {
			await acceptBid(bidId);
			await fetchTenders();
			if (selectedTender) {
				await fetchBidsForTender(selectedTender.id);
			}
		} catch (error) {
			console.error("Error accepting bid:", error);
			throw error;
		}
	};

	const handleRejectBid = async (bidId: string) => {
		try {
			await rejectBid(bidId);
			await fetchTenders();
			if (selectedTender) {
				await fetchBidsForTender(selectedTender.id);
			}
		} catch (error) {
			console.error("Error rejecting bid:", error);
			throw error;
		}
	};

	const openAcceptBidModal = (bid: TenderBidWithDetails) => {
		setSelectedBid(bid);
		setShowAcceptBidModal(true);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "open":
				return "text-green-500";
			case "closed":
				return "text-red-500";
			case "locked":
				return "text-yellow-500";
			case "completed":
				return "text-blue-500";
			default:
				return "text-gray-500";
		}
	};

	const getStatusBgColor = (status: string) => {
		switch (status) {
			case "open":
				return "bg-green-500/20";
			case "closed":
				return "bg-red-500/20";
			case "locked":
				return "bg-yellow-500/20";
			case "completed":
				return "bg-blue-500/20";
			default:
				return "bg-gray-500/20";
		}
	};

	const getStatusLabel = (status: string) => {
		const labels: Record<string, string> = {
			draft: "DRAFT",
			open: "OPEN",
			closed: "CLOSED",
			locked: "LOCKED",
			completed: "COMPLETED",
			cancelled: "CANCELLED",
		};
		return labels[status] || status.toUpperCase();
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "-";
		return new Date(dateString).toLocaleDateString("id-ID", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	if (loading) {
		return (
			<ThemedView className="flex-1 items-center justify-center bg-black">
				<ActivityIndicator size="large" color="#3B82F6" />
			</ThemedView>
		);
	}

	return (
		<ThemedView className="flex-1 bg-black" style={styles.container}>
			{/* Tabs */}
			<View className="flex-row bg-gray-800 mt-4 rounded-xl p-1 shadow-sm">
				{[
					{ key: "all", label: "Semua", icon: "archivebox.fill" },
					{ key: "open", label: "Buka", icon: "cart.fill" },
					{ key: "closed", label: "Tutup", icon: "archivebox.fill" },
					{ key: "locked", label: "Terkunci", icon: "lock.fill" },
				].map((tab) => (
					<Pressable
						key={tab.key}
						onPress={() => setActiveTab(tab.key as any)}
						className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-lg gap-1.5 ${
							activeTab === tab.key ? "bg-blue-900/50 shadow-sm" : ""
						}`}>
						<IconSymbol
							name={tab.icon as any}
							size={18}
							color={activeTab === tab.key ? "#3B82F6" : "#9CA3AF"}
						/>
						<ThemedText
							className={`text-xs font-semibold ${
								activeTab === tab.key ? "text-blue-400" : "text-gray-400"
							}`}>
							{tab.label}
						</ThemedText>
					</Pressable>
				))}
			</View>

			{/* Tenders List */}
			<ScrollView
				className="flex-1"
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
				{tenders.length === 0 ? (
					<View className="items-center justify-center py-12">
						<IconSymbol name="archivebox.fill" size={48} color="#9CA3AF" />
						<ThemedText className="text-base text-gray-400 mt-3">Tidak ada tender</ThemedText>
					</View>
				) : (
					tenders.map((tender) => (
						<View
							key={tender.id}
							className="bg-gray-800 rounded-xl p-4 mb-3 border border-gray-700">
							<Pressable onPress={() => openTenderDetails(tender)}>
								<View className="flex-row justify-between items-start mb-3">
									<View className="flex-1">
										<ThemedText className="text-base font-semibold text-white mb-1">
											{tender.title}
										</ThemedText>
										<ThemedText className="text-sm text-gray-400">
											{tender.product?.name || "Unknown Product"}
										</ThemedText>
									</View>
									<View className={`px-3 py-1 rounded-full ${getStatusBgColor(tender.status)}`}>
										<ThemedText
											className={`text-xs font-semibold ${getStatusColor(tender.status)}`}>
											{getStatusLabel(tender.status)}
										</ThemedText>
									</View>
								</View>

								<View className="gap-2 mb-3">
									<View className="flex-row justify-between">
										<ThemedText className="text-sm text-gray-400">Quantity:</ThemedText>
										<ThemedText className="text-sm text-white font-medium">
											{tender.quantity} {tender.unit}
										</ThemedText>
									</View>
									{tender.estimated_price && (
										<View className="flex-row justify-between">
											<ThemedText className="text-sm text-gray-400">Est. Price:</ThemedText>
											<ThemedText className="text-sm text-white font-medium">
												{formatCurrency(tender.estimated_price)}
											</ThemedText>
										</View>
									)}
									<View className="flex-row justify-between">
										<ThemedText className="text-sm text-gray-400">Close Date:</ThemedText>
										<ThemedText className="text-sm text-white font-medium">
											{formatDate(tender.close_date)}
										</ThemedText>
									</View>
								</View>
							</Pressable>

							{/* Bid Actions for Open Tenders */}
							{tender.status === "open" && (
								<View className="pt-3 border-t border-gray-700 mb-3">
									{(() => {
										// Hide Place Bid button if current user is the creator of the tender
										if (tender.created_by === currentUserId) return null;
										const userBid = getUserBidForTender(tender.id);
										if (userBid) {
											return (
												<View className="flex-row gap-2">
													<Pressable
														className="flex-1 bg-blue-900/50 py-2 rounded-lg border border-blue-800/50"
														onPress={() => openBidModal(tender, userBid)}>
														<ThemedText className="text-blue-400 text-center text-sm font-medium">
															Edit Your Bid
														</ThemedText>
													</Pressable>
													<Pressable
														className="flex-1 bg-red-900/50 py-2 rounded-lg border border-red-800/50"
														onPress={() => handleWithdrawBid(userBid.id)}>
														<ThemedText className="text-red-400 text-center text-sm font-medium">
															Withdraw
														</ThemedText>
													</Pressable>
												</View>
											);
										}
										return (
											<Pressable
												className="bg-green-900/50 py-2 rounded-lg border border-green-800/50"
												onPress={() => openBidModal(tender)}>
												<ThemedText className="text-green-400 text-center text-sm font-medium">
													Place Bid
												</ThemedText>
											</Pressable>
										);
									})()}
								</View>
							)}

							{/* Bid Count Info */}
							{tender.bid_count !== undefined && tender.bid_count > 0 && (
								<Pressable
									className="flex-row items-center pt-3 border-t border-gray-700 gap-2"
									onPress={() => openBidsList(tender)}>
									<IconSymbol name="dollarsign.circle.fill" size={16} color="#3B82F6" />
									<ThemedText className="flex-1 text-sm text-blue-500 font-medium">
										{tender.bid_count} Bids
										{tender.lowest_bid && ` • Lowest: ${formatCurrency(tender.lowest_bid)}`}
									</ThemedText>
									<IconSymbol name="chevron.right" size={16} color="#3B82F6" />
								</Pressable>
							)}
						</View>
					))
				)}
			</ScrollView>

			{/* Tender Detail Modal */}

			<Modal visible={showDetailModal} animationType="slide" presentationStyle="pageSheet">
				<ThemedView className="flex-1 bg-black">
					<View className="flex-row items-center p-4 border-b border-gray-800">
						<View className="flex-1">
							<ThemedText type="title" className="text-xl font-bold text-white">
								Tender Details
							</ThemedText>
						</View>
						<Pressable
							onPress={() => setShowDetailModal(false)}
							className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
							<IconSymbol name="chevron.left" size={20} color="#9CA3AF" />
						</Pressable>
					</View>

					<ScrollView className="flex-1 px-0 py-4">
						{selectedTender && (
							<View className="bg-gray-900 rounded-2xl mx-4 mb-6 shadow-lg border border-gray-800">
								{/* Header Section */}
								<View className="flex-row items-center gap-3 px-5 pt-6 pb-2">
									<View className="bg-blue-950 rounded-xl p-3">
										<IconSymbol name={"archivebox.fill"} size={32} color="#60A5FA" />
									</View>
									<View className="flex-1">
										<ThemedText className="text-lg font-bold text-white mb-1">
											{selectedTender.title}
										</ThemedText>
										<ThemedText className="text-xs text-gray-400">
											{selectedTender.product?.name || "Unknown Product"}
										</ThemedText>
									</View>
									<View
										className={`px-3 py-1 rounded-full ${getStatusBgColor(selectedTender.status)}`}>
										<ThemedText
											className={`text-xs font-semibold ${getStatusColor(selectedTender.status)}`}>
											{getStatusLabel(selectedTender.status)}
										</ThemedText>
									</View>
								</View>

								{/* Meta Info Bar */}
								<View className="flex-row justify-between items-center px-5 py-2 border-b border-gray-800">
									<View className="items-center">
										<ThemedText className="text-xs text-gray-400">Quantity</ThemedText>
										<ThemedText className="text-base text-white font-semibold">
											{selectedTender.quantity} {selectedTender.unit}
										</ThemedText>
									</View>
									<View className="items-center">
										<ThemedText className="text-xs text-gray-400">Est. Price</ThemedText>
										<ThemedText className="text-base text-green-400 font-semibold">
											{selectedTender.estimated_price
												? formatCurrency(selectedTender.estimated_price)
												: "-"}
										</ThemedText>
									</View>
									<View className="items-center">
										<ThemedText className="text-xs text-gray-400">Close Date</ThemedText>
										<ThemedText className="text-base text-white font-semibold">
											{formatDate(selectedTender.close_date)}
										</ThemedText>
									</View>
								</View>

								{/* Description */}
								<View className="px-5 py-4 border-b border-gray-800">
									<ThemedText className="text-sm text-gray-300 leading-6">
										{selectedTender.description}
									</ThemedText>
								</View>

								{/* Requirements */}
								{selectedTender.requirements && selectedTender.requirements.length > 0 && (
									<View className="px-5 py-4 border-b border-gray-800">
										<ThemedText className="text-xs text-gray-400 mb-2 uppercase font-semibold tracking-wider">
											Requirements
										</ThemedText>
										{selectedTender.requirements.map((req, idx) => (
											<View key={idx} className="flex-row items-start gap-2 mb-1">
												<IconSymbol name="chevron.right" size={14} color="#60A5FA" />
												<ThemedText className="text-sm text-gray-200">{req}</ThemedText>
											</View>
										))}
									</View>
								)}

								{/* Bids Info */}
								<View className="px-5 py-4">
									<View className="flex-row items-center gap-2 mb-2">
										<IconSymbol name="dollarsign.circle.fill" size={18} color="#3B82F6" />
										<ThemedText className="text-sm text-blue-400 font-semibold">
											{bids.length} Bids
											{selectedTender.lowest_bid &&
												` • Lowest: ${formatCurrency(selectedTender.lowest_bid)}`}
										</ThemedText>
										<Pressable onPress={() => setShowBidsModal(true)} className="ml-auto">
											<IconSymbol name="chevron.right" size={18} color="#3B82F6" />
										</Pressable>
									</View>
									{bids.length > 0 && (
										<View className="flex-row flex-wrap gap-2 mt-1">
											{bids.slice(0, 3).map((bid) => (
												<View key={bid.id} className="bg-gray-800 rounded-lg px-3 py-1">
													<ThemedText className="text-xs text-white font-medium">
														{bid.mitra?.company_name || "Individual"}:{" "}
														{formatCurrency(bid.bid_price)}
													</ThemedText>
												</View>
											))}
											{bids.length > 3 && (
												<ThemedText className="text-xs text-gray-400 ml-2">
													+{bids.length - 3} more
												</ThemedText>
											)}
										</View>
									)}
								</View>
							</View>
						)}
					</ScrollView>

					{/* Bid Action Button - fixed bottom bar */}
					{selectedTender && selectedTender.status === "open" && (
						<View className="px-5 py-4 bg-black border-t border-gray-800">
							{(() => {
								const userBid = bids.find((bid) => bid.mitra_id === currentUserId);
								if (userBid) {
									return (
										<View className="gap-2">
											<Pressable
												className="bg-blue-900/80 py-3 rounded-lg border border-blue-800/70"
												onPress={() => openBidModal(selectedTender, userBid)}>
												<ThemedText className="text-blue-400 text-center font-medium">
													Edit Your Bid
												</ThemedText>
											</Pressable>
											<Pressable
												className="bg-red-900/80 py-3 rounded-lg border border-red-800/70"
												onPress={() => handleWithdrawBid(userBid.id)}>
												<ThemedText className="text-red-400 text-center font-medium">
													Withdraw Bid
												</ThemedText>
											</Pressable>
										</View>
									);
								}
								if (selectedTender.created_by !== currentUserId) {
									return (
										<Pressable
											className="bg-green-900/80 py-3 rounded-lg border border-green-800/70"
											onPress={() => openBidModal(selectedTender)}>
											<ThemedText className="text-green-400 text-center font-medium">
												Place Bid on This Tender
											</ThemedText>
										</Pressable>
									);
								}
								return null;
							})()}
						</View>
					)}
				</ThemedView>
			</Modal>

			{/* Bids Modal */}
			<Modal visible={showBidsModal} animationType="slide" presentationStyle="pageSheet">
				<ThemedView className="flex-1 bg-black">
					<View className="flex-row items-center p-4 border-b border-gray-800">
						<View className="flex-1">
							<ThemedText type="title" className="text-xl font-bold text-white">
								Bids
							</ThemedText>
							{selectedTender && (
								<ThemedText className="text-sm text-gray-400 mt-1">
									{selectedTender.title}
								</ThemedText>
							)}
						</View>
						<Pressable
							onPress={() => setShowBidsModal(false)}
							className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
							<IconSymbol name="chevron.left" size={20} color="#9CA3AF" />
						</Pressable>
					</View>

					<ScrollView className="flex-1 p-4">
						{bids.length === 0 ? (
							<View className="items-center py-12">
								<ThemedText className="text-base text-gray-400">No bids yet</ThemedText>
							</View>
						) : (
							bids.map((bid) => (
								<View
									key={bid.id}
									className="bg-gray-800 rounded-lg p-3 mb-3 border border-gray-700">
									<View className="flex-row justify-between items-center mb-2">
										<ThemedText className="text-base font-semibold text-white flex-1">
											{bid.mitra?.company_name || "Individual Bidder"}
										</ThemedText>
										<ThemedText className="text-base font-bold text-green-500">
											{formatCurrency(bid.bid_price)}
										</ThemedText>
									</View>
									<View className="gap-1 mb-2">
										<ThemedText className="text-sm text-gray-400">
											Quantity: {bid.quantity} {bid.unit}
										</ThemedText>
										<ThemedText className="text-sm text-gray-400">
											Submitted: {formatDate(bid.submitted_at)}
										</ThemedText>
										<View
											className={`mt-1 px-2 py-1 rounded self-start ${
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
									{bid.notes && (
										<ThemedText className="text-sm text-gray-300 italic pt-2 border-t border-gray-700 mb-2">
											{bid.notes}
										</ThemedText>
									)}
									{/* Action Buttons */}
									{bid.status === "submitted" && selectedTender?.created_by === currentUserId && (
										<View className="flex-row gap-2 mt-2 pt-2 border-t border-gray-700">
											<Pressable
												onPress={() => openAcceptBidModal(bid)}
												className="flex-1 bg-green-600 py-2 rounded-lg items-center">
												<ThemedText className="text-white font-semibold text-sm">Accept</ThemedText>
											</Pressable>
											<Pressable
												onPress={() => handleWithdrawBid(bid.id)}
												className="flex-1 bg-red-600 py-2 rounded-lg items-center">
												<ThemedText className="text-white font-semibold text-sm">Reject</ThemedText>
											</Pressable>
										</View>
									)}
								</View>
							))
						)}
					</ScrollView>
				</ThemedView>
			</Modal>

			{/* Create/Edit Bid Modal */}
			<CreateBidModal
				visible={showBidModal}
				onClose={() => {
					setShowBidModal(false);
					setSelectedBid(null);
				}}
				onSuccess={async () => {
					await fetchTenders();
					if (selectedTender) {
						await fetchBidsForTender(selectedTender.id);
					}
				}}
				tender={selectedTender}
				existingBid={selectedBid}
				userId={currentUserId}
			/>

			{/* Accept Bid Modal */}
			<AcceptBidModal
				visible={showAcceptBidModal}
				onClose={() => {
					setShowAcceptBidModal(false);
					setSelectedBid(null);
				}}
				onAccept={handleAcceptBid}
				onReject={handleRejectBid}
				bid={selectedBid}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, gap: 8 },
});
