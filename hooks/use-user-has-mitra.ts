import { useAuth } from "@/hooks/use-auth";
import { useMitraToko } from "@/hooks/use-mitra-toko";

/**
 * Hook untuk mengecek apakah user login punya mitra di tabel mitra_toko
 * Return: { hasMitra: boolean, loading: boolean }
 */
export function useUserHasMitra() {
	const { user, isLoading: authLoading } = useAuth();
	const { mitraList, loading: mitraLoading } = useMitraToko();

	// Cek apakah ada mitra dengan user_id = user.id
	const hasMitra = !!user && mitraList.some((m) => m.user_id === user.id);

	return {
		hasMitra,
		loading: authLoading || mitraLoading,
	};
}
