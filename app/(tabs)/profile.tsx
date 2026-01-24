import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

export default function ProfileScreen() {
	const { user, isLoading, logout, isLoggedIn } = useAuth();
	const [profile, setProfile] = useState<any>(null);
	const [loadingProfile, setLoadingProfile] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			if (user) {
				const { data } = await supabase
					.from("profiles")
					.select("full_name, phone, roles")
					.eq("id", user.id)
					.single();
				setProfile(data || {});
			}
			setLoadingProfile(false);
		};
		fetchProfile();
	}, [user]);

	const handleLogout = () => {
		logout();
	};

	const bgColor = useThemeColor({ light: "#F9FAFB", dark: "#111827" }, "background");
	const cardBg = useThemeColor({}, "card");
	const borderColor = useThemeColor({ light: "#E5E7EB", dark: "#374151" }, "cardBorder");
	const primaryGreen = useThemeColor({ light: "#1B5E20", dark: "#81C784" }, "tint");
	const textColor = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
	const mutedColor = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");
	const dangerColor = useThemeColor({ light: "#EF4444", dark: "#EF4444" }, "danger");

	if (isLoading || loadingProfile) {
		return (
			<ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
				<ActivityIndicator size="large" color={primaryGreen} />
			</ThemedView>
		);
	}

	return (
		<ThemedView style={[styles.container, { backgroundColor: bgColor }]}>
			<ThemedText type="title" style={[styles.title, { color: primaryGreen }]}>
				Profil Pengguna
			</ThemedText>

			{isLoggedIn && user ? (
				<ThemedView style={[styles.profileCard, { backgroundColor: cardBg, borderColor }]}>
					<ThemedText type="subtitle" style={{ color: textColor, marginBottom: 16 }}>
						Informasi Akun
					</ThemedText>

					<ThemedView style={styles.infoRow}>
						<ThemedText style={[styles.infoLabel, { color: mutedColor }]}>Email</ThemedText>
						<ThemedText style={[styles.infoValue, { color: textColor }]}>
							{user.email || "belum diatur"}
						</ThemedText>
					</ThemedView>

					<ThemedView style={styles.infoRow}>
						<ThemedText style={[styles.infoLabel, { color: mutedColor }]}>Nama Lengkap</ThemedText>
						<ThemedText style={[styles.infoValue, { color: textColor }]}>
							{profile?.full_name || "belum diatur"}
						</ThemedText>
					</ThemedView>

					<ThemedView style={styles.infoRow}>
						<ThemedText style={[styles.infoLabel, { color: mutedColor }]}>No. HP</ThemedText>
						<ThemedText style={[styles.infoValue, { color: textColor }]}>
							{profile?.phone || "belum diatur"}
						</ThemedText>
					</ThemedView>

					<ThemedView style={styles.infoRow}>
						<ThemedText style={[styles.infoLabel, { color: mutedColor }]}>Role</ThemedText>
						<ThemedText style={[styles.infoValue, { color: textColor }]}>
							{profile?.roles || "belum diatur"}
						</ThemedText>
					</ThemedView>

					<Pressable
						style={[styles.logoutButton, { backgroundColor: dangerColor, marginTop: 24 }]}
						onPress={handleLogout}>
						<ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
					</Pressable>
				</ThemedView>
			) : (
				<ThemedView style={[styles.profileCard, { backgroundColor: cardBg, borderColor }]}>
					<ThemedText style={{ color: textColor, textAlign: "center" }}>
						Anda belum login
					</ThemedText>
				</ThemedView>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		justifyContent: "center",
	},
	title: {
		marginBottom: 24,
		textAlign: "center",
	},
	profileCard: {
		padding: 24,
		borderRadius: 12,
		borderWidth: 1,
	},
	infoRow: {
		marginBottom: 16,
	},
	infoLabel: {
		fontSize: 13,
		fontWeight: "600",
		marginBottom: 4,
	},
	infoValue: {
		fontSize: 15,
	},
	logoutButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignItems: "center",
	},
	logoutButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
});
