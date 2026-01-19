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

export type RoleName =
	| "developer"
	| "owner_platform"
	| "admin_platform"
	| "konsultan"
	| "mitra_toko"
	| "pemilik_kebun"
	| "supir";
