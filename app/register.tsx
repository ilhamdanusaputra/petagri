import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { Link, useRouter } from "expo-router";
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

export default function RegisterScreen() {
	const router = useRouter();
	const { signUp, isLoading } = useAuth();
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleRegister = async () => {
		if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
			return;
		}

		if (password !== confirmPassword) {
			alert("Passwords do not match");
			return;
		}

		if (password.length < 6) {
			alert("Password must be at least 6 characters");
			return;
		}

		const result = await signUp(email.trim(), password, fullName.trim());
		if (result.success) {
			router.replace("/login");
		}
	};

	return (
		<ThemedView className="flex-1 bg-black">
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				className="flex-1">
				<ScrollView
					className="flex-1"
					contentContainerClassName="flex-grow"
					keyboardShouldPersistTaps="handled">
					<View className="flex-1 px-6 justify-center py-8">
						{/* Header */}
						<View className="mb-8">
							<ThemedText className="text-4xl font-bold text-white mb-2">Create Account</ThemedText>
							<ThemedText className="text-base text-gray-400">Sign up to get started</ThemedText>
						</View>

						{/* Form */}
						<View className="gap-4 mb-6">
							{/* Full Name Input */}
							<View>
								<ThemedText className="text-sm text-gray-300 mb-2">Full Name</ThemedText>
								<TextInput
									className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base"
									placeholderTextColor="#6B7280"
									placeholder="Enter your full name"
									value={fullName}
									onChangeText={setFullName}
									autoCapitalize="words"
									autoCorrect={false}
									editable={!isLoading}
								/>
							</View>

							{/* Email Input */}
							<View>
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

							{/* Password Input */}
							<View>
								<ThemedText className="text-sm text-gray-300 mb-2">Password</ThemedText>
								<View className="relative">
									<TextInput
										className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base pr-12"
										placeholderTextColor="#6B7280"
										placeholder="Enter your password"
										value={password}
										onChangeText={setPassword}
										secureTextEntry={!showPassword}
										autoCapitalize="none"
										autoCorrect={false}
										editable={!isLoading}
									/>
									<Pressable
										onPress={() => setShowPassword(!showPassword)}
										className="absolute right-4 top-3.5">
										<ThemedText className="text-blue-500 text-sm font-medium">
											{showPassword ? "Hide" : "Show"}
										</ThemedText>
									</Pressable>
								</View>
								<ThemedText className="text-xs text-gray-500 mt-1">
									Must be at least 6 characters
								</ThemedText>
							</View>

							{/* Confirm Password Input */}
							<View>
								<ThemedText className="text-sm text-gray-300 mb-2">Confirm Password</ThemedText>
								<View className="relative">
									<TextInput
										className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-base pr-12"
										placeholderTextColor="#6B7280"
										placeholder="Confirm your password"
										value={confirmPassword}
										onChangeText={setConfirmPassword}
										secureTextEntry={!showConfirmPassword}
										autoCapitalize="none"
										autoCorrect={false}
										editable={!isLoading}
									/>
									<Pressable
										onPress={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-4 top-3.5">
										<ThemedText className="text-blue-500 text-sm font-medium">
											{showConfirmPassword ? "Hide" : "Show"}
										</ThemedText>
									</Pressable>
								</View>
							</View>
						</View>

						{/* Register Button */}
						<Pressable
							onPress={handleRegister}
							disabled={
								isLoading ||
								!fullName.trim() ||
								!email.trim() ||
								!password.trim() ||
								!confirmPassword.trim()
							}
							className={`bg-blue-600 rounded-xl py-4 items-center mb-4 ${
								isLoading ||
								!fullName.trim() ||
								!email.trim() ||
								!password.trim() ||
								!confirmPassword.trim()
									? "opacity-50"
									: "active:bg-blue-700"
							}`}>
							{isLoading ? (
								<ActivityIndicator color="white" />
							) : (
								<ThemedText className="text-white font-semibold text-base">
									Create Account
								</ThemedText>
							)}
						</Pressable>

						{/* Login Link */}
						<View className="flex-row items-center justify-center gap-1">
							<ThemedText className="text-gray-400 text-sm">Already have an account?</ThemedText>
							<Link href="/login" asChild>
								<Pressable disabled={isLoading}>
									<ThemedText className="text-blue-500 text-sm font-semibold">Sign In</ThemedText>
								</Pressable>
							</Link>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ThemedView>
	);
}
