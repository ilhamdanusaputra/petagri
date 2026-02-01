import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const ALLOWED_ROLES = ["owner_platform", "developer", "admin_platform", "mitra_toko"];

export default function TenderRoleMiddleware({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	useEffect(() => {
		const checkRole = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				router.replace("/login");
				return;
			}
			const { data: profile, error } = await supabase
				.from("profiles")
				.select("roles")
				.eq("id", session.user.id)
				.single();
			if (error || !profile || !ALLOWED_ROLES.includes(profile.roles)) {
				router.replace("/");
			}
		};
		checkRole();
	}, [router]);

	return children;
}
