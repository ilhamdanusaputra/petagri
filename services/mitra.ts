import {
    CreateMitraRequest,
    Mitra,
    MitraFilters,
    MitraListResponse,
    UpdateMitraRequest,
} from "@/types/mitra";
import { supabase } from "@/utils/supabase";

export class MitraService {
	/**
	 * Create a new mitra/partner
	 */
	static async createMitra(data: CreateMitraRequest): Promise<Mitra> {
		const { data: result, error } = await supabase
			.from("mitra")
			.insert([
				{
					company_name: data.company_name,
					contact_person: data.contact_person,
					email: data.email,
					phone: data.phone,
					address: data.address,
					business_type: data.business_type,
					description: data.description,
					website: data.website,
				},
			])
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to create mitra: ${error.message}`);
		}

		return result;
	}

	/**
	 * Get all mitra with optional filters
	 */
	static async getMitraList(
		filters?: MitraFilters,
		page = 1,
		limit = 20,
	): Promise<MitraListResponse> {
		let query = supabase
			.from("mitra")
			.select("*", { count: "exact" })
			.order("created_at", { ascending: false });

		// Apply filters
		if (filters?.status) {
			query = query.eq("status", filters.status);
		}

		if (filters?.business_type) {
			query = query.eq("business_type", filters.business_type);
		}

		if (filters?.search) {
			query = query.or(
				`company_name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`,
			);
		}

		// Apply pagination
		const from = (page - 1) * limit;
		const to = from + limit - 1;
		query = query.range(from, to);

		const { data, error, count } = await query;

		if (error) {
			throw new Error(`Failed to fetch mitra list: ${error.message}`);
		}

		return {
			data: data || [],
			count: count || 0,
			page,
			limit,
		};
	}

	/**
	 * Get mitra by ID
	 */
	static async getMitraById(id: string): Promise<Mitra | null> {
		const { data, error } = await supabase.from("mitra").select("*").eq("id", id).single();

		if (error) {
			if (error.code === "PGRST116") {
				return null; // No rows found
			}
			throw new Error(`Failed to fetch mitra: ${error.message}`);
		}

		return data;
	}

	/**
	 * Update mitra by ID
	 */
	static async updateMitra(updateData: UpdateMitraRequest): Promise<Mitra> {
		const { id, ...data } = updateData;

		const { data: result, error } = await supabase
			.from("mitra")
			.update(data)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to update mitra: ${error.message}`);
		}

		return result;
	}

	/**
	 * Delete mitra by ID (soft delete by setting status to inactive)
	 */
	static async deleteMitra(id: string): Promise<boolean> {
		const { error } = await supabase.from("mitra").update({ status: "inactive" }).eq("id", id);

		if (error) {
			throw new Error(`Failed to delete mitra: ${error.message}`);
		}

		return true;
	}

	/**
	 * Permanently delete mitra by ID
	 */
	static async permanentlyDeleteMitra(id: string): Promise<boolean> {
		const { error } = await supabase.from("mitra").delete().eq("id", id);

		if (error) {
			throw new Error(`Failed to permanently delete mitra: ${error.message}`);
		}

		return true;
	}

	/**
	 * Check if email already exists
	 */
	static async checkEmailExists(email: string, excludeId?: string): Promise<boolean> {
		let query = supabase.from("mitra").select("id").eq("email", email);

		if (excludeId) {
			query = query.neq("id", excludeId);
		}

		const { data, error } = await query;

		if (error) {
			throw new Error(`Failed to check email: ${error.message}`);
		}

		return data && data.length > 0;
	}

	/**
	 * Get mitra statistics
	 */
	static async getMitraStats(): Promise<{
		total: number;
		active: number;
		inactive: number;
		pending: number;
	}> {
		const { data, error } = await supabase
			.from("mitra")
			.select("status")
			.not("status", "eq", "deleted");

		if (error) {
			throw new Error(`Failed to fetch mitra stats: ${error.message}`);
		}

		const stats = {
			total: data?.length || 0,
			active: data?.filter((m) => m.status === "active").length || 0,
			inactive: data?.filter((m) => m.status === "inactive").length || 0,
			pending: data?.filter((m) => m.status === "pending").length || 0,
		};

		return stats;
	}
}
