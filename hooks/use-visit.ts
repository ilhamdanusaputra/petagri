import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";

export type Visit = {
	id: string;
	farm_id: string;
	consultant_id: string;
	scheduled_date: string;
	status: "scheduled" | "completed" | "cancelled";
	created_at?: string;
	// Joined data
	farm_name?: string;
	consultant_name?: string;
};

export type VisitReport = {
	id: string;
	visit_id: string;
	plant_type: string;
	plant_age: string;
	land_area: number;
	problems: string;
	field_photo_url?: string | null;
	gps_latitude?: number | null;
	gps_longitude?: number | null;
	weather_notes?: string | null;
	created_at?: string;
};

export type VisitRecommendation = {
	id: string;
	visit_report_id: string;
	product_name: string;
	function: string;
	dosage: string;
	estimated_qty: string;
	urgency: "segera" | "terjadwal";
	alternative_products?: string | null;
	created_at?: string;
};

export type VisitDetail = Visit & {
	report?: VisitReport;
	recommendations?: VisitRecommendation[];
};

export function useVisit() {
	const [visits, setVisits] = useState<Visit[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchVisits = async () => {
		setLoading(true);
		setError(null);
		try {
			const { data, error } = await supabase
				.from("visits")
				.select(
					`
					*,
					farms (name),
					profiles (full_name)
				`,
				)
				.order("scheduled_date", { ascending: false });

			if (error) throw error;

			const mappedData = (data || []).map((v: any) => ({
				...v,
				farm_name: v.farms?.name || "N/A",
				consultant_name: v.profiles?.full_name || "N/A",
			}));

			setVisits(mappedData);
		} catch (err: any) {
			setError(err.message || "Gagal memuat data kunjungan");
		} finally {
			setLoading(false);
		}
	};

	const fetchVisitsByFarm = async (farmId: string) => {
		try {
			const { data, error } = await supabase
				.from("visits")
				.select(
					`
					*,
					farms (name),
					profiles (full_name)
				`,
				)
				.eq("farm_id", farmId)
				.order("scheduled_date", { ascending: false })
				.limit(5);

			if (error) throw error;

			const mappedData = (data || []).map((v: any) => ({
				...v,
				farm_name: v.farms?.name || "N/A",
				consultant_name: v.profiles?.full_name || "N/A",
			}));

			return { success: true, data: mappedData };
		} catch (err: any) {
			return { success: false, error: err.message || "Gagal memuat jadwal kunjungan" };
		}
	};

	const getVisitById = async (id: string) => {
		try {
			const { data, error } = await supabase
				.from("visits")
				.select(
					`
					*,
					farms (name),
					profiles (full_name)
				`,
				)
				.eq("id", id)
				.single();

			if (error) throw error;

			const visit: Visit = {
				...data,
				farm_name: data.farms?.name || "N/A",
				consultant_name: data.profiles?.full_name || "N/A",
			};

			// Get report
			const { data: reportData } = await supabase
				.from("visit_reports")
				.select("*")
				.eq("visit_id", id)
				.single();

			let recommendations: VisitRecommendation[] = [];
			if (reportData) {
				const { data: recData } = await supabase
					.from("visit_recommendations")
					.select("*")
					.eq("visit_report_id", reportData.id);
				recommendations = recData || [];
			}

			const detail: VisitDetail = {
				...visit,
				report: reportData || undefined,
				recommendations,
			};

			return { success: true, data: detail };
		} catch (err: any) {
			return { success: false, error: err.message || "Gagal memuat data kunjungan" };
		}
	};

	const createVisit = async (input: {
		farm_id: string;
		consultant_id: string;
		scheduled_date: string;
	}) => {
		try {
			const { data, error } = await supabase
				.from("visits")
				.insert([
					{
						...input,
						status: "scheduled",
					},
				])
				.select()
				.single();

			if (error) throw error;

			await fetchVisits();

			return { success: true, data };
		} catch (err: any) {
			return { success: false, error: err.message || "Gagal membuat jadwal kunjungan" };
		}
	};

	const updateVisitStatus = async (id: string, status: "scheduled" | "completed" | "cancelled") => {
		try {
			const { error } = await supabase.from("visits").update({ status }).eq("id", id);

			if (error) throw error;

			await fetchVisits();

			return { success: true };
		} catch (err: any) {
			return { success: false, error: err.message || "Gagal mengubah status" };
		}
	};

	const saveVisitReport = async (
		visit_id: string,
		report: Omit<VisitReport, "id" | "visit_id" | "created_at">,
	) => {
		try {
			// Check if report exists
			const { data: existing } = await supabase
				.from("visit_reports")
				.select("id")
				.eq("visit_id", visit_id)
				.single();

			let reportId: string;

			if (existing) {
				// Update
				const { error } = await supabase.from("visit_reports").update(report).eq("id", existing.id);
				if (error) throw error;
				reportId = existing.id;
			} else {
				// Insert
				const { data, error } = await supabase
					.from("visit_reports")
					.insert([{ visit_id, ...report }])
					.select()
					.single();
				if (error) throw error;
				reportId = data.id;
			}

			return { success: true, reportId };
		} catch (err: any) {
			return { success: false, error: err.message || "Gagal menyimpan laporan" };
		}
	};

	const saveRecommendations = async (
		visit_report_id: string,
		recommendations: Omit<VisitRecommendation, "id" | "visit_report_id" | "created_at">[],
	) => {
		try {
			// Delete old recommendations
			await supabase.from("visit_recommendations").delete().eq("visit_report_id", visit_report_id);

			// Insert new
			const { error } = await supabase
				.from("visit_recommendations")
				.insert(recommendations.map((r) => ({ visit_report_id, ...r })));

			if (error) throw error;

			return { success: true };
		} catch (err: any) {
			return { success: false, error: err.message || "Gagal menyimpan rekomendasi" };
		}
	};

	useEffect(() => {
		fetchVisits();
	}, []);

	return {
		visits,
		loading,
		error,
		fetchVisits,
		fetchVisitsByFarm,
		getVisitById,
		createVisit,
		updateVisitStatus,
		saveVisitReport,
		saveRecommendations,
	};
}
