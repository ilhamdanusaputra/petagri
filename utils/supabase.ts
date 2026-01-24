import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

// Use platform-specific storage
const storage =
	Platform.OS === "web"
		? typeof window !== "undefined"
			? window.localStorage
			: undefined
		: AsyncStorage;

export const supabase = createClient(
	process.env.EXPO_PUBLIC_SUPABASE_URL!,
	process.env.EXPO_PUBLIC_SUPABASE_KEY!,
	{
		auth: {
			storage: storage as any,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: Platform.OS === "web",
			lock: processLock,
		},
	},
);
