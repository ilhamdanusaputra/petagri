import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

const isBrowser = typeof window !== "undefined";

const webStorage = {
	getItem: (key: string) => {
		if (!isBrowser) return Promise.resolve(null);
		return Promise.resolve(localStorage.getItem(key));
	},
	setItem: (key: string, value: string) => {
		if (!isBrowser) return Promise.resolve();
		localStorage.setItem(key, value);
		return Promise.resolve();
	},
	removeItem: (key: string) => {
		if (!isBrowser) return Promise.resolve();
		localStorage.removeItem(key);
		return Promise.resolve();
	},
};

const storage = Platform.OS === "web" ? webStorage : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		storage,
		persistSession: true,
		autoRefreshToken: true,
	},
});
