import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export interface User {
	id: string;
	email: string;
	name: string;
}

export function useAuth() {
	const [user, setUser] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const getSession = async () => {
			const { data } = await supabase.auth.getSession();
			setUser(data.session?.user ?? null);
			setIsLoading(false);
		};
		getSession();

		const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			setIsLoading(false);
		});
		return () => {
			listener?.subscription.unsubscribe();
		};
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		setIsLoading(true);
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		setIsLoading(false);
		router.replace("/");
		if (error) throw error;
	}, []);

	const logout = useCallback(async () => {
		setIsLoading(true);
		await supabase.auth.signOut();
		setIsLoading(false);
		router.replace("/login");
	}, []);

	return {
		user,
		isLoggedIn: !!user,
		isLoading,
		login,
		logout,
	};
}
