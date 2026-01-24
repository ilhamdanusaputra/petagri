import { supabase } from "@/utils/supabase";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

// List of public routes
const PUBLIC_ROUTES = ["/login", "/register"];

export default function AuthMiddleware({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const segments = useSegments();

	useEffect(() => {
		const checkAuth = async () => {
			const { data } = await supabase.auth.getSession();
			const isLoggedIn = !!data.session;
			const currentRoute = "/" + segments.join("/");
			const isPublic = PUBLIC_ROUTES.includes(currentRoute);
			if (!isLoggedIn && !isPublic) {
				router.replace("/login");
			}
			if (isLoggedIn && isPublic) {
				router.replace("/");
			}
		};
		checkAuth();
	}, [router, segments]);

	return children;
}
