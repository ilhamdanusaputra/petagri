// ================================================
// Types: Contract
// Description: TypeScript types for contract management
// ================================================

export interface Contract {
	id: string;
	mitra_id: string;
	contract_number: string;
	contract_type: string;
	title: string;
	description?: string;
	start_date: string;
	end_date: string;
	value: number;
	status: "draft" | "pending" | "active" | "expired" | "cancelled" | "suspended";
	terms_conditions?: string;
	payment_terms?: string;
	delivery_terms?: string;
	penalties?: string;
	renewal_options?: string;
	contract_file_url?: string;
	signed_file_url?: string;
	signed_by_mitra?: string;
	signed_date_mitra?: string;
	signed_by_company?: string;
	signed_date_company?: string;
	created_at: string;
	updated_at: string;
	created_by?: string;
	updated_by?: string;
}

export interface ContractWithMitra extends Contract {
	mitra: {
		id: string;
		company_name: string;
		contact_person: string;
		email: string;
		phone: string;
		business_type?: string;
	};
}

export interface ContractFormData {
	mitra_id: string;
	contract_type: string;
	title: string;
	description?: string;
	start_date: string;
	end_date: string;
	value: string;
	terms_conditions?: string;
	payment_terms?: string;
	delivery_terms?: string;
	penalties?: string;
	renewal_options?: string;
}

export interface ContractSummary {
	total_contracts: number;
	active_contracts: number;
	pending_contracts: number;
	expired_contracts: number;
	draft_contracts: number;
	cancelled_contracts: number;
	total_value: number;
	active_value: number;
	expiring_soon: number; // expiring in next 30 days
}

export interface ContractFilterForm {
	searchQuery: string;
	status: "all" | "draft" | "pending" | "active" | "expired" | "cancelled" | "suspended";
	contract_type: string;
	date_range: "all" | "current" | "upcoming" | "expired";
}

export const CONTRACT_TYPES = [
	"Distribusi Eksklusif",
	"Supply Agreement",
	"Retail Partnership",
	"Technology License",
	"Joint Venture",
	"Franchise Agreement",
	"Consulting Agreement",
	"Service Agreement",
	"Marketing Partnership",
	"Research Collaboration",
] as const;

export const CONTRACT_STATUSES = [
	{ value: "draft", label: "Draft", color: "bg-gray-600" },
	{ value: "pending", label: "Pending", color: "bg-yellow-600" },
	{ value: "active", label: "Active", color: "bg-green-600" },
	{ value: "expired", label: "Expired", color: "bg-red-600" },
	{ value: "cancelled", label: "Cancelled", color: "bg-red-800" },
	{ value: "suspended", label: "Suspended", color: "bg-orange-600" },
] as const;
