import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
	const { isAuthenticated, isInitialized } = useAuth();

	if (!isInitialized) {
		return (
			<View className="flex-1 bg-black items-center justify-center">
				<ActivityIndicator size="large" color="#3B82F6" />
			</View>
		);
	}

	if (isAuthenticated) {
		return <Redirect href="/(tabs)" />;
	}

	return <Redirect href="/login" />;
}
