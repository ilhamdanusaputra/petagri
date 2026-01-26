import { supabase } from "@/utils/supabase";
import { useState } from "react";

export type TenderAssign = {
  id: string;
  visit_id: string;
  assigned_by?: string;
  deadline?: string | null;
  status?: string;
  message?: string | null;
  created_at?: string;
};

export type TenderProductInput = {
  product_name: string;
  price?: number | null;
  qty?: number;
  dosage?: string | null;
  note?: string | null;
};

export function useTenderAssignment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("tender_assigns")
        .select(`*, visits (*, farms (name))`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return { success: true, data };
    } catch (err: any) {
      setError(err.message || "Gagal memuat penugasan");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from("tender_assigns").select("*").eq("id", id).single();
      if (error) throw error;

      const { data: products } = await supabase
        .from("tender_assign_products")
        .select("*")
        .eq("tender_assign_id", id);

      return { success: true, data: { ...data, products: products || [] } };
    } catch (err: any) {
      setError(err.message || "Gagal memuat penugasan");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (
    input: { visit_id: string; deadline?: string | null; assigned_by?: string | null; message?: string | null },
    products: TenderProductInput[] = [],
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure assigned_by is set (DB requires non-null)
      let assignedBy = input.assigned_by ?? null;
      if (!assignedBy) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          assignedBy = (userData as any)?.user?.id ?? null;
        } catch (e) {
          assignedBy = null;
        }
      }

      if (!assignedBy) {
        throw new Error("User not authenticated: cannot set 'assigned_by'");
      }

      const insertPayload = { ...input, assigned_by: assignedBy };

      const { data, error } = await supabase.from("tender_assigns").insert([insertPayload]).select();
      if (error) throw error;

      const created = Array.isArray(data) ? data[0] : data;
      if (!created) throw new Error("Failed to retrieve created tender_assign");

      const tenderAssignId = created.id;

      if (products && products.length > 0) {
        const rows = products
          .filter((p) => (p.product_name || "").toString().trim().length > 0)
          .map((p) => ({
            tender_assign_id: tenderAssignId,
            product_name: p.product_name,
            dosage: p.dosage ?? null,
            qty: p.qty ?? 1,
            price: p.price ?? null,
            note: p.note ?? null,
          }));

        if (rows.length > 0) {
          const { data: prodData, error: prodErr } = await supabase
            .from("tender_assign_products")
            .insert(rows)
            .select();
          if (prodErr) throw prodErr;
        }
      }

      return { success: true, data: created };
    } catch (err: any) {
      setError(err.message || "Gagal membuat penugasan");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateAssignment = async (id: string, patch: Partial<TenderAssign>, products?: TenderProductInput[]) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from("tender_assigns").update(patch).eq("id", id);
      if (error) throw error;

      if (products) {
        // replace products
        await supabase.from("tender_assign_products").delete().eq("tender_assign_id", id);
        if (products.length > 0) {
          const rows = products.map((p) => ({ tender_assign_id: id, ...p }));
          const { error: prodErr } = await supabase.from("tender_assign_products").insert(rows);
          if (prodErr) throw prodErr;
        }
      }

      return { success: true };
    } catch (err: any) {
      setError(err.message || "Gagal mengubah penugasan");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await supabase.from("tender_assign_products").delete().eq("tender_assign_id", id);
      const { error } = await supabase.from("tender_assigns").delete().eq("id", id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      setError(err.message || "Gagal menghapus penugasan");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    listAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  };
}
