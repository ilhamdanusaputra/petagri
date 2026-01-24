import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";

export type Kebun = {
	id: string;
	name: string;
	status: "Aktif" | "Nonaktif";
	location: string;
	commodity: string;
	area_ha: number;
	latitude?: number | null;
	longitude?: number | null;
	created_at?: string;
	updated_at?: string;
	user_id?: string;
};

export type KebunInput = {
	name: string;
	status: "Aktif" | "Nonaktif";
	location: string;
	commodity: string;
	area_ha: number;
	latitude?: number | null;
	longitude?: number | null;
};

export function useKebun() {
	const [kebuns, setKebuns] = useState<Kebun[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchKebuns = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("farms")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) throw error;
			setKebuns(data || []);
			setError(null);
		} catch (err: any) {
			setError(err.message);
			console.error("Error fetching kebuns:", err);
		} finally {
			setLoading(false);
		}
	};

	const createKebun = async (
		input: KebunInput,
	): Promise<{ success: boolean; error?: string; data?: Kebun }> => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				return { success: false, error: "User not authenticated" };
			}

			const { data, error } = await supabase
				.from("farms")
				.insert([
					{
						name: input.name,
						status: input.status,
						location: input.location,
						commodity: input.commodity,
						area_ha: input.area_ha,
						latitude: input.latitude,
						longitude: input.longitude,
						user_id: user.id,
					},
				])
				.select()
				.single();

			if (error) throw error;

			// Refresh list
			await fetchKebuns();

			return { success: true, data };
		} catch (err: any) {
			console.error("Error creating kebun:", err);
			return { success: false, error: err.message };
		}
	};

	const updateKebun = async (
		id: string,
		input: Partial<KebunInput>,
	): Promise<{ success: boolean; error?: string }> => {
		try {
			const { error } = await supabase.from("farms").update(input).eq("id", id);

			if (error) throw error;

			// Refresh list
			await fetchKebuns();

			return { success: true };
		} catch (err: any) {
			console.error("Error updating kebun:", err);
			return { success: false, error: err.message };
		}
	};

	const deleteKebun = async (id: string): Promise<{ success: boolean; error?: string }> => {
		try {
			const { error } = await supabase.from("farms").delete().eq("id", id);

			if (error) throw error;

			// Refresh list
			await fetchKebuns();

			return { success: true };
		} catch (err: any) {
			console.error("Error deleting kebun:", err);
			return { success: false, error: err.message };
		}
	};

	const getKebunById = async (
		id: string,
	): Promise<{ success: boolean; error?: string; data?: Kebun }> => {
		try {
			const { data, error } = await supabase.from("farms").select("*").eq("id", id).single();

			if (error) throw error;

			return { success: true, data };
		} catch (err: any) {
			console.error("Error fetching kebun:", err);
			return { success: false, error: err.message };
		}
	};

	useEffect(() => {
		fetchKebuns();
	}, []);

	return {
		kebuns,
		loading,
		error,
		fetchKebuns,
		createKebun,
		updateKebun,
		deleteKebun,
		getKebunById,
	};
}
