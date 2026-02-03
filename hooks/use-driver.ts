import { supabase } from "@/utils/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

type VehicleType = "car" | "motorcycle" | "truck" | "van";

export type Driver = {
	id: string;
	full_name: string;
	phone: string;
	name: string;
	email?: string;
	driver_code?: string;
	status?: "active" | "nonactive";
	vehicle_plate_number?: string;
	vehicle_type?: VehicleType | null;
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
			const { data, error } = await supabase.from("drivers").select("*");
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
		driver_code?: string;
		status?: "active" | "nonactive";
		vehicle_plate_number?: string;
		vehicle_type?: "motorcycle" | "car" | "van" | "truck";
	}) => {
		try {
			// Create user via edge function
			const { data: result, error } = await supabase.functions.invoke("create-supir", {
				body: {
					email: data.email,
					password: data.password,
					full_name: data.full_name,
					phone: data.phone,
				},
			});

			if (error) {
				return { success: false, error: error.message };
			}

			// Get the created user ID from the result
			// Parse result if it's a string
			const parsedResult = typeof result === "string" ? JSON.parse(result) : result;
			const userId = parsedResult?.user_id;
			if (!userId) {
				return {
					success: false,
					error: `User ID tidak ditemukan. Response: ${JSON.stringify(result)}`,
				};
			}

			// Insert into drivers table
			const { error: driverError } = await supabase.from("drivers").insert({
				id: userId,
				name: data.full_name,
				phone: data.phone,
				driver_code: data.driver_code,
				status: data.status || "active",
				vehicle_plate_number: data.vehicle_plate_number,
				vehicle_type: data.vehicle_type,
			});

			if (driverError) {
				return { success: false, error: driverError.message };
			}

			await fetchDrivers(); // refresh list setelah create
			return { success: true };
		} catch (err: any) {
			return { success: false, error: err.message || "Gagal menambahkan supir" };
		}
	};

	// Update driver
	const updateDriver = async (
		id: string,
		updates: {
			full_name?: string;
			phone?: string;
			driver_code?: string;
			name?: string;
			status?: "active" | "nonactive";
			vehicle_plate_number?: string;
			vehicle_type?: "motorcycle" | "car" | "van" | "truck";
		},
	) => {
		try {
			// Update profiles table
			const profileUpdates: { full_name?: string; phone?: string } = {};
			if (updates.name !== undefined) profileUpdates.full_name = updates.name;
			if (updates.phone !== undefined) profileUpdates.phone = updates.phone;

			if (Object.keys(profileUpdates).length > 0) {
				const { error: updateError } = await supabase
					.from("profiles")
					.update(profileUpdates)
					.eq("id", id);
				if (updateError) throw updateError;
			}

			// Update drivers table
			const driverUpdates: {
				driver_code?: string;
				status?: "active" | "nonactive";
				vehicle_plate_number?: string;
				vehicle_type?: "motorcycle" | "car" | "van" | "truck";
				name?: string;
				phone?: string;
			} = {};
			if (updates.driver_code !== undefined) driverUpdates.driver_code = updates.driver_code;
			if (updates.status) driverUpdates.status = updates.status;
			if (updates.vehicle_plate_number !== undefined)
				driverUpdates.vehicle_plate_number = updates.vehicle_plate_number;
			if (updates.vehicle_type) driverUpdates.vehicle_type = updates.vehicle_type;
			if (updates.name !== undefined) driverUpdates.name = updates.name;
			if (updates.phone !== undefined) driverUpdates.phone = updates.phone;
			if (Object.keys(driverUpdates).length > 0) {
				const { error: driverError } = await supabase
					.from("drivers")
					.update(driverUpdates)
					.eq("id", id);
				if (driverError) throw driverError;
			}

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
