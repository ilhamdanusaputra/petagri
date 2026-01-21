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

interface User {
	id: string;
	email: string;
	created_at: string;
	user_metadata: {
		full_name?: string;
		phone?: string;
	};
	app_metadata: any;
}

interface Role {
	id: string;
	name: string;
	description?: string;
	created_at: string;
}

interface UserRole {
	id: string;
	user_id: string;
	role_id: string;
	assigned_at: string;
	roles: Role;
}

type TabType = "users" | "roles";

export default function UserRolesMenu() {
	const [users, setUsers] = useState<User[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [userRoles, setUserRoles] = useState<UserRole[]>([]);
	const [loading, setLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [activeTab, setActiveTab] = useState<TabType>("users");
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const loadUsers = useCallback(async () => {
		try {
			const { data, error } = await supabase.from("v_profiles").select("*").order("email");
			if (error) throw error;
			console.log("PROFILES:", data);
			setUsers(data || []);
		} catch (error) {
			console.error("Error loading profiles:", error);
		}
	}, []);

	const loadRoles = useCallback(async () => {
		try {
			const { data, error } = await supabase.from("roles").select("*").order("name");
			if (error) throw error;
			setRoles(data || []);
		} catch (error) {
			console.error("Error loading roles:", error);
		}
	}, []);

	const loadUserRoles = useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from("user_roles")
				.select(
					`
          *,
          roles(*)
        `,
				)
				.order("assigned_at", { ascending: false });
			if (error) throw error;
			setUserRoles(data || []);
		} catch (error) {
			console.error("Error loading user roles:", error);
		}
	}, []);

	const loadData = useCallback(async () => {
		setLoading(true);
		await Promise.all([loadUsers(), loadRoles(), loadUserRoles()]);
		setLoading(false);
	}, [loadUsers, loadRoles, loadUserRoles]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadData();
		setRefreshing(false);
	};

	const handleAssignRole = async (userId: string, roleId: string) => {
		try {
			const { error } = await supabase.from("user_roles").insert({
				user_id: userId,
				role_id: roleId,
			});

			if (error) throw error;

			console.info("Role assigned successfully");
			await loadUserRoles();
		} catch (error: any) {
			console.error("Error assigning role:", error);
			if (error?.code === "23505") {
				console.error("This user already has this role");
			}
		}
	};

	const handleRemoveRole = async (userRoleId: string) => {
		try {
			const { error } = await supabase.from("user_roles").delete().eq("id", userRoleId);

			if (error) throw error;

			console.info("Role removed successfully");
			await loadUserRoles();
		} catch (error) {
			console.error("Error removing role:", error);
		}
	};

	const getUserRolesByUserId = (userId: string): UserRole[] => {
		return userRoles.filter((ur) => ur.user_id === userId);
	};

	const getRolesByUserId = (userId: string): Role[] => {
		return getUserRolesByUserId(userId).map((ur) => ur.roles);
	};

	const filteredUsers = users.filter((user) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			user.email.toLowerCase().includes(query) ||
			user.user_metadata?.full_name?.toLowerCase().includes(query)
		);
	});

	const filteredRoles = roles.filter((role) => {
		if (!searchQuery) return true;
		const query = searchQuery.toLowerCase();
		return (
			role.name.toLowerCase().includes(query) || role.description?.toLowerCase().includes(query)
		);
	});

	return (
		<ThemedView className="flex-1 bg-black">
			{/* Tab Navigation */}
			<View className="flex-row bg-gray-800 mx-5 mt-4 rounded-xl p-1 shadow-sm">
				<Pressable
					onPress={() => setActiveTab("users")}
					className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-lg gap-1.5 ${
						activeTab === "users" ? "bg-blue-900/50 shadow-sm" : ""
					}`}>
					<IconSymbol
						name="person.2.fill"
						size={18}
						color={activeTab === "users" ? "#3B82F6" : "#9CA3AF"}
					/>
					<ThemedText
						className={`text-xs font-semibold ${
							activeTab === "users" ? "text-blue-400" : "text-gray-400"
						}`}>
						Users
					</ThemedText>
				</Pressable>
				<Pressable
					onPress={() => setActiveTab("roles")}
					className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-lg gap-1.5 ${
						activeTab === "roles" ? "bg-blue-900/50 shadow-sm" : ""
					}`}>
					<IconSymbol
						name="person.fill"
						size={18}
						color={activeTab === "roles" ? "#3B82F6" : "#9CA3AF"}
					/>
					<ThemedText
						className={`text-xs font-semibold ${
							activeTab === "roles" ? "text-blue-400" : "text-gray-400"
						}`}>
						Roles
					</ThemedText>
				</Pressable>
			</View>

			{/* Search Bar */}
			<View className="mx-5 mt-4">
				<View className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 flex-row items-center">
					<IconSymbol name="magnifyingglass" size={18} color="#9CA3AF" />
					<TextInput
						value={searchQuery}
						onChangeText={setSearchQuery}
						placeholder={activeTab === "users" ? "Search users..." : "Search roles..."}
						placeholderTextColor="#6B7280"
						className="flex-1 ml-3 text-white"
					/>
				</View>
			</View>

			{/* Content */}
			{loading && (activeTab === "users" ? users : roles).length === 0 ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#3B82F6" />
					<ThemedText className="text-gray-400 mt-3">Loading...</ThemedText>
				</View>
			) : (
				<ScrollView
					className="flex-1"
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					showsVerticalScrollIndicator={false}>
					<View className="p-6 gap-4">
						{activeTab === "users" ? (
							// Users List
							filteredUsers.length === 0 ? (
								<View className="items-center justify-center py-20">
									<IconSymbol name="person.2.fill" size={64} color="#6B7280" />
									<ThemedText className="text-gray-400 text-lg font-medium mt-4">
										No users found
									</ThemedText>
								</View>
							) : (
								filteredUsers.map((user) => {
									const userRolesList = getRolesByUserId(user.id);
									return (
										<View
											key={user.id}
											className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
											{/* User Info */}
											<View className="flex-row items-start justify-between mb-3">
												<View className="flex-1">
													<ThemedText className="text-white font-bold text-lg mb-1">
														{user.user_metadata?.full_name || user.email}
													</ThemedText>
													<ThemedText className="text-gray-400 text-sm">{user.email}</ThemedText>
													{user.user_metadata?.phone && (
														<ThemedText className="text-gray-500 text-sm mt-1">
															📱 {user.user_metadata.phone}
														</ThemedText>
													)}
												</View>
												<Pressable
													onPress={() => {
														setSelectedUser(user);
														setShowAssignRoleModal(true);
													}}
													className="bg-blue-600 px-4 py-2 rounded-lg">
													<ThemedText className="text-white text-xs font-semibold">
														Assign Role
													</ThemedText>
												</Pressable>
											</View>

											{/* User Roles */}
											{userRolesList.length > 0 ? (
												<View className="pt-3 border-t border-gray-700">
													<ThemedText className="text-gray-400 text-xs mb-2 uppercase font-semibold">
														Assigned Roles
													</ThemedText>
													<View className="flex-row flex-wrap gap-2">
														{getUserRolesByUserId(user.id).map((ur) => (
															<View
																key={ur.id}
																className="bg-blue-900/30 border border-blue-700 rounded-lg px-3 py-2 flex-row items-center gap-2">
																<ThemedText className="text-blue-300 text-sm font-medium">
																	{ur.roles.name}
																</ThemedText>
																<Pressable onPress={() => handleRemoveRole(ur.id)} className="ml-1">
																	<IconSymbol name="xmark" size={12} color="#EF4444" />
																</Pressable>
															</View>
														))}
													</View>
												</View>
											) : (
												<View className="pt-3 border-t border-gray-700">
													<ThemedText className="text-gray-500 text-sm italic">
														No roles assigned
													</ThemedText>
												</View>
											)}

											<View className="pt-3 border-t border-gray-700 mt-3">
												<ThemedText className="text-gray-500 text-xs">
													Created: {new Date(user.created_at).toLocaleDateString()}
												</ThemedText>
											</View>
										</View>
									);
								})
							)
						) : // Roles List
						filteredRoles.length === 0 ? (
							<View className="items-center justify-center py-20">
								<IconSymbol name="person.fill" size={64} color="#6B7280" />
								<ThemedText className="text-gray-400 text-lg font-medium mt-4">
									No roles found
								</ThemedText>
							</View>
						) : (
							filteredRoles.map((role) => {
								const usersWithRole = userRoles.filter((ur) => ur.role_id === role.id);
								return (
									<View
										key={role.id}
										className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
										<View className="flex-row items-start justify-between mb-2">
											<View className="flex-1">
												<ThemedText className="text-white font-bold text-lg mb-1">
													{role.name}
												</ThemedText>
												{role.description && (
													<ThemedText className="text-gray-400 text-sm">
														{role.description}
													</ThemedText>
												)}
											</View>
											<View className="bg-blue-900/30 px-3 py-1 rounded-full">
												<ThemedText className="text-blue-400 text-xs font-semibold">
													{usersWithRole.length} users
												</ThemedText>
											</View>
										</View>

										<View className="pt-3 border-t border-gray-700 mt-3">
											<ThemedText className="text-gray-500 text-xs">
												Created: {new Date(role.created_at).toLocaleDateString()}
											</ThemedText>
										</View>
									</View>
								);
							})
						)}
					</View>
				</ScrollView>
			)}

			{/* Assign Role Modal */}
			{showAssignRoleModal && selectedUser && (
				<AssignRoleModal
					visible={showAssignRoleModal}
					user={selectedUser}
					roles={roles}
					currentRoles={getRolesByUserId(selectedUser.id)}
					onClose={() => {
						setShowAssignRoleModal(false);
						setSelectedUser(null);
					}}
					onAssign={handleAssignRole}
				/>
			)}
		</ThemedView>
	);
}

// Assign Role Modal Component
interface AssignRoleModalProps {
	visible: boolean;
	user: User;
	roles: Role[];
	currentRoles: Role[];
	onClose: () => void;
	onAssign: (userId: string, roleId: string) => void;
}

function AssignRoleModal({
	visible,
	user,
	roles,
	currentRoles,
	onClose,
	onAssign,
}: AssignRoleModalProps) {
	const [selectedRoleId, setSelectedRoleId] = useState<string>("");

	const availableRoles = roles.filter((role) => !currentRoles.some((cr) => cr.id === role.id));

	return (
		<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
			<ThemedView className="flex-1 bg-black">
				{/* Header */}
				<View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
					<View className="flex-1">
						<ThemedText type="title" className="text-xl font-bold text-white">
							Assign Role
						</ThemedText>
						<ThemedText className="text-gray-400 text-sm mt-1">
							{user.user_metadata?.full_name || user.email}
						</ThemedText>
					</View>
					<Pressable
						onPress={onClose}
						className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
						<IconSymbol name="xmark" size={16} color="#9CA3AF" />
					</Pressable>
				</View>

				<ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
					{/* Current Roles */}
					{currentRoles.length > 0 && (
						<View className="mb-6 bg-blue-900/20 border border-blue-700 p-4 rounded-xl">
							<View className="flex-row items-center gap-2 mb-2">
								<IconSymbol name="checkmark" size={20} color="#60A5FA" />
								<ThemedText className="text-blue-400 font-semibold">Current Roles</ThemedText>
							</View>
							<View className="flex-row flex-wrap gap-2 mt-2">
								{currentRoles.map((role) => (
									<View
										key={role.id}
										className="bg-blue-900/50 border border-blue-600 rounded-lg px-3 py-2">
										<ThemedText className="text-blue-300 text-sm font-medium">
											{role.name}
										</ThemedText>
									</View>
								))}
							</View>
						</View>
					)}

					{/* Available Roles */}
					<ThemedText className="text-white font-semibold mb-3">Select Role to Assign</ThemedText>

					{availableRoles.length === 0 ? (
						<View className="items-center py-12">
							<IconSymbol name="person.fill" size={64} color="#6B7280" />
							<ThemedText className="text-gray-400 text-lg font-medium mt-4">
								No Available Roles
							</ThemedText>
							<ThemedText className="text-gray-500 text-center mt-2">
								This user already has all available roles
							</ThemedText>
						</View>
					) : (
						<View className="gap-3">
							{availableRoles.map((role) => (
								<Pressable
									key={role.id}
									onPress={() => setSelectedRoleId(role.id)}
									className={`p-4 rounded-xl border ${
										selectedRoleId === role.id
											? "bg-blue-900/30 border-blue-600"
											: "bg-gray-800 border-gray-700"
									}`}>
									<View className="flex-row items-center justify-between">
										<View className="flex-1">
											<ThemedText className="text-white font-bold text-base mb-1">
												{role.name}
											</ThemedText>
											{role.description && (
												<ThemedText className="text-gray-400 text-sm">
													{role.description}
												</ThemedText>
											)}
										</View>
										{selectedRoleId === role.id && (
											<View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center">
												<IconSymbol name="checkmark" size={14} color="#FFFFFF" />
											</View>
										)}
									</View>
								</Pressable>
							))}
						</View>
					)}
				</ScrollView>

				{/* Assign Button */}
				<View className="px-6 pb-10">
					<Pressable
						onPress={() => {
							if (selectedRoleId) {
								onAssign(user.id, selectedRoleId);
								onClose();
							}
						}}
						disabled={!selectedRoleId}
						className={`py-4 rounded-xl ${selectedRoleId ? "bg-blue-600" : "bg-gray-600"}`}>
						<ThemedText className="text-white text-center font-semibold">
							{selectedRoleId ? "Assign Role" : "Select a Role"}
						</ThemedText>
					</Pressable>
				</View>
			</ThemedView>
		</Modal>
	);
}
