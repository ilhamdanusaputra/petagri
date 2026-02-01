import { Image } from "expo-image";
import { StyleSheet } from "react-native";

import DashboardCards from "@/components/dashboard-cards";
import { HelloWave } from "@/components/hello-wave";
import { MenuGrid } from "@/components/menu-grid";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("roles")
          .eq("id", user.id)
          .single();
        setProfile(data || {});
      }
      setLoadingProfile(false);
    };
    fetchProfile();
  }, [user]);

  const allowedRoles = [
    "owner_platform",
    "developer",
    "admin_platform",
    "pemilik_kebun",
    "konsultan",
  ];

  const menuItems = [
    {
      key: "core",
      label: "CORE",
      icon: "house.fill",
      onPress: () => router.push("/menus/core"),
    },
    profile &&
      allowedRoles.includes(profile?.roles) && {
        key: "konsultasi",
        label: "KONSULTASI & KEBUN",
        icon: "leaf.fill",
        onPress: () => router.push("/menus/konsultasi"),
      },
    profile &&
      ["owner_platform", "developer", "admin_platform", "mitra_toko"].includes(
        profile?.roles,
      ) && {
        key: "produk",
        label: "PRODUK & TOKO",
        icon: "bag.fill",
        onPress: () => router.push("/menus/produk-mitra"),
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
  ].filter(Boolean);

  if (loadingProfile) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{
          light: Colors.light.tint,
          dark: Colors.dark.tint,
        }}
        headerImage={
          <Image
            source={require("@/assets/images/partial-react-logo.png")}
            style={styles.reactLogo}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Welcome!</ThemedText>
          <HelloWave />
        </ThemedView>
        <ThemedView style={{ marginTop: 12, marginBottom: 12 }}>
          <ThemedText>Memuat data...</ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: Colors.light.tint,
        dark: Colors.dark.tint,
      }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={{ marginTop: 12, marginBottom: 12 }}>
        <MenuGrid items={menuItems} />
      </ThemedView>
      <ThemedView style={{ marginTop: 8, marginBottom: 12 }}>
        <ThemedText type="subtitle">Perhatian</ThemedText>
        <DashboardCards />
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
