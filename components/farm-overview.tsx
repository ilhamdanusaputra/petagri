import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export type FarmOverviewProps = {
  farm: {
    id: string;
    name: string;
    commodity?: string | null;
    area_ha?: number | null;
    location?: string | null;
    status?: string | null;
  };
  onPress?: (farmId: string) => void;
  navigateToDetail?: boolean;
};

export default function FarmOverview({
  farm,
  onPress,
  navigateToDetail = true,
}: FarmOverviewProps) {
  const router = useRouter();
  const cardBg = useThemeColor({}, "card");
  const border = useThemeColor({}, "cardBorder");
  const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");
  const tint = useThemeColor({}, "tint");

  const handlePress = () => {
    if (onPress) return onPress(farm.id);
    if (navigateToDetail) router.push(`/menus/konsultasi/kebun/${farm.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.container,
        { borderColor: border, backgroundColor: cardBg },
      ]}
    >
      <View style={styles.iconWrap}>
        <View style={[styles.iconCircle, { backgroundColor: tint }]}>
          <IconSymbol name="leaf.fill" size={18} color="#fff" />
        </View>
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <ThemedText style={styles.name}>{farm.name}</ThemedText>
        <ThemedText style={{ color: muted, fontSize: 13 }}>
          {farm.commodity || "-"}
        </ThemedText>
        <ThemedText style={{ color: muted, fontSize: 12, marginTop: 6 }}>
          {farm.location || "Lokasi tidak tersedia"} •{" "}
          {farm.area_ha ? `${farm.area_ha} ha` : "-"}
        </ThemedText>
      </View>

      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <IconSymbol name="chevron.right" size={20} color={muted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontWeight: "700",
    marginBottom: 4,
  },
  iconWrap: { width: 40, alignItems: "center" },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
