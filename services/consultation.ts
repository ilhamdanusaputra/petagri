// ================================================
// Service: Consultation Management
// Description: Service functions for managing consultations, farms, and consultants
// Author: System
// Created: 2026-01-18
// ================================================

import type {
	Consultant,
	ConsultantWithStats,
	ConsultationDashboardSummary,
	ConsultationVisit,
	ConsultationVisitWithDetails,
	CreateConsultantForm,
	CreateFarmForm,
	CreateVisitForm,
	Farm,
	FarmWithLastConsultation,
	UpcomingVisit,
	UpdateVisitOutcomeForm,
} from "@/types/consultation";
import { supabase } from "@/utils/supabase";

// ================================================
// Consultant Management
// ================================================

export async function getConsultants(
	includeStats = false,
): Promise<ConsultantWithStats[] | Consultant[]> {
	try {
		let query = supabase.from("consultants").select("*").eq("status", "active").order("full_name");

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching consultants:", error);
			throw error;
		}

		if (!includeStats) {
			return data || [];
		}

		// Fetch additional stats for each consultant
		const consultantsWithStats = await Promise.all(
			(data || []).map(async (consultant) => {
				const { data: visits } = await supabase
					.from("consultation_visits")
					.select("*")
					.eq("consultant_id", consultant.id);

				const upcomingVisits =
					visits?.filter(
						(v) => v.visit_status === "scheduled" && new Date(v.scheduled_date) >= new Date(),
					) || [];

				const completedVisits = visits?.filter((v) => v.visit_status === "completed") || [];
				const avgRating =
					completedVisits.reduce((sum, v) => sum + (v.visit_rating || 0), 0) /
					(completedVisits.length || 1);

				return {
					...consultant,
					upcoming_visits_count: upcomingVisits.length,
					completed_visits_count: completedVisits.length,
					average_rating: avgRating,
				};
			}),
		);

		return consultantsWithStats;
	} catch (error) {
		console.error("Error in getConsultants:", error);
		throw error;
	}
}

export async function createConsultant(formData: CreateConsultantForm): Promise<Consultant> {
	try {
		const { data, error } = await supabase.from("consultants").insert([formData]).select().single();

		if (error) {
			console.error("Error creating consultant:", error);
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error in createConsultant:", error);
		throw error;
	}
}

// ================================================
// Farm Management
// ================================================

export async function getFarms(
	includeLastConsultation = false,
): Promise<FarmWithLastConsultation[] | Farm[]> {
	try {
		const { data, error } = await supabase
			.from("farms")
			.select("*")
			.eq("farm_status", "active")
			.order("farm_name");

		if (error) {
			console.error("Error fetching farms:", error);
			throw error;
		}

		if (!includeLastConsultation) {
			return data || [];
		}

		// Fetch last consultation for each farm
		const farmsWithLastConsultation = await Promise.all(
			(data || []).map(async (farm) => {
				const { data: lastVisit } = await supabase
					.from("consultation_visits")
					.select("*")
					.eq("farm_id", farm.id)
					.eq("visit_status", "completed")
					.order("scheduled_date", { ascending: false })
					.limit(1)
					.single();

				return {
					...farm,
					last_visit: lastVisit || undefined,
				};
			}),
		);

		return farmsWithLastConsultation;
	} catch (error) {
		console.error("Error in getFarms:", error);
		throw error;
	}
}

export async function createFarm(formData: CreateFarmForm): Promise<Farm> {
	try {
		const { data, error } = await supabase.from("farms").insert([formData]).select().single();

		if (error) {
			console.error("Error creating farm:", error);
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error in createFarm:", error);
		throw error;
	}
}

// ================================================
// Consultation Visit Management
// ================================================

export async function getConsultationVisits(
	status?: string,
	farmId?: string,
	consultantId?: string,
): Promise<ConsultationVisitWithDetails[]> {
	try {
		let query = supabase
			.from("consultation_visits")
			.select(
				`
        *,
        farm:farms(*),
        consultant:consultants(*)
      `,
			)
			.order("scheduled_date", { ascending: true });

		if (status) {
			query = query.eq("visit_status", status);
		}

		if (farmId) {
			query = query.eq("farm_id", farmId);
		}

		if (consultantId) {
			query = query.eq("consultant_id", consultantId);
		}

		const { data, error } = await query;

		if (error) {
			console.error("Error fetching consultation visits:", error);
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error("Error in getConsultationVisits:", error);
		throw error;
	}
}

export async function createConsultationVisit(
	formData: CreateVisitForm,
): Promise<ConsultationVisit> {
	try {
		const { data, error } = await supabase
			.from("consultation_visits")
			.insert([formData])
			.select()
			.single();

		if (error) {
			console.error("Error creating consultation visit:", error);
			throw error;
		}

		return data;
	} catch (error) {
		console.error("Error in createConsultationVisit:", error);
		throw error;
	}
}

export async function updateVisitStatus(visitId: string, status: string): Promise<void> {
	try {
		const updateData: any = { visit_status: status };

		if (status === "in_progress") {
			updateData.actual_start_time = new Date().toISOString();
		} else if (status === "completed") {
			updateData.actual_end_time = new Date().toISOString();
		}

		const { error } = await supabase
			.from("consultation_visits")
			.update(updateData)
			.eq("id", visitId);

		if (error) {
			console.error("Error updating visit status:", error);
			throw error;
		}
	} catch (error) {
		console.error("Error in updateVisitStatus:", error);
		throw error;
	}
}

export async function updateVisitOutcome(
	visitId: string,
	outcome: UpdateVisitOutcomeForm,
): Promise<void> {
	try {
		const { error } = await supabase
			.from("consultation_visits")
			.update({
				...outcome,
				visit_status: "completed",
				actual_end_time: new Date().toISOString(),
			})
			.eq("id", visitId);

		if (error) {
			console.error("Error updating visit outcome:", error);
			throw error;
		}
	} catch (error) {
		console.error("Error in updateVisitOutcome:", error);
		throw error;
	}
}

// ================================================
// Dashboard and Analytics
// ================================================

export async function getConsultationDashboardSummary(): Promise<ConsultationDashboardSummary> {
	try {
		// Get farm statistics
		const { data: farmStats } = await supabase.from("farms").select("farm_status, health_score");

		const totalFarms = farmStats?.length || 0;
		const activeFarms = farmStats?.filter((f) => f.farm_status === "active").length || 0;
		const avgHealthScore = farmStats
			? farmStats.reduce((sum, f) => sum + f.health_score, 0) / (totalFarms || 1)
			: 0;
		const { data: consultantStats } = await supabase
			.from("consultants")
			.select("status, availability_status");

		const totalConsultants = consultantStats?.length || 0;
		const availableConsultants =
			consultantStats?.filter((c) => c.status === "active" && c.availability_status === "available")
				.length || 0;

		// Get visit statistics
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

		const { data: todayVisits } = await supabase
			.from("consultation_visits")
			.select("id")
			.eq("visit_status", "scheduled")
			.gte("scheduled_date", today.toISOString())
			.lt("scheduled_date", tomorrow.toISOString());

		const { data: monthlyVisits } = await supabase
			.from("consultation_visits")
			.select("id")
			.eq("visit_status", "completed")
			.gte("scheduled_date", thisMonth.toISOString())
			.lt("scheduled_date", nextMonth.toISOString());

		const { data: pendingFollowUps } = await supabase
			.from("consultation_visits")
			.select("id")
			.eq("follow_up_required", true)
			.eq("visit_status", "completed")
			.is("follow_up_date", null);

		return {
			total_farms: totalFarms,
			active_farms: activeFarms,
			total_consultants: totalConsultants,
			available_consultants: availableConsultants,
			scheduled_visits_today: todayVisits?.length || 0,
			completed_visits_this_month: monthlyVisits?.length || 0,
			pending_follow_ups: pendingFollowUps?.length || 0,
			average_farm_health_score: avgHealthScore,
		};
	} catch (error) {
		console.error("Error in getConsultationDashboardSummary:", error);
		throw error;
	}
}

export async function getUpcomingVisits(limit = 10): Promise<UpcomingVisit[]> {
	try {
		const { data, error } = await supabase
			.from("consultation_visits")
			.select(
				`
        id,
        scheduled_date,
        visit_type,
        visit_status,
        farm:farms(farm_name),
        consultant:consultants(full_name)
      `,
			)
			.in("visit_status", ["scheduled", "in_progress"])
			.gte("scheduled_date", new Date().toISOString())
			.order("scheduled_date", { ascending: true })
			.limit(limit);

		if (error) {
			console.error("Error fetching upcoming visits:", error);
			throw error;
		}

		return (data || []).map((visit) => ({
			id: visit.id,
			farm_name: (visit.farm as any)?.farm_name || "Unknown Farm",
			consultant_name: (visit.consultant as any)?.full_name || "Unknown Consultant",
			scheduled_date: visit.scheduled_date,
			visit_type: visit.visit_type,
			status: visit.visit_status,
		}));
	} catch (error) {
		console.error("Error in getUpcomingVisits:", error);
		throw error;
	}
}
