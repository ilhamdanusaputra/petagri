import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const tint = useThemeColor({}, "tint");
	const text = useThemeColor({}, "text");
	const inputBg = useThemeColor({}, "background");
	const border = useThemeColor({}, "cardBorder");
	const placeholderColor = useThemeColor({ light: "#9CA3AF", dark: "#6B7280" }, "icon");

	const handleLogin = async () => {
		setError(null);
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		setLoading(false);
		if (error) {
			setError(error.message);
		} else {
			router.replace("/");
		}
	};

	return (
		<ThemedView style={styles.container}>
			<View style={styles.form}>
				<ThemedText type="title" style={{ marginBottom: 24 }}>
					Masuk
				</ThemedText>
				<TextInput
					style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
					placeholder="Email"
					placeholderTextColor={placeholderColor}
					autoCapitalize="none"
					keyboardType="email-address"
					value={email}
					onChangeText={setEmail}
				/>
				<TextInput
					style={[styles.input, { backgroundColor: inputBg, color: text, borderColor: border }]}
					placeholder="Password"
					placeholderTextColor={placeholderColor}
					secureTextEntry
					value={password}
					onChangeText={setPassword}
				/>
				{error && <ThemedText style={{ color: "#EF4444", marginTop: 8 }}>{error}</ThemedText>}
				<Pressable
					style={[styles.button, { backgroundColor: tint, marginTop: 24 }]}
					onPress={handleLogin}
					disabled={loading}>
					{loading ? (
						<ActivityIndicator color="#fff" />
					) : (
						<ThemedText style={{ color: "#fff", fontWeight: "600" }}>Masuk</ThemedText>
					)}
				</Pressable>
				<Pressable style={{ marginTop: 16 }} onPress={() => router.replace("/register")}>
					<ThemedText style={{ color: tint, textAlign: "center" }}>
						Belum punya akun? Daftar
					</ThemedText>
				</Pressable>
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", alignItems: "center" },
	form: { width: "100%", maxWidth: 340, padding: 24 },
	input: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 16,
		marginBottom: 16,
	},
	button: {
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
	},
});
