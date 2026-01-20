import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { supabase } from "@/utils/supabase";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Modal,
	Pressable,
	RefreshControl,
	ScrollView,
	TextInput,
	View,
} from "react-native";

interface Delivery {
	id: string;
	delivery_number: string;
	order_id: string;
	tender_id: string | null;
	mitra_id: string;
	consultation_visit_id: string | null;
	farm_id: string | null;
	quantity: number;
	unit: string;
	driver_name: string | null;
	driver_phone: string | null;
	vehicle_number: string | null;
	delivery_address: string;
	status:
		| "pending"
		| "picked_up"
		| "in_transit"
		| "arrived"
		| "delivered"
		| "approved"
		| "rejected"
		| "cancelled";
	scheduled_delivery_date: string | null;
	actual_delivery_date: string | null;
	approved_by_farm_owner: boolean;
	farm_owner_email: string | null;
	farm_owner_name: string | null;
	approved_at: string | null;
	rejection_reason: string | null;
	delivery_notes: string | null;
	product_condition: string | null;
	created_at: string;
	updated_at: string;
	// Relations
	order?: { order_number: string; total_amount: number };
	mitra?: { company_name: string; contact_person: string };
	farm?: { farm_name: string; owner_name: string; contact_email: string };
}

type TabType = "all" | "pending" | "in_transit" | "delivered" | "approved";

export default function DistribusiMenu() {
	const [deliveries, setDeliveries] = useState<Delivery[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState<TabType>("all");
	const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
	const [showDetailModal, setShowDetailModal] = useState(false);
	const [showUpdateModal, setShowUpdateModal] = useState(false);
	const [updateForm, setUpdateForm] = useState({
		status: "",
		driver_name: "",
		driver_phone: "",
		vehicle_number: "",
		delivery_notes: "",
	});

	const loadDeliveries = useCallback(async () => {
		setLoading(true);
		try {
			let query = supabase
				.from("deliveries")
				.select(
					`
          *,
          order:orders(order_number, total_amount),
          mitra:mitra(company_name, contact_person),
          farm:farms(farm_name, owner_name, contact_email)
        `,
				)
				.order("created_at", { ascending: false });

			// Filter by tab
			if (activeTab !== "all") {
				if (activeTab === "in_transit") {
					query = query.in("status", ["picked_up", "in_transit", "arrived"]);
				} else {
					query = query.eq("status", activeTab);
				}
			}

			const { data, error } = await query;

			if (error) throw error;
			setDeliveries(data || []);
		} catch (error) {
			console.error("Error loading deliveries:", error);
		} finally {
			setLoading(false);
		}
	}, [activeTab]);

	useEffect(() => {
		loadDeliveries();
	}, [loadDeliveries]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadDeliveries();
		setRefreshing(false);
	};

	const handleUpdateStatus = async (deliveryId: string, newStatus: string) => {
		try {
			const updateData: any = {
				status: newStatus,
			};

			// Set actual delivery date when delivered
			if (newStatus === "delivered") {
				updateData.actual_delivery_date = new Date().toISOString();
			}

			const { error } = await supabase.from("deliveries").update(updateData).eq("id", deliveryId);

			if (error) throw error;

			console.info("Delivery status updated successfully");
			await loadDeliveries();
			setShowUpdateModal(false);
		} catch (error) {
			console.error("Error updating delivery status:", error);
		}
	};

	const handleUpdateDeliveryInfo = async () => {
		if (!selectedDelivery) return;

		try {
			const { error } = await supabase
				.from("deliveries")
				.update({
					status: updateForm.status || selectedDelivery.status,
					driver_name: updateForm.driver_name || selectedDelivery.driver_name,
					driver_phone: updateForm.driver_phone || selectedDelivery.driver_phone,
					vehicle_number: updateForm.vehicle_number || selectedDelivery.vehicle_number,
					delivery_notes: updateForm.delivery_notes || selectedDelivery.delivery_notes,
				})
				.eq("id", selectedDelivery.id);

			if (error) throw error;

			console.info("Delivery information updated successfully");
			await loadDeliveries();
			setShowUpdateModal(false);
			setSelectedDelivery(null);
		} catch (error) {
			console.error("Error updating delivery:", error);
		}
	};

	const handleApproveDelivery = async (deliveryId: string) => {
		try {
			const { error } = await supabase
				.from("deliveries")
				.update({
					status: "approved",
					approved_by_farm_owner: true,
					approved_at: new Date().toISOString(),
				})
				.eq("id", deliveryId);

			if (error) throw error;

			console.info("Delivery approved successfully");
			await loadDeliveries();
		} catch (error) {
			console.error("Error approving delivery:", error);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "approved":
				return "bg-green-600";
			case "delivered":
				return "bg-blue-600";
			case "in_transit":
			case "picked_up":
			case "arrived":
				return "bg-yellow-600";
			case "rejected":
			case "cancelled":
				return "bg-red-600";
			default:
				return "bg-gray-600";
		}
	};

	const getStatusText = (status: string) => {
		const statusMap: Record<string, string> = {
			pending: "Pending",
			picked_up: "Picked Up",
			in_transit: "In Transit",
			arrived: "Arrived",
			delivered: "Delivered",
			approved: "Approved",
			rejected: "Rejected",
			cancelled: "Cancelled",
		};
		return statusMap[status] || status;
	};

	return (
		<ThemedView className="flex-1 bg-black">
			{/* Tab Navigation */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				// Hapus minWidth agar ScrollView tidak memaksa lebar 100%
				className="bg-gray-800 mx-5 mt-4 rounded-xl p-1 shadow-sm flex-grow-0">
				<View className="flex-row items-center">
					{[
						{ key: "all", label: "All", icon: "archivebox.fill" },
						{ key: "pending", label: "Pending", icon: "bell.fill" },
						{ key: "in_transit", label: "In Transit", icon: "arrow.left.arrow.right" },
						{ key: "delivered", label: "Delivered", icon: "checkmark.circle.fill" },
						{ key: "approved", label: "Approved", icon: "star.fill" },
					].map((tab) => (
						<Pressable
							key={tab.key}
							onPress={() => setActiveTab(tab.key as TabType)}
							// HAPUS flex-1 di sini agar lebar mengikuti isi (wrap content)
							className={`flex-row items-center justify-center py-2 px-4 rounded-lg gap-2 ${
								activeTab === tab.key ? "bg-blue-900/50" : ""
							}`}>
							<IconSymbol
								name={tab.icon as any}
								size={16}
								color={activeTab === tab.key ? "#3B82F6" : "#9CA3AF"}
							/>
							<ThemedText
								className={`text-sm font-medium ${
									activeTab === tab.key ? "text-blue-400" : "text-gray-400"
								}`}>
								{tab.label}
							</ThemedText>
						</Pressable>
					))}
				</View>
			</ScrollView>
			{/* Deliveries List */}
			{loading && deliveries.length === 0 ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#3B82F6" />
					<ThemedText className="text-gray-400 mt-3">Loading deliveries...</ThemedText>
				</View>
			) : (
				<ScrollView
					className="flex-1"
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					showsVerticalScrollIndicator={false}>
					<View className="p-6 gap-4">
						{deliveries.length === 0 ? (
							<View className="items-center justify-center py-20">
								<IconSymbol name="archivebox.fill" size={64} color="#6B7280" />
								<ThemedText className="text-gray-400 text-lg font-medium mt-4">
									No deliveries found
								</ThemedText>
								<ThemedText className="text-gray-500 text-center mt-2">
									{" "}
									Deliveries will appear here when tenders are completed
								</ThemedText>
							</View>
						) : (
							deliveries.map((delivery) => (
								<Pressable
									key={delivery.id}
									onPress={() => {
										setSelectedDelivery(delivery);
										setShowDetailModal(true);
									}}
									className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
									{/* Header */}
									<View className="flex-row items-center justify-between mb-3">
										<View className="flex-1">
											<ThemedText className="text-white font-bold text-lg">
												{delivery.delivery_number}
											</ThemedText>
											<ThemedText className="text-gray-400 text-sm">
												Order: {delivery.order?.order_number || "N/A"}
											</ThemedText>
										</View>
										<View className={`px-3 py-1 rounded-full ${getStatusColor(delivery.status)}`}>
											<ThemedText className="text-white text-xs font-semibold">
												{getStatusText(delivery.status)}
											</ThemedText>
										</View>
									</View>

									{/* Product & Mitra Info */}
									<View className="mb-3 pb-3 border-b border-gray-700">
										<View className="flex-row items-center gap-2 mb-2">
											<IconSymbol name="bag.fill" size={14} color="#9CA3AF" />
											<ThemedText className="text-gray-300 text-sm">
												{delivery.quantity} {delivery.unit}
											</ThemedText>
										</View>
										<View className="flex-row items-center gap-2">
											<IconSymbol name="house.fill" size={14} color="#9CA3AF" />
											<ThemedText className="text-gray-300 text-sm">
												From: {delivery.mitra?.company_name || "Mitra"}
											</ThemedText>
										</View>
									</View>

									{/* Delivery Details */}
									<View className="gap-2">
										{delivery.farm && (
											<View className="flex-row items-center gap-2">
												<IconSymbol name="leaf.fill" size={14} color="#9CA3AF" />
												<ThemedText className="text-gray-300 text-sm flex-1" numberOfLines={1}>
													To: {delivery.farm.farm_name} ({delivery.farm.owner_name})
												</ThemedText>
											</View>
										)}

										{delivery.driver_name && (
											<View className="flex-row items-center gap-2">
												<IconSymbol name="gear" size={14} color="#9CA3AF" />
												<ThemedText className="text-gray-300 text-sm">
													Driver: {delivery.driver_name}
												</ThemedText>
											</View>
										)}

										{delivery.scheduled_delivery_date && (
											<View className="flex-row items-center gap-2">
												<IconSymbol name="bell.fill" size={14} color="#9CA3AF" />
												<ThemedText className="text-gray-300 text-sm">
													Scheduled:{" "}
													{new Date(delivery.scheduled_delivery_date).toLocaleDateString()}
												</ThemedText>
											</View>
										)}
									</View>

									{/* Approval Status */}
									{delivery.approved_by_farm_owner && (
										<View className="mt-3 pt-3 border-t border-gray-700">
											<View className="flex-row items-center gap-2">
												<IconSymbol name="checkmark" size={14} color="#10B981" />
												<ThemedText className="text-green-400 text-sm font-medium">
													Approved by farm owner
												</ThemedText>
											</View>
										</View>
									)}
								</Pressable>
							))
						)}
					</View>
				</ScrollView>
			)}

			{/* Detail Modal */}
			{showDetailModal && selectedDelivery && (
				<DeliveryDetailModal
					visible={showDetailModal}
					delivery={selectedDelivery}
					onClose={() => {
						setShowDetailModal(false);
						setSelectedDelivery(null);
					}}
					onUpdateStatus={handleUpdateStatus}
					onApprove={handleApproveDelivery}
					onEdit={() => {
						setShowDetailModal(false);
						setUpdateForm({
							status: selectedDelivery.status,
							driver_name: selectedDelivery.driver_name || "",
							driver_phone: selectedDelivery.driver_phone || "",
							vehicle_number: selectedDelivery.vehicle_number || "",
							delivery_notes: selectedDelivery.delivery_notes || "",
						});
						setShowUpdateModal(true);
					}}
				/>
			)}

			{/* Update Modal */}
			{showUpdateModal && selectedDelivery && (
				<UpdateDeliveryModal
					visible={showUpdateModal}
					delivery={selectedDelivery}
					form={updateForm}
					onFormChange={setUpdateForm}
					onClose={() => {
						setShowUpdateModal(false);
						setSelectedDelivery(null);
					}}
					onSave={handleUpdateDeliveryInfo}
				/>
			)}
		</ThemedView>
	);
}

// Delivery Detail Modal Component
interface DeliveryDetailModalProps {
	visible: boolean;
	delivery: Delivery;
	onClose: () => void;
	onUpdateStatus: (deliveryId: string, newStatus: string) => void;
	onApprove: (deliveryId: string) => void;
	onEdit: () => void;
}

function DeliveryDetailModal({
	visible,
	delivery,
	onClose,
	onUpdateStatus,
	onApprove,
	onEdit,
}: DeliveryDetailModalProps) {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "approved":
				return "bg-green-600";
			case "delivered":
				return "bg-blue-600";
			case "in_transit":
			case "picked_up":
			case "arrived":
				return "bg-yellow-600";
			case "rejected":
			case "cancelled":
				return "bg-red-600";
			default:
				return "bg-gray-600";
		}
	};

	const getStatusText = (status: string) => {
		const statusMap: Record<string, string> = {
			pending: "Pending",
			picked_up: "Picked Up",
			in_transit: "In Transit",
			arrived: "Arrived",
			delivered: "Delivered",
			approved: "Approved",
			rejected: "Rejected",
			cancelled: "Cancelled",
		};
		return statusMap[status] || status;
	};

	const nextStatus = () => {
		const statusFlow: Record<string, string> = {
			pending: "picked_up",
			picked_up: "in_transit",
			in_transit: "arrived",
			arrived: "delivered",
			delivered: "approved",
		};
		return statusFlow[delivery.status];
	};

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				{/* Header */}
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<View className="flex-1">
						<ThemedText type="title" className="text-xl font-bold text-white">
							Delivery Details
						</ThemedText>
						<ThemedText className="text-gray-400 text-sm mt-1">
							{delivery.delivery_number}
						</ThemedText>
					</View>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="chevron.left" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				<ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
					{/* Status */}
					<View className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
						<ThemedText className="text-sm text-gray-400 mb-2 uppercase font-semibold">
							Status
						</ThemedText>
						<View className={`px-4 py-2 rounded-lg self-start ${getStatusColor(delivery.status)}`}>
							<ThemedText className="text-white font-semibold">
								{getStatusText(delivery.status)}
							</ThemedText>
						</View>
					</View>

					{/* Product Information */}
					<View className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
						<ThemedText className="text-sm text-gray-400 mb-3 uppercase font-semibold">
							Product Information
						</ThemedText>
						<ThemedText className="text-gray-300 text-sm">
							Quantity: {delivery.quantity} {delivery.unit}
						</ThemedText>
					</View>

					{/* Supplier Information */}
					<View className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
						<ThemedText className="text-sm text-gray-400 mb-3 uppercase font-semibold">
							Supplier Information
						</ThemedText>
						<ThemedText className="text-white text-lg font-bold mb-2">
							{delivery.mitra?.company_name || "Mitra"}
						</ThemedText>
						<ThemedText className="text-gray-300 text-sm">
							Contact: {delivery.mitra?.contact_person || "N/A"}
						</ThemedText>
					</View>

					{/* Destination Information */}
					{delivery.farm && (
						<View className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
							<ThemedText className="text-sm text-gray-400 mb-3 uppercase font-semibold">
								Destination Farm
							</ThemedText>
							<ThemedText className="text-white text-lg font-bold mb-2">
								{delivery.farm.farm_name}
							</ThemedText>
							<ThemedText className="text-gray-300 text-sm mb-1">
								Owner: {delivery.farm.owner_name}
							</ThemedText>
							<ThemedText className="text-gray-300 text-sm mb-2">
								Email: {delivery.farm.contact_email}
							</ThemedText>
							<ThemedText className="text-gray-300 text-sm">
								Address: {delivery.delivery_address}
							</ThemedText>
						</View>
					)}

					{/* Driver Information */}
					{(delivery.driver_name || delivery.driver_phone || delivery.vehicle_number) && (
						<View className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
							<ThemedText className="text-sm text-gray-400 mb-3 uppercase font-semibold">
								Driver & Vehicle
							</ThemedText>
							{delivery.driver_name && (
								<ThemedText className="text-gray-300 text-sm mb-1">
									Driver: {delivery.driver_name}
								</ThemedText>
							)}
							{delivery.driver_phone && (
								<ThemedText className="text-gray-300 text-sm mb-1">
									Phone: {delivery.driver_phone}
								</ThemedText>
							)}
							{delivery.vehicle_number && (
								<ThemedText className="text-gray-300 text-sm">
									Vehicle: {delivery.vehicle_number}
								</ThemedText>
							)}
						</View>
					)}

					{/* Delivery Timeline */}
					<View className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
						<ThemedText className="text-sm text-gray-400 mb-3 uppercase font-semibold">
							Timeline
						</ThemedText>
						{delivery.scheduled_delivery_date && (
							<ThemedText className="text-gray-300 text-sm mb-1">
								Scheduled: {new Date(delivery.scheduled_delivery_date).toLocaleString()}
							</ThemedText>
						)}
						{delivery.actual_delivery_date && (
							<ThemedText className="text-gray-300 text-sm mb-1">
								Delivered: {new Date(delivery.actual_delivery_date).toLocaleString()}
							</ThemedText>
						)}
						{delivery.approved_at && (
							<ThemedText className="text-green-400 text-sm">
								Approved: {new Date(delivery.approved_at).toLocaleString()}
							</ThemedText>
						)}
					</View>

					{/* Notes */}
					{delivery.delivery_notes && (
						<View className="mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
							<ThemedText className="text-sm text-gray-400 mb-2 uppercase font-semibold">
								Delivery Notes
							</ThemedText>
							<ThemedText className="text-gray-300 text-sm">{delivery.delivery_notes}</ThemedText>
						</View>
					)}

					{/* Approval Status */}
					{delivery.approved_by_farm_owner && (
						<View className="mb-6 bg-green-900/20 p-4 rounded-xl border border-green-700">
							<View className="flex-row items-center gap-2 mb-2">
								<IconSymbol name="checkmark" size={20} color="#10B981" />
								<ThemedText className="text-green-400 font-bold">Approved by Farm Owner</ThemedText>
							</View>
							{delivery.farm_owner_name && (
								<ThemedText className="text-green-300 text-sm">
									By: {delivery.farm_owner_name}
								</ThemedText>
							)}
						</View>
					)}
				</ScrollView>

				{/* Action Buttons */}
				<View className="px-6 pb-10 gap-3">
					{nextStatus() && delivery.status !== "approved" && (
						<Pressable
							onPress={() => {
								onUpdateStatus(delivery.id, nextStatus());
								onClose();
							}}
							className="bg-blue-600 py-4 rounded-xl">
							<ThemedText className="text-white text-center font-semibold">
								Mark as {getStatusText(nextStatus())}
							</ThemedText>
						</Pressable>
					)}

					{delivery.status === "delivered" && !delivery.approved_by_farm_owner && (
						<Pressable
							onPress={() => {
								onApprove(delivery.id);
								onClose();
							}}
							className="bg-green-600 py-4 rounded-xl">
							<ThemedText className="text-white text-center font-semibold">
								Approve Delivery
							</ThemedText>
						</Pressable>
					)}

					<Pressable onPress={onEdit} className="bg-gray-700 py-4 rounded-xl">
						<ThemedText className="text-white text-center font-semibold">
							Edit Delivery Info
						</ThemedText>
					</Pressable>
				</View>
			</ThemedView>
		</Modal>
	);
}

// Update Delivery Modal Component
interface UpdateDeliveryModalProps {
	visible: boolean;
	delivery: Delivery;
	form: {
		status: string;
		driver_name: string;
		driver_phone: string;
		vehicle_number: string;
		delivery_notes: string;
	};
	onFormChange: (form: any) => void;
	onClose: () => void;
	onSave: () => void;
}

function UpdateDeliveryModal({
	visible,
	delivery,
	form,
	onFormChange,
	onClose,
	onSave,
}: UpdateDeliveryModalProps) {
	const statusOptions = [
		{ value: "pending", label: "Pending" },
		{ value: "picked_up", label: "Picked Up" },
		{ value: "in_transit", label: "In Transit" },
		{ value: "arrived", label: "Arrived" },
		{ value: "delivered", label: "Delivered" },
		{ value: "approved", label: "Approved" },
		{ value: "cancelled", label: "Cancelled" },
	];

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				{/* Header */}
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<ThemedText type="title" className="text-xl font-bold text-white">
						Update Delivery
					</ThemedText>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="xmark" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				<ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
					{/* Status */}
					<View className="mb-4">
						<ThemedText className="text-white mb-2 font-medium">Status</ThemedText>
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							<View className="flex-row gap-2">
								{statusOptions.map((option) => (
									<Pressable
										key={option.value}
										onPress={() => onFormChange({ ...form, status: option.value })}
										className={`px-4 py-2 rounded-full border ${
											form.status === option.value
												? "bg-blue-600 border-blue-600"
												: "bg-gray-800 border-gray-600"
										}`}>
										<ThemedText
											className={`text-sm ${form.status === option.value ? "text-white" : "text-gray-300"}`}>
											{option.label}
										</ThemedText>
									</Pressable>
								))}
							</View>
						</ScrollView>
					</View>

					{/* Driver Name */}
					<View className="mb-4">
						<ThemedText className="text-white mb-2 font-medium">Driver Name</ThemedText>
						<TextInput
							value={form.driver_name}
							onChangeText={(text) => onFormChange({ ...form, driver_name: text })}
							placeholder="Enter driver name"
							placeholderTextColor="#6B7280"
							className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
						/>
					</View>

					{/* Driver Phone */}
					<View className="mb-4">
						<ThemedText className="text-white mb-2 font-medium">Driver Phone</ThemedText>
						<TextInput
							value={form.driver_phone}
							onChangeText={(text) => onFormChange({ ...form, driver_phone: text })}
							placeholder="Enter driver phone"
							placeholderTextColor="#6B7280"
							keyboardType="phone-pad"
							className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
						/>
					</View>

					{/* Vehicle Number */}
					<View className="mb-4">
						<ThemedText className="text-white mb-2 font-medium">Vehicle Number</ThemedText>
						<TextInput
							value={form.vehicle_number}
							onChangeText={(text) => onFormChange({ ...form, vehicle_number: text })}
							placeholder="Enter vehicle number"
							placeholderTextColor="#6B7280"
							className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
						/>
					</View>

					{/* Delivery Notes */}
					<View className="mb-4">
						<ThemedText className="text-white mb-2 font-medium">Delivery Notes</ThemedText>
						<TextInput
							value={form.delivery_notes}
							onChangeText={(text) => onFormChange({ ...form, delivery_notes: text })}
							placeholder="Enter delivery notes"
							placeholderTextColor="#6B7280"
							multiline
							numberOfLines={4}
							textAlignVertical="top"
							className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
						/>
					</View>
				</ScrollView>

				{/* Save Button */}
				<View className="px-6 pb-10">
					<Pressable onPress={onSave} className="bg-blue-600 py-4 rounded-xl">
						<ThemedText className="text-white text-center font-semibold">Save Changes</ThemedText>
					</Pressable>
				</View>
			</ThemedView>
		</Modal>
	);
}
