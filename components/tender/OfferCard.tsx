import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  assign: any;
  offering?: any;
  onPress?: () => void;
};

export function OfferCard({ assign, offering, onPress }: Props) {
  const cardBg = useThemeColor({}, "card");
  const border = useThemeColor({}, "cardBorder");

  const dateStr = assign.created_at
    ? new Date(assign.created_at).toISOString().split("T")[0]
    : "-";
  const title = `Tender_${dateStr}`;
  const productNames = (assign.tender_assign_products || [])
    .map((p: any) => p.product_name)
    .filter(Boolean)
    .join(", ")
    .slice(0, 80);
  const status = assign.status || "-";
  const farmName = assign.visits?.farms?.name || "-";

  const statusColor = status === "open" ? "#065F46" : "#6B7280";

  return (
    <Pressable
      style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
      onPress={onPress}
    >
      <View style={{ marginRight: 12, alignItems: "center" }}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText style={{ fontWeight: "600" }}>{farmName}</ThemedText>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <ThemedText>{title}</ThemedText>
          {assign.deadline ? (
            <ThemedText
              style={{ color: "#B91C1C", marginLeft: 8, fontSize: 12 }}
            >
              {assign.deadline}
            </ThemedText>
          ) : null}
        </View>
        <ThemedText style={{ color: "#6B7280", marginTop: 4 }}>
          {productNames || "-"}
        </ThemedText>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <ThemedText
          style={{ fontSize: 12, fontWeight: "600", color: statusColor }}
        >
          {status.toUpperCase()}
        </ThemedText>
        <IconSymbol name="chevron.right" size={20} color="#6B7280" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  statusDot: { width: 10, height: 10, borderRadius: 6 },
});
