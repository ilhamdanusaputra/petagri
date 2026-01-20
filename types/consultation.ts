// ================================================
// Types: Consultation System
// Description: TypeScript types for consultation management system
// Author: System
// Created: 2026-01-18
// ================================================

export interface Consultant {
	id: string;
	full_name: string;
	email: string;
	phone: string;
	specialization: string;
	experience_years: number;
	certification: string[];
	bio?: string;
	service_areas: string[];
	availability_status: "available" | "busy" | "unavailable";
	rating: number;
	total_consultations: number;
	success_rate: number;
	status: "active" | "inactive" | "suspended";
	created_at: string;
	updated_at: string;
}

export interface Farm {
	id: string;
	farm_name: string;
	owner_name: string;
	contact_email: string;
	contact_phone: string;
	address: string;
	coordinates?: {
		lat: number;
		lng: number;
	};
	province?: string;
	city?: string;
	postal_code?: string;
	total_area: number;
	crop_types: string[];
	farming_method: "organic" | "conventional" | "hydroponic" | "mixed";
	established_year?: number;
	current_season?: string;
	irrigation_system?: string;
	soil_type?: string;
	climate_zone?: string;
	annual_production_capacity?: number;
	primary_market?: string;
	certification_status?: string;
	farm_status: "active" | "inactive" | "maintenance";
	health_score: number;
	last_consultation_date?: string;
	created_at: string;
	updated_at: string;
}

export interface ConsultationVisit {
	id: string;
	farm_id: string;
	consultant_id: string;
	scheduled_date: string;
	estimated_duration: number;
	visit_type: "regular" | "emergency" | "follow_up" | "initial";
	actual_start_time?: string;
	actual_end_time?: string;
	visit_status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled";
	consultation_notes?: string;
	problems_identified: string[];
	recommendations: string[];
	visit_rating?: number;
	farmer_feedback?: string;
	consultant_feedback?: string;
	follow_up_required: boolean;
	follow_up_date?: string;
	follow_up_notes?: string;
	photos: string[];
	documents: string[];
	consultation_fee: number;
	travel_cost: number;
	payment_status: "pending" | "paid" | "cancelled";
	created_at: string;
	updated_at: string;
	created_by: string;
}

// Extended types with relationships
export interface ConsultationVisitWithDetails extends ConsultationVisit {
	farm: Farm;
	consultant: Consultant;
}

export interface FarmWithLastConsultation extends Farm {
	last_visit?: ConsultationVisit;
}

export interface ConsultantWithStats extends Consultant {
	upcoming_visits_count: number;
	completed_visits_count: number;
	average_rating: number;
}

// Form types for creating/updating
export interface CreateConsultantForm {
	full_name: string;
	email: string;
	phone: string;
	specialization: string;
	experience_years: number;
	certification: string[];
	bio?: string;
	service_areas: string[];
}

export interface CreateFarmForm {
	farm_name: string;
	owner_name: string;
	contact_email: string;
	contact_phone: string;
	address: string;
	coordinates?: {
		lat: number;
		lng: number;
	};
	province?: string;
	city?: string;
	postal_code?: string;
	total_area: number;
	crop_types: string[];
	farming_method: "organic" | "conventional" | "hydroponic" | "mixed";
	established_year?: number;
	current_season?: string;
	irrigation_system?: string;
	soil_type?: string;
	climate_zone?: string;
}

export interface CreateVisitForm {
	farm_id: string;
	consultant_id: string;
	scheduled_date: string;
	estimated_duration: number;
	visit_type: "regular" | "emergency" | "follow_up" | "initial";
}

export interface UpdateVisitOutcomeForm {
	consultation_notes: string;
	problems_identified: string[];
	recommendations: string[];
	visit_rating?: number;
	farmer_feedback?: string;
	consultant_feedback?: string;
	follow_up_required: boolean;
	follow_up_date?: string;
	follow_up_notes?: string;
	photos: string[];
	documents: string[];
}

// Dashboard summary types
export interface ConsultationDashboardSummary {
	total_farms: number;
	active_farms: number;
	total_consultants: number;
	available_consultants: number;
	scheduled_visits_today: number;
	completed_visits_this_month: number;
	pending_follow_ups: number;
	average_farm_health_score: number;
}

export interface UpcomingVisit {
	id: string;
	farm_name: string;
	consultant_name: string;
	scheduled_date: string;
	visit_type: string;
	status: string;
}
