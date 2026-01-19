import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	TextInput,
	View,
} from "react-native";

export default function ForgotPasswordScreen() {
	const router = useRouter();
	const { resetPassword, isLoading } = useAuth();
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const handleResetPassword = async () => {
		if (!email.trim()) {
			return;
		}

		const result = await resetPassword(email.trim());
		if (result.success) {
			setSubmitted(true);
		}
	};

	if (submitted) {
		return (
			<ThemedView className="flex-1 bg-black">
				<View className="flex-1 px-6 justify-center">
					<View className="items-center mb-8">
						<View className="w-20 h-20 bg-green-900/30 rounded-full items-center justify-center mb-4">
							<ThemedText className="text-4xl">✓</ThemedText>
						</View>
						<ThemedText className="text-2xl font-bold text-white mb-2 text-center">
							Check Your Email
						</ThemedText>
						<ThemedText className="text-base text-gray-400 text-center">
							We&apos;ve sent a password reset link to {email}
						</ThemedText>
					</View>

					<Pressable
						onPress={() => router.replace("/login")}
						className="bg-blue-600 rounded-xl py-4 items-center active:bg-blue-700">
						<ThemedText className="text-white font-semibold text-base">Back to Sign In</ThemedText>
					</Pressable>
				</View>
			</ThemedView>
		);
	}

	return (
		<ThemedView className="flex-1 bg-black">
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1">
				<ScrollView
					className="flex-1"
					contentContainerClassName="flex-grow"
					keyboardShouldPersistTaps="handled">
					<View className="flex-1 px-6 justify-center">
						{/* Header */}
						<View className="mb-8">
							<ThemedText className="text-4xl font-bold text-white mb-2">
								Forgot Password
							</ThemedText>
							<ThemedText className="text-base text-gray-400">
								Enter your email and we&apos;ll send you a link to reset your password
							</ThemedText>
						</View>

						{/* Form */}
						<View className="mb-6">
							<ThemedText className="text-sm text-gray-300 mb-2">Email</ThemedText>
							<TextInput
								className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base"
								placeholderTextColor="#6B7280"
								placeholder="Enter your email"
								value={email}
								onChangeText={setEmail}
								keyboardType="email-address"
								autoCapitalize="none"
								autoCorrect={false}
								editable={!isLoading}
							/>
						</View>

						{/* Reset Button */}
						<Pressable
							onPress={handleResetPassword}
							disabled={isLoading || !email.trim()}
							className={`bg-blue-600 rounded-xl py-4 items-center mb-4 ${
								isLoading || !email.trim() ? "opacity-50" : "active:bg-blue-700"
							}`}>
							{isLoading ? (
								<ActivityIndicator color="white" />
							) : (
								<ThemedText className="text-white font-semibold text-base">
									Send Reset Link
								</ThemedText>
							)}
						</Pressable>

						{/* Back to Login */}
						<Pressable onPress={() => router.back()} disabled={isLoading}>
							<ThemedText className="text-blue-500 text-sm font-medium text-center">
								Back to Sign In
							</ThemedText>
						</Pressable>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ThemedView>
	);
}
