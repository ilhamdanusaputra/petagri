import { supabase } from "@/utils/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export type Driver = {
	id: string;
	full_name: string;
	phone: string;
	email?: string;
	created_at?: string;
};

export function useDriver() {
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch drivers
	const fetchDrivers = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const { data, error } = await supabase.from("profiles").select("*").eq("roles", "supir");
			if (error) setError(error.message);
			setDrivers((data as Driver[]) || []);
		} catch (err: any) {
			setError(err.message || "Gagal memuat data drivers/supir");
		} finally {
			setLoading(false);
		}
	}, []);

	// Create driver
	const addDriver = async (data: {
		email: string;
		password: string;
		full_name: string;
		phone?: string;
	}) => {
		try {
			const { data: result, error } = await supabase.functions.invoke("create-supir", {
				body: data,
			});

			if (error) {
				return { success: false, error: error.message };
			}

			await fetchDrivers(); // refresh list setelah create
			return { success: true };
		} catch (err: any) {
			return { success: false, error: err.message || "Gagal menambahkan supir" };
		}
	};

	// Update driver
	const updateDriver = async (id: string, updates: { full_name?: string; phone?: string }) => {
		try {
			const { error: updateError } = await supabase.from("profiles").update(updates).eq("id", id);
			if (updateError) throw updateError;
			// Refresh list
			await fetchDrivers();
			return { success: true };
		} catch (err: any) {
			return { success: false, error: err.message || "Gagal memperbarui driver/supir" };
		}
	};

	useEffect(() => {
		fetchDrivers();
	}, [fetchDrivers]);

	useFocusEffect(
		useCallback(() => {
			fetchDrivers();
		}, [fetchDrivers]),
	);

	return {
		drivers,
		loading,
		error,
		fetchDrivers,
		addDriver,
		updateDriver,
	};
}
