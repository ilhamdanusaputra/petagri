// Types for Mitra (Partner) entity
export interface Mitra {
	id: string;
	company_name: string;
	contact_person: string;
	email: string;
	phone: string;
	address?: string;
	business_type?: string;
	description?: string;
	website?: string;
	status: "active" | "inactive" | "pending";
	created_at: string;
	updated_at: string;
	created_by?: string;
	updated_by?: string;
}

export interface MitraFormData {
	companyName: string;
	contactPerson: string;
	email: string;
	phone: string;
	address: string;
	businessType: string;
	description: string;
	website: string;
}

export interface CreateMitraRequest {
	company_name: string;
	contact_person: string;
	email: string;
	phone: string;
	address?: string;
	business_type?: string;
	description?: string;
	website?: string;
}

export interface UpdateMitraRequest extends Partial<CreateMitraRequest> {
	id: string;
}

export interface MitraFilters {
	status?: "active" | "inactive" | "pending";
	business_type?: string;
	search?: string; // For searching by company name or contact person
}

export interface MitraListResponse {
	data: Mitra[];
	count: number;
	page?: number;
	limit?: number;
}
