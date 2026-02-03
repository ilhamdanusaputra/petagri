import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useState } from "react";

export type MitraToko = {
	id: string;
	name: string;
	owner_name: string;
	address: string;
	city: string;
	province: string;
	status: string;
	user_id: string;
	email?: string;
	phone?: string;
	handphone?: string;
};

export function useMitraToko() {
	const { user } = useAuth();
	const [mitraList, setMitraList] = useState<MitraToko[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchMitra = useCallback(async () => {
		setLoading(true);
		setError(null);
		// Ambil role user dari tabel profiles
		let userRole = null;
		if (user?.id) {
			const { data: profileData } = await supabase
				.from("profiles")
				.select("roles")
				.eq("id", user.id)
				.single();
			userRole = profileData?.roles;
		}
		let data, error;
		if (["owner_platform", "admin_platform", "developer"].includes(userRole)) {
			// Bisa lihat semua mitra
			({ data, error } = await supabase.from("mitra_toko").select("*"));
		} else {
			// Hanya mitra milik user
			({ data, error } = await supabase
				.from("mitra_toko")
				.select("*")
				.eq("user_id", user?.id || ""));
		}
		if (error) setError(error.message);
		setMitraList((data as MitraToko[]) || []);
		setLoading(false);
	}, [user]);

	const addMitra = async (form: {
		email: string;
		password: string;
		handphone?: string;
		name: string;
		owner_name: string;
		address: string;
		city: string;
		province: string;
		status: string;
	}) => {
		// 1. Buat user via edge function
		const { data, error } = await supabase.functions.invoke("create-mitra", {
			body: {
				email: form.email,
				password: form.password,
				full_name: form.name,
			},
		});
		if (error) {
			return { success: false, error: error.message };
		}
		// Parse response jika berupa string JSON
		const responseData = typeof data === "string" ? JSON.parse(data) : data;
		const userId = responseData?.user_id;
		if (!userId) {
			return {
				success: false,
				error: `User ID tidak ditemukan. Response: ${JSON.stringify(responseData)}`,
			};
		}
		// 2. Insert ke mitra_toko
		const { error: insertError } = await supabase.from("mitra_toko").insert({
			name: form.name,
			owner_name: form.owner_name,
			address: form.address,
			city: form.city,
			province: form.province,
			status: form.status,
			user_id: userId,
			handphone: form.handphone,
		});
		if (insertError) {
			return { success: false, error: insertError.message };
		}
		await fetchMitra();
		return { success: true };
	};

	const updateMitra = async (id: string, updates: Partial<MitraToko>) => {
		const { error } = await supabase.from("mitra_toko").update(updates).eq("id", id);
		if (error) return { success: false, error: error.message };
		await fetchMitra();
		return { success: true };
	};

	const deleteMitra = async (id: string) => {
		const { error } = await supabase.from("mitra_toko").delete().eq("id", id);
		if (error) return { success: false, error: error.message };
		await fetchMitra();
		return { success: true };
	};

	useEffect(() => {
		if (user) fetchMitra();
	}, [user, fetchMitra]);

	return {
		mitraList,
		loading,
		error,
		fetchMitra,
		addMitra,
		updateMitra,
		deleteMitra,
	};
}
