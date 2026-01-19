import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

export default function ProfileScreen() {
	const router = useRouter();
	const { user, isLoading, signOut } = useAuth();

	const handleLogout = async () => {
		const result = await signOut();
		if (result.success) {
			router.replace("/login");
		}
	};

	return (
		<ThemedView className="flex-1 bg-black">
			<ScrollView className="flex-1">
				<View className="p-6">
					{/* Header */}
					<ThemedText className="text-3xl font-bold text-white mb-6">Profile</ThemedText>

					{/* User Info Card */}
					<View className="bg-gray-800 rounded-xl p-6 mb-4 border border-gray-700">
						<View className="items-center mb-6">
							<View className="w-24 h-24 bg-blue-900/50 rounded-full items-center justify-center mb-4">
								<ThemedText className="text-4xl">
									{user?.user_metadata?.full_name?.charAt(0).toUpperCase() ||
										user?.email?.charAt(0).toUpperCase()}
								</ThemedText>
							</View>

							<ThemedText className="text-xl font-semibold text-white mb-1">
								{user?.user_metadata?.full_name || "User"}
							</ThemedText>
							<ThemedText className="text-sm text-gray-400">{user?.email}</ThemedText>
						</View>

						<View className="gap-3">
							<View className="flex-row justify-between items-center">
								<ThemedText className="text-sm text-gray-400">Account ID</ThemedText>
								<ThemedText className="text-sm text-white font-mono">
									{user?.id.slice(0, 8)}...
								</ThemedText>
							</View>

							<View className="flex-row justify-between items-center">
								<ThemedText className="text-sm text-gray-400">Email Verified</ThemedText>
								<ThemedText
									className={`text-sm font-medium ${
										user?.email_confirmed_at ? "text-green-500" : "text-yellow-500"
									}`}>
									{user?.email_confirmed_at ? "Yes" : "Pending"}
								</ThemedText>
							</View>

							<View className="flex-row justify-between items-center">
								<ThemedText className="text-sm text-gray-400">Member Since</ThemedText>
								<ThemedText className="text-sm text-white">
									{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
								</ThemedText>
							</View>
						</View>
					</View>

					{/* Actions */}
					<View className="gap-3">
						<Pressable className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex-row items-center justify-between active:bg-gray-700">
							<ThemedText className="text-base text-white font-medium">Edit Profile</ThemedText>
							<ThemedText className="text-gray-400">→</ThemedText>
						</Pressable>

						<Pressable className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex-row items-center justify-between active:bg-gray-700">
							<ThemedText className="text-base text-white font-medium">Change Password</ThemedText>
							<ThemedText className="text-gray-400">→</ThemedText>
						</Pressable>

						<Pressable className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex-row items-center justify-between active:bg-gray-700">
							<ThemedText className="text-base text-white font-medium">Settings</ThemedText>
							<ThemedText className="text-gray-400">→</ThemedText>
						</Pressable>
					</View>

					{/* Logout Button */}
					<Pressable
						onPress={handleLogout}
						disabled={isLoading}
						className={`mt-6 bg-red-900/50 border border-red-800/50 rounded-xl p-4 items-center ${
							isLoading ? "opacity-50" : "active:bg-red-900/70"
						}`}>
						{isLoading ? (
							<ActivityIndicator color="#EF4444" />
						) : (
							<ThemedText className="text-red-400 font-semibold text-base">Sign Out</ThemedText>
						)}
					</Pressable>
				</View>
			</ScrollView>
		</ThemedView>
	);
}
