// ================================================
// Service: Contract
// Description: Service for managing contract operations with Supabase
// ================================================

import {
	Contract,
	ContractFilterForm,
	ContractFormData,
	ContractSummary,
	ContractWithMitra,
} from "@/types/contract";
import { supabase } from "@/utils/supabase";

export class ContractService {
	/**
	 * Get all contracts with mitra information
	 */
	static async getContracts(filters?: Partial<ContractFilterForm>): Promise<ContractWithMitra[]> {
		try {
			let query = supabase
				.from("contracts")
				.select(
					`
					*,
					mitra:mitra_id (
						id,
						company_name,
						contact_person,
						email,
						phone,
						business_type
					)
				`,
				)
				.order("created_at", { ascending: false });

			// Apply filters
			if (filters?.status && filters.status !== "all") {
				query = query.eq("status", filters.status);
			}

			if (filters?.contract_type && filters.contract_type !== "all") {
				query = query.eq("contract_type", filters.contract_type);
			}

			// Date range filters
			if (filters?.date_range) {
				const now = new Date();
				switch (filters.date_range) {
					case "current":
						query = query
							.lte("start_date", now.toISOString().split("T")[0])
							.gte("end_date", now.toISOString().split("T")[0]);
						break;
					case "upcoming":
						query = query.gt("start_date", now.toISOString().split("T")[0]);
						break;
					case "expired":
						query = query.lt("end_date", now.toISOString().split("T")[0]);
						break;
				}
			}

			const { data, error } = await query;

			if (error) {
				throw error;
			}

			// Apply search filter on client side (for complex text search)
			let contracts = data || [];
			if (filters?.searchQuery) {
				const searchLower = filters.searchQuery.toLowerCase();
				contracts = contracts.filter(
					(contract) =>
						contract.contract_number.toLowerCase().includes(searchLower) ||
						contract.title.toLowerCase().includes(searchLower) ||
						contract.contract_type.toLowerCase().includes(searchLower) ||
						(contract.mitra as any)?.company_name.toLowerCase().includes(searchLower),
				);
			}

			return contracts as ContractWithMitra[];
		} catch (error) {
			console.error("Error fetching contracts:", error);
			throw error;
		}
	}

	/**
	 * Get contract summary statistics
	 */
	static async getContractSummary(): Promise<ContractSummary> {
		try {
			const { data: contracts, error } = await supabase
				.from("contracts")
				.select("status, value, end_date");

			if (error) {
				throw error;
			}

			const now = new Date();
			const thirtyDaysFromNow = new Date();
			thirtyDaysFromNow.setDate(now.getDate() + 30);

			const summary = contracts?.reduce(
				(acc, contract) => {
					acc.total_contracts++;
					acc.total_value += contract.value || 0;

					switch (contract.status) {
						case "active":
							acc.active_contracts++;
							acc.active_value += contract.value || 0;
							break;
						case "pending":
							acc.pending_contracts++;
							break;
						case "expired":
							acc.expired_contracts++;
							break;
						case "draft":
							acc.draft_contracts++;
							break;
						case "cancelled":
							acc.cancelled_contracts++;
							break;
					}

					// Check if expiring soon (next 30 days)
					const endDate = new Date(contract.end_date);
					if (contract.status === "active" && endDate >= now && endDate <= thirtyDaysFromNow) {
						acc.expiring_soon++;
					}

					return acc;
				},
				{
					total_contracts: 0,
					active_contracts: 0,
					pending_contracts: 0,
					expired_contracts: 0,
					draft_contracts: 0,
					cancelled_contracts: 0,
					total_value: 0,
					active_value: 0,
					expiring_soon: 0,
				},
			) || {
				total_contracts: 0,
				active_contracts: 0,
				pending_contracts: 0,
				expired_contracts: 0,
				draft_contracts: 0,
				cancelled_contracts: 0,
				total_value: 0,
				active_value: 0,
				expiring_soon: 0,
			};

			return summary;
		} catch (error) {
			console.error("Error fetching contract summary:", error);
			throw error;
		}
	}

	/**
	 * Create a new contract
	 */
	static async createContract(contractData: ContractFormData): Promise<Contract> {
		try {
			// Generate contract number
			const contractNumber = await this.generateContractNumber();

			const newContract = {
				...contractData,
				contract_number: contractNumber,
				value: parseFloat(contractData.value) || 0,
				status: "draft" as const,
				created_by: "system", // In real app, this should be the current user
			};

			const { data, error } = await supabase
				.from("contracts")
				.insert([newContract])
				.select()
				.single();

			if (error) {
				throw error;
			}

			return data as Contract;
		} catch (error) {
			console.error("Error creating contract:", error);
			throw error;
		}
	}

	/**
	 * Update contract status
	 */
	static async updateContractStatus(contractId: string, status: Contract["status"]): Promise<void> {
		try {
			const updateData: any = {
				status,
				updated_at: new Date().toISOString(),
				updated_by: "system",
			};

			// If activating contract, set company signature
			if (status === "active") {
				updateData.signed_by_company = "System Admin";
				updateData.signed_date_company = new Date().toISOString().split("T")[0];
			}

			const { error } = await supabase.from("contracts").update(updateData).eq("id", contractId);

			if (error) {
				throw error;
			}
		} catch (error) {
			console.error("Error updating contract status:", error);
			throw error;
		}
	}

	/**
	 * Delete a contract
	 */
	static async deleteContract(contractId: string): Promise<void> {
		try {
			const { error } = await supabase.from("contracts").delete().eq("id", contractId);

			if (error) {
				throw error;
			}
		} catch (error) {
			console.error("Error deleting contract:", error);
			throw error;
		}
	}

	/**
	 * Get contract by ID with mitra info
	 */
	static async getContractById(contractId: string): Promise<ContractWithMitra | null> {
		try {
			const { data, error } = await supabase
				.from("contracts")
				.select(
					`
					*,
					mitra:mitra_id (
						id,
						company_name,
						contact_person,
						email,
						phone,
						business_type
					)
				`,
				)
				.eq("id", contractId)
				.single();

			if (error) {
				throw error;
			}

			return data as ContractWithMitra;
		} catch (error) {
			console.error("Error fetching contract by ID:", error);
			throw error;
		}
	}

	/**
	 * Generate unique contract number
	 */
	private static async generateContractNumber(): Promise<string> {
		try {
			const year = new Date().getFullYear();
			const prefix = `CTR-${year}`;

			// Get the latest contract number for this year
			const { data, error } = await supabase
				.from("contracts")
				.select("contract_number")
				.like("contract_number", `${prefix}%`)
				.order("contract_number", { ascending: false })
				.limit(1);

			if (error) {
				throw error;
			}

			let nextNumber = 1;
			if (data && data.length > 0) {
				const lastNumber = data[0].contract_number.split("-").pop();
				nextNumber = parseInt(lastNumber || "0", 10) + 1;
			}

			return `${prefix}-${nextNumber.toString().padStart(3, "0")}`;
		} catch (error) {
			console.error("Error generating contract number:", error);
			return `CTR-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
		}
	}

	/**
	 * Get available mitra for contract creation
	 */
	static async getAvailableMitra() {
		try {
			const { data, error } = await supabase
				.from("mitra")
				.select("id, company_name, contact_person, business_type")
				.eq("status", "active")
				.order("company_name");

			if (error) {
				throw error;
			}

			return data || [];
		} catch (error) {
			console.error("Error fetching available mitra:", error);
			throw error;
		}
	}
}
