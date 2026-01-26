import { supabase } from "@/utils/supabase";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export type Product = {
	id: string;
	mitra_id: string;
	name: string;
	brand?: string;
	category?: string;
	description?: string;
	dosage?: string;
	unit: string;
	base_price: number;
	note?: string;
	created_at?: string;
	updated_at?: string;
};

export function useProduk() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [products, setProducts] = useState<Product[]>([]);

	// Fetch products
	const fetchProducts = useCallback(async () => {
		setLoading(true);
		setError(null);
		const { data, error } = await supabase.from("products").select("*");
		if (error) setError(error.message);
		setProducts((data as Product[]) || []);
		setLoading(false);
	}, []);

	// Create product
	const createProduct = useCallback(
		async (form: {
			name: string;
			brand?: string;
			category?: string;
			description?: string;
			dosage?: string;
			unit: string;
			base_price: string | number;
			note?: string;
			mitra_id: string;
		}) => {
			setLoading(true);
			setError(null);
			// Pastikan field wajib
			if (!form.name || !form.unit || !form.base_price || !form.mitra_id) {
				setLoading(false);
				return { success: false, error: "Field wajib tidak lengkap" };
			}
			// Insert ke tabel products
			const { error } = await supabase.from("products").insert({
				name: form.name,
				brand: form.brand,
				category: form.category,
				description: form.description,
				dosage: form.dosage,
				unit: form.unit,
				base_price: Number(form.base_price),
				note: form.note,
				mitra_id: form.mitra_id,
			});
			setLoading(false);
			if (error) return { success: false, error: error.message };
			await fetchProducts();
			return { success: true };
		},
		[fetchProducts],
	);

	// Update product
	const updateProduct = useCallback(
		async (product: Product) => {
			setLoading(true);
			setError(null);
			const { id, ...fields } = product;
			const { data, error } = await supabase.from("products").update(fields).eq("id", id).select();
			setLoading(false);
			if (error) return { success: false, error: error.message };
			await fetchProducts();
			return { data, error };
		},
		[fetchProducts],
	);

	// Delete product
	const deleteProduct = useCallback(
		async (id: string) => {
			setLoading(true);
			setError(null);
			const { error } = await supabase.from("products").delete().eq("id", id);
			setLoading(false);
			if (error) return { success: false, error: error.message };
			await fetchProducts();
			return { error };
		},
		[fetchProducts],
	);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	useFocusEffect(
		useCallback(() => {
			fetchProducts();
		}, [fetchProducts]),
	);

	return {
		products,
		fetchProducts,
		createProduct,
		updateProduct,
		deleteProduct,
		loading,
		error,
	};
}
