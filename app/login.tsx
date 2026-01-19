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

export default function LoginScreen() {
	const router = useRouter();
	const { signIn, isLoading } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleLogin = async () => {
		if (!email.trim() || !password.trim()) {
			return;
		}

		const result = await signIn(email.trim(), password);
		if (result.success) {
			router.replace("/(tabs)");
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
					<View className="flex-1 px-6 justify-center">
						{/* Header */}
						<View className="mb-8">
							<ThemedText className="text-4xl font-bold text-white mb-2">Welcome Back</ThemedText>
							<ThemedText className="text-base text-gray-400">
								Sign in to your account to continue
							</ThemedText>
						</View>

						{/* Form */}
						<View className="gap-4 mb-6">
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
							</View>

							{/* Forgot Password */}
							<Link href="/forgot-password" asChild>
								<Pressable disabled={isLoading}>
									<ThemedText className="text-blue-500 text-sm font-medium text-right">
										Forgot Password?
									</ThemedText>
								</Pressable>
							</Link>
						</View>

						{/* Login Button */}
						<Pressable
							onPress={handleLogin}
							disabled={isLoading || !email.trim() || !password.trim()}
							className={`bg-blue-600 rounded-xl py-4 items-center mb-4 ${
								isLoading || !email.trim() || !password.trim() ? "opacity-50" : "active:bg-blue-700"
							}`}>
							{isLoading ? (
								<ActivityIndicator color="white" />
							) : (
								<ThemedText className="text-white font-semibold text-base">Sign In</ThemedText>
							)}
						</Pressable>

						{/* Register Link */}
						<View className="flex-row items-center justify-center gap-1">
							<ThemedText className="text-gray-400 text-sm">Don&apos;t have an account?</ThemedText>
							<Link href="/register" asChild>
								<Pressable disabled={isLoading}>
									<ThemedText className="text-blue-500 text-sm font-semibold">Sign Up</ThemedText>
								</Pressable>
							</Link>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ThemedView>
	);
}
