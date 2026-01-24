import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";

export type Konsultan = {
	id: string;
	email: string;
	full_name: string | null;
	phone: string | null;
	roles: string | null;
};

export function useKonsultan() {
	const [konsultans, setKonsultans] = useState<Konsultan[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchKonsultans = async () => {
		setLoading(true);
		setError(null);
		try {
			const { data, error } = await supabase.from("profiles").select("*").eq("roles", "konsultan");
			if (error) throw error;
			setKonsultans((data as Konsultan[]) || []);
		} catch (err: any) {
			setError(err.message || "Gagal memuat data konsultan");
		} finally {
			setLoading(false);
		}
	};

	const getKonsultanById = async (id: string) => {
		try {
			const { data, error: fetchError } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", id)
				.single();

			if (fetchError) throw fetchError;

			return { success: true, data: data as Konsultan };
		} catch (err: any) {
			return { success: false, error: err.message || "Gagal memuat data konsultan" };
		}
	};

	const updateKonsultan = async (id: string, updates: { full_name?: string; phone?: string }) => {
		try {
			const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", id);

			if (updateError) throw updateError;

			// Refresh list
			await fetchKonsultans();

			return { success: true };
		} catch (err: any) {
			return { success: false, error: err.message || "Gagal memperbarui konsultan" };
		}
	};

	const createKonsultan = async (data: {
		email: string;
		password: string;
		full_name: string;
		phone?: string;
	}) => {
		try {
			// Create new user with auth
			const { data: authData, error: signUpError } = await supabase.auth.signUp({
				email: data.email,
				password: data.password,
				options: {
					data: {
						full_name: data.full_name,
						phone: data.phone || null,
					},
				},
			});

			if (signUpError) throw signUpError;
			if (!authData.user) throw new Error("Gagal membuat user");

			// Update profile with konsultan role
			const { error: updateError } = await supabase
				.from("profiles")
				.update({ roles: "konsultan" })
				.eq("id", authData.user.id);

			if (updateError) throw updateError;

			// Refresh list
			await fetchKonsultans();

			return { success: true };
		} catch (err: any) {
			return { success: false, error: err.message || "Gagal menambahkan konsultan" };
		}
	};

	useEffect(() => {
		fetchKonsultans();
	}, []);

	return {
		konsultans,
		loading,
		error,
		fetchKonsultans,
		getKonsultanById,
		updateKonsultan,
		createKonsultan,
	};
}
