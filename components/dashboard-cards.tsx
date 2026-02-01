import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

type CardItem = {
  id: string;
  title: string;
  subtitle?: string;
  count?: number;
  severity?: "info" | "warning" | "critical";
};

const DUMMY_DATA: CardItem[] = [
  {
    id: "1",
    title: "Kunjungan Terlewat",
    subtitle: "Periksa hasil kunjungan",
    count: 3,
    severity: "warning",
  },
  {
    id: "2",
    title: "Pesanan Baru",
    subtitle: "Perlu diproses",
    count: 5,
    severity: "info",
  },
  {
    id: "3",
    title: "Stok Rendah",
    subtitle: "Beberapa produk hampir habis",
    count: 8,
    severity: "critical",
  },
  {
    id: "4",
    title: "Notifikasi Sistem",
    subtitle: "Pembaruan tersedia",
    count: 1,
    severity: "info",
  },
];

export default function DashboardCards({
  items = DUMMY_DATA,
}: {
  items?: CardItem[];
}) {
  const cardBg = useThemeColor({}, "card");
  const border = useThemeColor({}, "cardBorder");
  const iconColor = useThemeColor({}, "icon");

  const renderItem = ({ item }: { item: CardItem }) => {
    const leftColor =
      item.severity === "critical"
        ? "#DC2626"
        : item.severity === "warning"
          ? "#F59E0B"
          : "#2563EB";

    return (
      <Pressable
        style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
      >
        <View style={[styles.leftStrip, { backgroundColor: leftColor }]} />
        <View style={styles.content}>
          <ThemedText style={styles.title}>{item.title}</ThemedText>
          {item.subtitle ? (
            <ThemedText style={styles.subtitle}>{item.subtitle}</ThemedText>
          ) : null}
        </View>
        <View style={styles.meta}>
          <ThemedText style={styles.count}>{item.count ?? 0}</ThemedText>
          <IconSymbol name="chevron.right" size={18} color={iconColor as any} />
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  leftStrip: {
    width: 6,
    height: "100%",
    borderRadius: 4,
    marginRight: 12,
  },
  content: { flex: 1 },
  title: { fontWeight: "600" },
  subtitle: { marginTop: 4, fontSize: 13, color: "#6B7280" },
  meta: { alignItems: "flex-end", marginLeft: 12 },
  count: { fontWeight: "700", marginBottom: 4 },
});
