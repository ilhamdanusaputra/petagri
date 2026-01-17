import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import { MenuGrid } from "@/components/menu-grid";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link, useRouter } from "expo-router";

export default function HomeScreen() {
	const router = useRouter();

	const menuItems = [
		{ key: "core", label: "CORE", icon: "house.fill", onPress: () => router.push("/menus/core") },
		{
			key: "konsultasi",
			label: "KONSULTASI & KEBUN",
			icon: "leaf.fill",
			onPress: () => router.push("/menus/konsultasi"),
		},
		{
			key: "produk",
			label: "PRODUK & TOKO",
			icon: "bag.fill",
			onPress: () => router.push("/menus/produk"),
		},
		{
			key: "tender",
			label: "TENDER & PENAWARAN",
			icon: "gavel",
			onPress: () => router.push("/menus/tender"),
		},
		{
			key: "penjualan",
			label: "PENJUALAN",
			icon: "cart.fill",
			onPress: () => router.push("/menus/penjualan"),
		},
		{
			key: "distribusi",
			label: "DISTRIBUSI & LOGISTIK",
			icon: "truck",
			onPress: () => router.push("/menus/distribusi"),
		},
		{
			key: "gudang",
			label: "GUDANG & STOK",
			icon: "archivebox.fill",
			onPress: () => router.push("/menus/gudang"),
		},
		// last tile is a catch-all "Semua Menu"
		{
			key: "all",
			label: "SEMUA MENU",
			icon: "chevron.right",
			onPress: () => router.push("/menus"),
		},
	];

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
			headerImage={
				<Image
					source={require("@/assets/images/partial-react-logo.png")}
					style={styles.reactLogo}
				/>
			}>
			<ThemedView style={styles.titleContainer}>
				<ThemedText type="title">Welcome!</ThemedText>
				<HelloWave />
			</ThemedView>

			<ThemedView style={{ marginTop: 12, marginBottom: 12 }}>
				<MenuGrid items={menuItems} />
			</ThemedView>
			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">Step 1: Try it</ThemedText>
				<ThemedText>
					Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
					Press{" "}
					<ThemedText type="defaultSemiBold">
						{Platform.select({
							ios: "cmd + d",
							android: "cmd + m",
							web: "F12",
						})}
					</ThemedText>{" "}
					to open developer tools.
				</ThemedText>
			</ThemedView>
			<ThemedView style={styles.stepContainer}>
				<Link href="/modal">
					<Link.Trigger>
						<ThemedText type="subtitle">Step 2: Explore</ThemedText>
					</Link.Trigger>
					<Link.Preview />
					<Link.Menu>
						<Link.MenuAction title="Action" icon="cube" onPress={() => alert("Action pressed")} />
						<Link.MenuAction
							title="Share"
							icon="square.and.arrow.up"
							onPress={() => alert("Share pressed")}
						/>
						<Link.Menu title="More" icon="ellipsis">
							<Link.MenuAction
								title="Delete"
								icon="trash"
								destructive
								onPress={() => alert("Delete pressed")}
							/>
						</Link.Menu>
					</Link.Menu>
				</Link>

				<ThemedText>
					{`Tap the Explore tab to learn more about what's included in this starter app.`}
				</ThemedText>
			</ThemedView>
			<ThemedView style={styles.stepContainer}>
				<ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
				<ThemedText>
					{`When you're ready, run `}
					<ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{" "}
					<ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{" "}
					<ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
					<ThemedText type="defaultSemiBold">app-example</ThemedText>.
				</ThemedText>
			</ThemedView>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	reactLogo: {
		height: 178,
		width: 290,
		bottom: 0,
		left: 0,
		position: "absolute",
	},
});
