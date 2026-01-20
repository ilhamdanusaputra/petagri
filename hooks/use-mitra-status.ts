import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { useAuth } from "./use-auth";

interface MitraInfo {
	id: string;
	company_name: string;
	status: string;
	created_at: string;
}

export function useMitraStatus() {
	const { user, isAuthenticated } = useAuth();
	const [mitra, setMitra] = useState<MitraInfo | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const checkMitraStatus = async () => {
		if (!isAuthenticated || !user) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			// Check if user has a mitra registered (created_by policy)
			const { data, error: fetchError } = await supabase
				.from("mitra")
				.select("id, company_name, status, created_at")
				.eq("created_by", user.id)
				.single();

			if (fetchError) {
				// PGRST116 means no rows found (no mitra registered)
				if (fetchError.code === "PGRST116") {
					setMitra(null);
					setError(null);
				} else {
					console.error("Error fetching mitra:", fetchError);
					setError(fetchError.message);
				}
			} else {
				setMitra(data);
			}
		} catch (err) {
			console.error("Error in checkMitraStatus:", err);
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		checkMitraStatus();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, isAuthenticated]);

	const refreshMitraStatus = () => {
		checkMitraStatus();
	};

	return {
		mitra,
		hasMitra: !!mitra,
		isLoading,
		error,
		refreshMitraStatus,
		isActive: mitra?.status === "active",
		isPending: mitra?.status === "pending",
	};
}
