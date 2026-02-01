import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

const DUMMY = [
  { id: "A1", text: "Konsultan X menambahkan laporan kebun A" },
  { id: "A2", text: "Mitra Y mengajukan penawaran untuk Tender_2026-01-20" },
  { id: "A3", text: "Stok produk Z menipis" },
];

export default function DashboardActivity() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Aktivitas Terbaru (Dummy)</ThemedText>
      <FlatList
        data={DUMMY}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <ThemedText style={styles.text}>• {item.text}</ThemedText>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    flex: 1,
  },
  title: { fontWeight: "700", marginBottom: 8 },
  row: { paddingVertical: 6 },
  text: { color: "#374151" },
});
