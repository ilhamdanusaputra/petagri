import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Href, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function DistribusiMenu() {
  const router = useRouter();
  const cardBg = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "cardBorder");
  const textColor = useThemeColor(
    { light: "#1F2937", dark: "#F3F4F6" },
    "text",
  );
  const iconTint = useThemeColor({}, "tint");

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">DISTRIBUSI & LOGISTIK</ThemedText>
      <ThemedText>Halaman distribusi, pengiriman, dan logistik.</ThemedText>

      <View style={{ height: 12 }} />

      <Pressable
        onPress={() => router.push("/menus/distribusi/driver" as Href)}
        style={[styles.card, { backgroundColor: cardBg, borderColor }]}
      >
        <View style={[styles.iconWrap, { backgroundColor: iconTint + "22" }]}>
          <IconSymbol name="car.fill" size={22} color={iconTint} />
        </View>
        <View style={styles.cardBody}>
          <ThemedText
            type="subtitle"
            style={[styles.cardTitle, { color: textColor }]}
          >
            Kelola Driver
          </ThemedText>
          <ThemedText style={[styles.cardDesc, { color: textColor }]}>
            Tambah, edit, dan nonaktifkan driver pengiriman. Pantau status
            driver dan riwayat pengiriman.
          </ThemedText>
        </View>
      </Pressable>

      <Pressable
        onPress={() => router.push("/menus/distribusi/pengiriman" as Href)}
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor, marginTop: 12 },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: iconTint + "22" }]}>
          <IconSymbol name="shippingbox.fill" size={22} color={iconTint} />
        </View>
        <View style={styles.cardBody}>
          <ThemedText
            type="subtitle"
            style={[styles.cardTitle, { color: textColor }]}
          >
            Kelola Pengiriman
          </ThemedText>
          <ThemedText style={[styles.cardDesc, { color: textColor }]}>
            Atur dan pantau distribusi barang, status pengiriman, dan detail
            logistik secara real-time.
          </ThemedText>
        </View>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  card: {
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    width: "100%",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
});
