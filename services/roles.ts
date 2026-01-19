import { supabase } from "@/utils/supabase";

export interface Role {
	id: string;
	name: string;
	display_name: string;
	description?: string;
	permissions: Record<string, string[]>;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface UserRole {
	id: string;
	user_id: string;
	role_id: string;
	assigned_at: string;
	assigned_by?: string;
	role?: Role;
}

// Role names as constants
export const ROLES = {
	DEVELOPER: "developer",
	OWNER_PLATFORM: "owner_platform",
	ADMIN_PLATFORM: "admin_platform",
	KONSULTAN: "konsultan",
	MITRA_TOKO: "mitra_toko",
	PEMILIK_KEBUN: "pemilik_kebun",
	SUPIR: "supir",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/**
 * Get all active roles
 */
export async function getRoles(): Promise<Role[]> {
	const { data, error } = await supabase
		.from("roles")
		.select("*")
		.eq("is_active", true)
		.order("display_name");

	if (error) {
		console.error("Error fetching roles:", error);
		throw error;
	}

	return data;
}

/**
 * Get role by name
 */
export async function getRoleByName(name: RoleName): Promise<Role | null> {
	const { data, error } = await supabase.from("roles").select("*").eq("name", name).single();

	if (error) {
		console.error("Error fetching role:", error);
		return null;
	}

	return data;
}

/**
 * Get user roles (roles assigned to a user)
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
	const { data, error } = await supabase
		.from("user_roles")
		.select(
			`
      *,
      role:roles(*)
    `,
		)
		.eq("user_id", userId);

	if (error) {
		console.error("Error fetching user roles:", error);
		throw error;
	}

	return data;
}

/**
 * Check if user has a specific role
 */
export async function userHasRole(userId: string, roleName: RoleName): Promise<boolean> {
	const { data, error } = await supabase
		.from("user_roles")
		.select("id, role:roles(name)")
		.eq("user_id", userId)
		.eq("roles.name", roleName)
		.single();

	if (error) {
		return false;
	}

	return !!data;
}

/**
 * Check if user has any of the specified roles
 */
export async function userHasAnyRole(userId: string, roleNames: RoleName[]): Promise<boolean> {
	const { data, error } = await supabase
		.from("user_roles")
		.select("id, role:roles(name)")
		.eq("user_id", userId)
		.in("roles.name", roleNames);

	if (error) {
		return false;
	}

	return data && data.length > 0;
}

/**
 * Check if user has permission
 */
export async function userHasPermission(
	userId: string,
	resource: string,
	action: string,
): Promise<boolean> {
	const userRoles = await getUserRoles(userId);

	for (const userRole of userRoles) {
		if (userRole.role && userRole.role.permissions) {
			const resourcePermissions = userRole.role.permissions[resource];
			if (resourcePermissions && resourcePermissions.includes(action)) {
				return true;
			}
		}
	}

	return false;
}

/**
 * Assign role to user (admin only)
 */
export async function assignRole(userId: string, roleId: string): Promise<void> {
	const { error } = await supabase.from("user_roles").insert({
		user_id: userId,
		role_id: roleId,
	});

	if (error) {
		console.error("Error assigning role:", error);
		throw error;
	}
}

/**
 * Remove role from user (admin only)
 */
export async function removeRole(userId: string, roleId: string): Promise<void> {
	const { error } = await supabase
		.from("user_roles")
		.delete()
		.eq("user_id", userId)
		.eq("role_id", roleId);

	if (error) {
		console.error("Error removing role:", error);
		throw error;
	}
}

/**
 * Get all users with a specific role
 */
export async function getUsersByRole(roleName: RoleName): Promise<string[]> {
	const { data, error } = await supabase
		.from("user_roles")
		.select("user_id, role:roles(name)")
		.eq("roles.name", roleName);

	if (error) {
		console.error("Error fetching users by role:", error);
		return [];
	}

	return data.map((ur) => ur.user_id);
}
