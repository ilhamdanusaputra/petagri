import { useAuth } from "@/hooks/use-auth";
import { getUserRoles, userHasPermission, userHasRole } from "@/services/roles";
import type { RoleName, UserRole } from "@/types/role";
import { useEffect, useState } from "react";

export function useRole() {
	const { user } = useAuth();
	const [roles, setRoles] = useState<UserRole[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchRoles() {
			if (!user?.id) {
				setRoles([]);
				setIsLoading(false);
				return;
			}

			try {
				const userRoles = await getUserRoles(user.id);
				setRoles(userRoles);
			} catch (error) {
				console.error("Error fetching user roles:", error);
				setRoles([]);
			} finally {
				setIsLoading(false);
			}
		}

		fetchRoles();
	}, [user?.id]);

	const hasRole = async (roleName: RoleName): Promise<boolean> => {
		if (!user?.id) return false;
		return userHasRole(user.id, roleName);
	};

	const hasPermission = async (resource: string, action: string): Promise<boolean> => {
		if (!user?.id) return false;
		return userHasPermission(user.id, resource, action);
	};

	const isAdmin = roles.some(
		(ur) =>
			ur.role?.name === "developer" ||
			ur.role?.name === "owner_platform" ||
			ur.role?.name === "admin_platform",
	);

	const isKonsultan = roles.some((ur) => ur.role?.name === "konsultan");
	const isMitraToko = roles.some((ur) => ur.role?.name === "mitra_toko");
	const isPemilikKebun = roles.some((ur) => ur.role?.name === "pemilik_kebun");
	const isSupir = roles.some((ur) => ur.role?.name === "supir");

	return {
		roles,
		isLoading,
		hasRole,
		hasPermission,
		isAdmin,
		isKonsultan,
		isMitraToko,
		isPemilikKebun,
		isSupir,
	};
}
