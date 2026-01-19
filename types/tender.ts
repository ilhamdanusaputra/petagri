// ================================================
// Tender Types and Interfaces
// Description: TypeScript definitions for tender/bidding system
// ================================================

import type { Mitra } from "./mitra";
import type { Product } from "./product";

export type TenderStatus =
	| "draft"
	| "open"
	| "closed"
	| "locked"
	| "awarded"
	| "completed"
	| "cancelled";
export type BidStatus = "draft" | "submitted" | "withdrawn" | "accepted" | "rejected";

// ================================================
// Main Tender Interface
// ================================================

export interface Tender {
	id: string;
	title: string;
	description?: string;

	// References
	consultation_visit_id?: string;
	product_id: string;
	product?: Product;

	// Tender Details
	quantity: number;
	unit: string;
	estimated_price?: number;

	// Status and Dates
	status: TenderStatus;
	open_date?: string;
	close_date?: string;
	locked_at?: string;

	// Requirements
	requirements?: string[];
	terms_conditions?: string;
	delivery_location?: string;
	delivery_deadline?: string;

	// Winner Information
	winner_mitra_id?: string;
	winner_mitra?: Mitra;
	winning_bid_id?: string;
	winner_selected_at?: string;
	winner_selected_by?: string;

	// Metadata
	created_at: string;
	updated_at: string;
	created_by?: string;
}

// ================================================
// Tender Bid Interface
// ================================================

export interface TenderBid {
	id: string;
	tender_id: string;
	mitra_id?: string; // Optional - can be null for non-mitra users
	mitra?: Mitra;

	// Bid Details
	bid_price: number;
	quantity: number;
	unit: string;

	// Additional Information
	notes?: string;
	delivery_terms?: string;
	payment_terms?: string;
	proposed_delivery_date?: string;

	// Attachments
	documents?: any[];

	// Status
	status: BidStatus;
	submitted_at?: string;

	// Metadata
	created_at: string;
	updated_at: string;
}

// ================================================
// Tender Bid History Interface
// ================================================

export interface TenderBidHistory {
	id: string;
	tender_bid_id: string;
	tender_id: string;
	mitra_id?: string; // Optional - can be null for non-mitra users
	mitra?: Mitra;

	// Historical Data
	bid_price: number;
	quantity: number;
	notes?: string;

	// Change Tracking
	change_type: "created" | "updated" | "withdrawn" | "accepted" | "rejected";
	changed_at: string;
	changed_by?: string;
	change_reason?: string;

	// Previous and New Values
	previous_data?: any;
	new_data?: any;
}

// ================================================
// Extended Interfaces with Relations
// ================================================

export interface TenderWithDetails extends Tender {
	product: Product;
	winner_mitra?: Mitra;
	bids?: TenderBid[];
	bid_count?: number;
	lowest_bid?: number;
	highest_bid?: number;
}

export interface TenderBidWithDetails extends TenderBid {
	tender: Tender;
	mitra?: Mitra; // Optional since mitra_id can be null
	history?: TenderBidHistory[];
}

// ================================================
// Form Types for Creating/Updating
// ================================================

export interface CreateTenderForm {
	title: string;
	description?: string;
	consultation_visit_id?: string;
	product_id: string;
	quantity: number;
	unit: string;
	estimated_price?: number;
	requirements?: string[];
	terms_conditions?: string;
	delivery_location?: string;
	delivery_deadline?: string;
	open_date?: string;
	close_date?: string;
	status?: TenderStatus;
	created_by?: string;
}

export interface UpdateTenderForm {
	title?: string;
	description?: string;
	quantity?: number;
	unit?: string;
	estimated_price?: number;
	requirements?: string[];
	terms_conditions?: string;
	delivery_location?: string;
	delivery_deadline?: string;
	open_date?: string;
	close_date?: string;
	status?: TenderStatus;
	updated_by?: string;
}

export interface CreateBidForm {
	tender_id: string;
	mitra_id?: string; // Optional - for mitra partners only
	user_id?: string; // Optional - for non-mitra authenticated users
	bid_price: number;
	quantity: number;
	unit: string;
	notes?: string;
	delivery_terms?: string;
	payment_terms?: string;
	proposed_delivery_date?: string;
	documents?: any[];
}

export interface UpdateBidForm {
	bid_price?: number;
	quantity?: number;
	notes?: string;
	delivery_terms?: string;
	payment_terms?: string;
	proposed_delivery_date?: string;
	documents?: any[];
	status?: BidStatus;
}

export interface SelectWinnerForm {
	winner_mitra_id: string;
	winning_bid_id: string;
	reason?: string;
}

// ================================================
// Filter and Query Types
// ================================================

export interface TenderFilters {
	status?: TenderStatus[];
	product_id?: string;
	consultation_visit_id?: string;
	min_quantity?: number;
	max_quantity?: number;
	min_price?: number;
	max_price?: number;
	open_after?: string;
	close_before?: string;
	search?: string;
}

export interface BidFilters {
	tender_id?: string;
	mitra_id?: string;
	status?: BidStatus[];
	min_price?: number;
	max_price?: number;
	submitted_after?: string;
}

// ================================================
// Dashboard Summary Types
// ================================================

export interface TenderDashboardSummary {
	total_tenders: number;
	open_tenders: number;
	closed_tenders: number;
	locked_tenders: number;
	completed_tenders: number;
	total_bids: number;
	average_bids_per_tender: number;
	upcoming_close_deadlines: number;
}

export interface TenderStatistics {
	tender_id: string;
	tender_title: string;
	bid_count: number;
	lowest_bid: number;
	highest_bid: number;
	average_bid: number;
	participating_mitra: number;
	status: TenderStatus;
}
