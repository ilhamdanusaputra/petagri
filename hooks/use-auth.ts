import { supabase } from "@/utils/supabase";
import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export interface AuthUser extends User {
	email: string;
}

export function useAuth() {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session?.user as AuthUser | null);
			setIsLoading(false);
			setIsInitialized(true);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session?.user as AuthUser | null);
			setIsLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	const signUp = async (email: string, password: string, fullName?: string) => {
		try {
			setIsLoading(true);
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: fullName,
					},
				},
			});

			if (error) {
				Alert.alert("Sign Up Error", error.message);
				return { success: false, error };
			}

			if (data.user) {
				Alert.alert("Success", "Account created! Please check your email to verify your account.");
				return { success: true, user: data.user };
			}

			return { success: false };
		} catch (error: any) {
			Alert.alert("Error", error.message || "An unexpected error occurred");
			return { success: false, error };
		} finally {
			setIsLoading(false);
		}
	};

	const signIn = async (email: string, password: string) => {
		try {
			setIsLoading(true);
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				Alert.alert("Sign In Error", error.message);
				return { success: false, error };
			}

			if (data.user) {
				return { success: true, user: data.user };
			}

			return { success: false };
		} catch (error: any) {
			Alert.alert("Error", error.message || "An unexpected error occurred");
			return { success: false, error };
		} finally {
			setIsLoading(false);
		}
	};

	const signOut = async () => {
		try {
			setIsLoading(true);
			const { error } = await supabase.auth.signOut();

			if (error) {
				Alert.alert("Sign Out Error", error.message);
				return { success: false, error };
			}

			return { success: true };
		} catch (error: any) {
			Alert.alert("Error", error.message || "An unexpected error occurred");
			return { success: false, error };
		} finally {
			setIsLoading(false);
		}
	};

	const resetPassword = async (email: string) => {
		try {
			setIsLoading(true);
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: "petagri://reset-password",
			});

			if (error) {
				Alert.alert("Reset Password Error", error.message);
				return { success: false, error };
			}

			console.log("Password reset link sent successfully");
			return { success: true };
		} catch (error: any) {
			Alert.alert("Error", error.message || "An unexpected error occurred");
			return { success: false, error };
		} finally {
			setIsLoading(false);
		}
	};

	const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
		try {
			setIsLoading(true);
			const { error } = await supabase.auth.updateUser({
				data: updates,
			});

			if (error) {
				Alert.alert("Update Profile Error", error.message);
				return { success: false, error };
			}

			console.log("Profile updated successfully");
			return { success: true };
		} catch (error: any) {
			Alert.alert("Error", error.message || "An unexpected error occurred");
			return { success: false, error };
		} finally {
			setIsLoading(false);
		}
	};

	return {
		user,
		session,
		isLoading,
		isInitialized,
		isAuthenticated: !!user,
		signUp,
		signIn,
		signOut,
		resetPassword,
		updateProfile,
	};
}
