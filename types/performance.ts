// ================================================
// Types: Performance
// Description: TypeScript types for mitra performance tracking
// ================================================

export interface Order {
	id: string;
	mitra_id: string;
	order_number: string;
	total_amount: number;
	status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
	items_count: number;
	notes?: string;
	delivery_date?: string;
	created_at: string;
	updated_at: string;
	created_by?: string;
	updated_by?: string;
}

export interface MitraRating {
	id: string;
	mitra_id: string;
	order_id?: string;
	rating: number;
	review?: string;
	delivery_rating?: number;
	quality_rating?: number;
	service_rating?: number;
	created_at: string;
	updated_at: string;
	created_by?: string;
	updated_by?: string;
}

export interface PerformanceMetrics {
	total_revenue: number;
	total_orders: number;
	active_partners: number;
	average_rating: number;
	revenue_growth: number;
	orders_growth: number;
	partners_growth: number;
	rating_growth: number;
}

export interface TopMitraPerformance {
	id: string;
	company_name: string;
	contact_person: string;
	revenue: number;
	orders: number;
	growth: number;
	rating: number;
	last_order_date?: string;
}

export interface PerformancePeriod {
	period: "month" | "quarter" | "year";
	start_date: string;
	end_date: string;
}
