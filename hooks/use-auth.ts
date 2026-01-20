import { supabase } from "@/utils/supabase";
import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
// Removed Alert usage for error/info
export interface AuthUser extends User {
	email: string;
}

export function useAuth() {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);
	const [userRole, setUserRole] = useState<string | null>(null);

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(async ({ data: { session } }) => {
			setSession(session);
			setUser(session?.user as AuthUser | null);
			if (session?.user) {
				await loadUserRole(session.user.id);
			}
			setIsLoading(false);
			setIsInitialized(true);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			setSession(session);
			setUser(session?.user as AuthUser | null);
			if (session?.user) {
				await loadUserRole(session.user.id);
			} else {
				setUserRole(null);
			}
			setIsLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	const loadUserRole = async (userId: string) => {
		try {
			const { data, error } = await supabase
				.from("user_roles")
				.select("roles(name)")
				.eq("user_id", userId)
				.single();
			if (error) {
				console.error("LOAD ROLE ERROR:", error.message);
				setUserRole(null);
			} else {
				// roles is an object with name property, not an array
				const roleName = (data?.roles as any)?.name ?? null;
				setUserRole(roleName);
			}
		} catch (err) {
			console.error("LOAD ROLE EXCEPTION:", err);
			setUserRole(null);
		}
	};

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
				console.error("Sign Up Error:", error.message);
				return { success: false, error };
			}

			if (data.user) {
				console.info("Account created! Please check your email to verify your account.");
				return { success: true, user: data.user };
			}

			return { success: false };
		} catch (error: any) {
			console.error("Sign Up Error:", error.message || "An unexpected error occurred");
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
				console.error("Sign In Error:", error.message);
				return { success: false, error };
			}

			if (data.user) {
				return { success: true, user: data.user };
			}

			return { success: false };
		} catch (error: any) {
			console.error("Sign In Error:", error.message || "An unexpected error occurred");
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
				console.error("Sign Out Error:", error.message);
				return { success: false, error };
			}

			return { success: true };
		} catch (error: any) {
			console.error("Sign Out Error:", error.message || "An unexpected error occurred");
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
				console.error("Reset Password Error:", error.message);
				return { success: false, error };
			}

			console.log("Password reset link sent successfully");
			return { success: true };
		} catch (error: any) {
			console.error("Reset Password Error:", error.message || "An unexpected error occurred");
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
				console.error("Update Profile Error:", error.message);
				return { success: false, error };
			}

			console.log("Profile updated successfully");
			return { success: true };
		} catch (error: any) {
			console.error("Update Profile Error:", error.message || "An unexpected error occurred");
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
		userRole: userRole,
		signUp,
		signIn,
		signOut,
		resetPassword,
		updateProfile,
	};
}
