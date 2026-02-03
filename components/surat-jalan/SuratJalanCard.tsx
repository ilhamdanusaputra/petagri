import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  assign: any;
  winningOfferingId?: string | null;
  onPress?: () => void;
};

export function SuratJalanCard({ assign, winningOfferingId, onPress }: Props) {
  const cardBg = useThemeColor({}, "card");
  const border = useThemeColor({}, "cardBorder");

  const dateStr = assign?.created_at
    ? new Date(assign.created_at).toISOString().split("T")[0]
    : "-";
  const title = assign?.title || `Tender_${dateStr}`;
  const farmName = assign?.visits?.farms?.name || "-";

  return (
    <Pressable
      style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: "#E6F6EF" }]}>
        <IconSymbol name="truck" size={20} color="#065F46" />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText style={{ fontWeight: "600" }}>{farmName}</ThemedText>
        <ThemedText style={{ color: "#374151", fontSize: 13, marginTop: 4 }}>
          {title}
        </ThemedText>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        {winningOfferingId ? (
          <View style={styles.badge}>
            <ThemedText style={{ color: "white", fontSize: 12 }}>
              Siap Kirim
            </ThemedText>
          </View>
        ) : (
          <ThemedText style={{ color: "#6B7280", fontSize: 12 }}>
            Belum
          </ThemedText>
        )}
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  badge: {
    backgroundColor: "#065F46",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
});
