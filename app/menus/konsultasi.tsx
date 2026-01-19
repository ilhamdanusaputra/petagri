import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

// Import modals
import AddConsultantModal from "@/components/modals/add-consultant-modal";
import AddFarmModal from "@/components/modals/add-farm-modal";
import ScheduleVisitModal from "@/components/modals/schedule-visit-modal";
import VisitOutcomeModal from "@/components/modals/visit-outcome-modal";

// Import services and types
import {
	getConsultants,
	getConsultationDashboardSummary,
	getConsultationVisits,
	getFarms,
	getUpcomingVisits,
	updateVisitStatus,
} from "@/services/consultation";
import type {
	ConsultantWithStats,
	ConsultationDashboardSummary,
	ConsultationVisitWithDetails,
	FarmWithLastConsultation,
	UpcomingVisit,
} from "@/types/consultation";

export default function KonsultasiMenu() {
	// State for dashboard data
	const [summary, setSummary] = useState<ConsultationDashboardSummary | null>(null);
	const [upcomingVisits, setUpcomingVisits] = useState<UpcomingVisit[]>([]);
	const [consultants, setConsultants] = useState<ConsultantWithStats[]>([]);
	const [farms, setFarms] = useState<FarmWithLastConsultation[]>([]);
	const [visits, setVisits] = useState<ConsultationVisitWithDetails[]>([]);

	// State for UI
	const [activeTab, setActiveTab] = useState<"overview" | "farms" | "consultants" | "visits">(
		"overview",
	);
	const [isLoading, setIsLoading] = useState(true);

	// Modal states
	const [showAddConsultant, setShowAddConsultant] = useState(false);
	const [showAddFarm, setShowAddFarm] = useState(false);
	const [showScheduleVisit, setShowScheduleVisit] = useState(false);
	const [showVisitOutcome, setShowVisitOutcome] = useState(false);
	const [selectedVisit, setSelectedVisit] = useState<ConsultationVisitWithDetails | null>(null);

	// Load data when component focuses
	useFocusEffect(
		useCallback(() => {
			loadDashboardData();
		}, []),
	);

	const loadDashboardData = async () => {
		try {
			setIsLoading(true);
			const [summaryData, upcomingData, consultantData, farmData, visitData] = await Promise.all([
				getConsultationDashboardSummary(),
				getUpcomingVisits(5),
				getConsultants(true),
				getFarms(true),
				getConsultationVisits(),
			]);

			setSummary(summaryData);
			setUpcomingVisits(upcomingData);
			setConsultants(consultantData as ConsultantWithStats[]);
			setFarms(farmData as FarmWithLastConsultation[]);
			setVisits(visitData);
		} catch (error) {
			console.error("Error loading dashboard data:", error);
			Alert.alert("Error", "Failed to load dashboard data");
		} finally {
			setIsLoading(false);
		}
	};

	const handleStartVisit = async (visitId: string) => {
		try {
			await updateVisitStatus(visitId, "in_progress");
			Alert.alert("Success", "Visit started successfully");
			loadDashboardData();
		} catch (error) {
			console.error("Error starting visit:", error);
			Alert.alert("Error", "Failed to start visit");
		}
	};

	const handleCompleteVisit = (visit: ConsultationVisitWithDetails) => {
		setSelectedVisit(visit);
		setShowVisitOutcome(true);
	};

	// Tab Navigation Component
	const TabNavigation = () => (
		<View className="flex-row bg-gray-800 mt-4 rounded-xl p-1 shadow-sm">
			{[
				{ key: "overview", label: "Overview", icon: "house.fill" },
				{ key: "farms", label: "Farms", icon: "leaf.fill" },
				{ key: "consultants", label: "Consultants", icon: "book" },
				{ key: "visits", label: "Visits", icon: "calendar" },
			].map((tab) => (
				<Pressable
					key={tab.key}
					className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-lg gap-1.5 ${
						activeTab === tab.key ? "bg-blue-900/50 shadow-sm" : ""
					}`}
					onPress={() => setActiveTab(tab.key as any)}>
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
	);

	// Overview Tab Component
	const OverviewTab = () => (
		<View className="gap-3">
			{/* Summary Cards */}
			{summary && (
				<>
					<ThemedText type="title" className="mb-2 text-white text-lg">
						Dashboard Summary
					</ThemedText>
					<View className="flex-row flex-wrap justify-between gap-3 mb-3">
						{[
							{ label: "Total Farms", value: summary.total_farms, color: "bg-blue-500" },
							{ label: "Active Farms", value: summary.active_farms, color: "bg-green-500" },
							{
								label: "Total Consultants",
								value: summary.total_consultants,
								color: "bg-purple-500",
							},
							{
								label: "Available Consultants",
								value: summary.available_consultants,
								color: "bg-yellow-500",
							},
							{
								label: "Visits Today",
								value: summary.scheduled_visits_today,
								color: "bg-orange-500",
							},
							{
								label: "Visits This Month",
								value: summary.completed_visits_this_month,
								color: "bg-red-500",
							},
						].map((item, index) => (
							<View
								key={index}
								className="w-[48%] bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-700">
								<View
									className={`w-12 h-12 ${item.color} rounded-xl mb-3 justify-center items-center`}>
									<ThemedText className="text-white font-bold text-lg">{item.value}</ThemedText>
								</View>
								<ThemedText className="text-gray-300 text-sm">{item.label}</ThemedText>
							</View>
						))}
					</View>
				</>
			)}

			{/* Upcoming Visits */}
			<View className="gap-3">
				<View className="flex-row justify-between items-center">
					<ThemedText type="title" className="text-white text-lg">
						Upcoming Visits
					</ThemedText>
					<TouchableOpacity
						className="bg-blue-900/50 px-4 py-2 rounded-lg border border-blue-800/50"
						onPress={() => setShowScheduleVisit(true)}>
						<ThemedText className="text-blue-400 font-medium text-sm">Schedule</ThemedText>
					</TouchableOpacity>
				</View>

				{upcomingVisits.length > 0 ? (
					upcomingVisits.map((visit) => (
						<View
							key={visit.id}
							className="bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-700">
							<View className="flex-row justify-between items-start">
								<View className="flex-1">
									<ThemedText className="font-medium text-white">{visit.farm_name}</ThemedText>
									<ThemedText className="text-gray-300 text-sm">
										with {visit.consultant_name}
									</ThemedText>
									<ThemedText className="text-sm text-gray-400 mt-1">
										{new Date(visit.scheduled_date).toLocaleDateString()} at{" "}
										{new Date(visit.scheduled_date).toLocaleTimeString()}
									</ThemedText>
								</View>
								<View className="flex-row gap-2">
									<View
										className={`px-2 py-1 rounded-lg ${
											visit.status === "scheduled" ? "bg-blue-900/50" : "bg-green-900/50"
										}`}>
										<ThemedText className="text-xs text-white">{visit.status}</ThemedText>
									</View>
									<View className="bg-gray-900 px-2 py-1 rounded-lg">
										<ThemedText className="text-xs text-gray-300">{visit.visit_type}</ThemedText>
									</View>
								</View>
							</View>
						</View>
					))
				) : (
					<View className="bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-700">
						<ThemedText className="text-center text-gray-400">
							No upcoming visits scheduled
						</ThemedText>
					</View>
				)}
			</View>

			{/* Quick Actions */}
			<View className="gap-3 mt-3">
				<ThemedText type="title" className="text-white text-lg">
					Quick Actions
				</ThemedText>
				<View className="flex-row gap-3">
					<Pressable
						className="flex-1 bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-sm items-center"
						onPress={() => setShowAddFarm(true)}>
						<View className="w-11 h-11 rounded-xl bg-green-900/30 items-center justify-center border border-green-800/50 mb-2">
							<ThemedText className="text-2xl">🌾</ThemedText>
						</View>
						<ThemedText className="text-white font-medium text-center">Add Farm</ThemedText>
					</Pressable>
					<Pressable
						className="flex-1 bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-sm items-center"
						onPress={() => setShowAddConsultant(true)}>
						<View className="w-11 h-11 rounded-xl bg-blue-900/30 items-center justify-center border border-blue-800/50 mb-2">
							<ThemedText className="text-2xl">👨‍🌾</ThemedText>
						</View>
						<ThemedText className="text-white font-medium text-center">Add Consultant</ThemedText>
					</Pressable>
				</View>
			</View>
		</View>
	);

	// Farms Tab Component
	const FarmsTab = () => (
		<View className="gap-3">
			<View className="flex-row justify-between items-center">
				<ThemedText type="title" className="text-white text-lg">
					Farms ({farms.length})
				</ThemedText>
				<TouchableOpacity
					className="bg-green-900/50 px-4 py-2 rounded-lg border border-green-800/50"
					onPress={() => setShowAddFarm(true)}>
					<ThemedText className="text-green-400 font-medium text-sm">Add Farm</ThemedText>
				</TouchableOpacity>
			</View>

			{farms.length > 0 ? (
				farms.map((item) => (
					<View
						key={item.id}
						className="bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-700 gap-3">
						<View className="flex-row justify-between items-start">
							<View className="flex-1">
								<ThemedText className="font-medium text-lg text-white">{item.farm_name}</ThemedText>
								<ThemedText className="text-gray-300 text-sm">Owner: {item.owner_name}</ThemedText>
								<ThemedText className="text-gray-300 text-sm">
									Area: {item.total_area} hectares
								</ThemedText>
							</View>
							<View className="items-end">
								<View className="bg-blue-900/50 px-2 py-1 rounded-lg mb-1 border border-blue-800/50">
									<ThemedText className="text-white text-xs">{item.farm_status}</ThemedText>
								</View>
								<ThemedText className="text-sm text-gray-400">
									Health: {item.health_score}/5
								</ThemedText>
							</View>
						</View>

						<View className="gap-1">
							<ThemedText className="text-sm text-gray-300">
								Crops: {item.crop_types.join(", ")}
							</ThemedText>
							<ThemedText className="text-sm text-gray-300">
								Method: {item.farming_method}
							</ThemedText>
						</View>

						{item.last_visit && (
							<View className="bg-gray-900 p-2 rounded-lg">
								<ThemedText className="text-xs text-gray-400">
									Last consultation: {new Date(item.last_visit.scheduled_date).toLocaleDateString()}
								</ThemedText>
							</View>
						)}
					</View>
				))
			) : (
				<View className="bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-700">
					<ThemedText className="text-center text-gray-400">No farms registered yet</ThemedText>
				</View>
			)}
		</View>
	);

	// Consultants Tab Component
	const ConsultantsTab = () => (
		<View className="gap-3">
			<View className="flex-row justify-between items-center">
				<ThemedText type="title" className="text-white text-lg">
					Consultants ({consultants.length})
				</ThemedText>
				<TouchableOpacity
					className="bg-blue-900/50 px-4 py-2 rounded-lg border border-blue-800/50"
					onPress={() => setShowAddConsultant(true)}>
					<ThemedText className="text-blue-400 font-medium text-sm">Add Consultant</ThemedText>
				</TouchableOpacity>
			</View>

			{consultants.length > 0 ? (
				consultants.map((item) => (
					<View
						key={item.id}
						className="bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-700 gap-3">
						<View className="flex-row justify-between items-start">
							<View className="flex-1">
								<ThemedText className="font-medium text-lg text-white">{item.full_name}</ThemedText>
								<ThemedText className="text-gray-300 text-sm">{item.specialization}</ThemedText>
								<ThemedText className="text-gray-300 text-sm">
									Experience: {item.experience_years} years
								</ThemedText>
							</View>
							<View className="items-end gap-1">
								<View
									className={`px-2 py-1 rounded-lg ${
										item.availability_status === "available"
											? "bg-green-900/50 border border-green-800/50"
											: item.availability_status === "busy"
												? "bg-yellow-900/50 border border-yellow-800/50"
												: "bg-red-900/50 border border-red-800/50"
									}`}>
									<ThemedText className="text-xs text-white">{item.availability_status}</ThemedText>
								</View>
								<ThemedText className="text-sm text-gray-400">Rating: {item.rating}/5</ThemedText>
							</View>
						</View>

						<View className="flex-row justify-between items-center">
							<View className="gap-0.5">
								<ThemedText className="text-sm text-gray-300">
									Completed: {item.completed_visits_count} visits
								</ThemedText>
								<ThemedText className="text-sm text-gray-300">
									Upcoming: {item.upcoming_visits_count} visits
								</ThemedText>
							</View>
							<TouchableOpacity
								className="bg-green-900/50 px-3 py-2 rounded-lg border border-green-800/50"
								onPress={() => {
									// TODO: Pre-select this consultant in schedule modal
									setShowScheduleVisit(true);
								}}>
								<ThemedText className="text-green-400 text-sm font-medium">Schedule</ThemedText>
							</TouchableOpacity>
						</View>

						{item.service_areas.length > 0 && (
							<View className="bg-gray-900 p-2 rounded-lg">
								<ThemedText className="text-xs text-gray-400">
									Service areas: {item.service_areas.join(", ")}
								</ThemedText>
							</View>
						)}
					</View>
				))
			) : (
				<View className="bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-700">
					<ThemedText className="text-center text-gray-400">
						No consultants registered yet
					</ThemedText>
				</View>
			)}
		</View>
	);

	// Visits Tab Component
	const VisitsTab = () => (
		<View className="gap-3">
			<View className="flex-row justify-between items-center">
				<ThemedText type="title" className="text-white text-lg">
					All Visits ({visits.length})
				</ThemedText>
				<TouchableOpacity
					className="bg-blue-900/50 px-4 py-2 rounded-lg border border-blue-800/50"
					onPress={() => setShowScheduleVisit(true)}>
					<ThemedText className="text-blue-400 font-medium text-sm">Schedule</ThemedText>
				</TouchableOpacity>
			</View>

			{visits.length > 0 ? (
				visits.map((item) => (
					<View
						key={item.id}
						className="bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-700 gap-3">
						<View className="flex-row justify-between items-start">
							<View className="flex-1">
								<ThemedText className="font-medium text-white text-base">
									{item.farm.farm_name}
								</ThemedText>
								<ThemedText className="text-gray-300 text-sm">
									with {item.consultant.full_name}
								</ThemedText>
								<ThemedText className="text-sm text-gray-400 mt-1">
									{new Date(item.scheduled_date).toLocaleDateString()} at{" "}
									{new Date(item.scheduled_date).toLocaleTimeString()}
								</ThemedText>
							</View>
							<View className="items-end gap-1">
								<View
									className={`px-2 py-1 rounded-lg ${
										item.visit_status === "scheduled"
											? "bg-blue-900/50 border border-blue-800/50"
											: item.visit_status === "in_progress"
												? "bg-yellow-900/50 border border-yellow-800/50"
												: item.visit_status === "completed"
													? "bg-green-900/50 border border-green-800/50"
													: item.visit_status === "cancelled"
														? "bg-red-900/50 border border-red-800/50"
														: "bg-gray-900/50 border border-gray-800/50"
									}`}>
									<ThemedText className="text-xs text-white">{item.visit_status}</ThemedText>
								</View>
								<View className="bg-gray-900 px-2 py-1 rounded-lg">
									<ThemedText className="text-xs text-gray-300">{item.visit_type}</ThemedText>
								</View>
							</View>
						</View>

						{item.visit_status === "scheduled" && (
							<TouchableOpacity
								className="bg-green-900/50 px-3 py-2 rounded-lg border border-green-800/50"
								onPress={() => handleStartVisit(item.id)}>
								<ThemedText className="text-green-400 text-center font-medium">
									Start Visit
								</ThemedText>
							</TouchableOpacity>
						)}

						{item.visit_status === "in_progress" && (
							<TouchableOpacity
								className="bg-blue-900/50 px-3 py-2 rounded-lg border border-blue-800/50"
								onPress={() => handleCompleteVisit(item)}>
								<ThemedText className="text-blue-400 text-center font-medium">
									Complete Visit
								</ThemedText>
							</TouchableOpacity>
						)}

						{item.visit_status === "completed" && (
							<View className="bg-gray-900 p-2 rounded-lg gap-1">
								<ThemedText className="text-xs text-gray-400">
									Completed:{" "}
									{item.actual_end_time
										? new Date(item.actual_end_time).toLocaleDateString()
										: "N/A"}
								</ThemedText>
								{item.visit_rating && (
									<ThemedText className="text-xs text-gray-400">
										Rating: {item.visit_rating}/5
									</ThemedText>
								)}
								{item.problems_identified.length > 0 && (
									<ThemedText className="text-xs text-gray-400">
										Problems: {item.problems_identified.length}
									</ThemedText>
								)}
							</View>
						)}
					</View>
				))
			) : (
				<View className="bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-700">
					<ThemedText className="text-center text-gray-400">No visits scheduled yet</ThemedText>
				</View>
			)}
		</View>
	);

	const renderContent = () => {
		switch (activeTab) {
			case "overview":
				return <OverviewTab />;
			case "farms":
				return <FarmsTab />;
			case "consultants":
				return <ConsultantsTab />;
			case "visits":
				return <VisitsTab />;
			default:
				return <OverviewTab />;
		}
	};

	if (isLoading) {
		return (
			<ThemedView className="flex-1 justify-center items-center">
				<ThemedText className="text-white">Loading consultation dashboard...</ThemedText>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container} className="flex-1">
			{/* Tab Navigation */}
			<TabNavigation />

			{/* Content */}
			<ScrollView className="flex-1 pt-5" showsVerticalScrollIndicator={false}>
				<View className="pb-5">{renderContent()}</View>
			</ScrollView>

			{/* Modals */}
			<AddConsultantModal
				visible={showAddConsultant}
				onClose={() => setShowAddConsultant(false)}
				onSuccess={loadDashboardData}
			/>

			<AddFarmModal
				visible={showAddFarm}
				onClose={() => setShowAddFarm(false)}
				onSuccess={loadDashboardData}
			/>

			<ScheduleVisitModal
				visible={showScheduleVisit}
				onClose={() => setShowScheduleVisit(false)}
				onSuccess={loadDashboardData}
			/>

			<VisitOutcomeModal
				visible={showVisitOutcome}
				onClose={() => {
					setShowVisitOutcome(false);
					setSelectedVisit(null);
				}}
				onSuccess={loadDashboardData}
				visit={selectedVisit}
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { padding: 16, gap: 8 },
});
