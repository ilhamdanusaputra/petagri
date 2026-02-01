import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

const DUMMY = [
  { id: "S1", to: "Kebun A", status: "In Transit", progress: 60 },
  { id: "S2", to: "Kebun B", status: "Delivered", progress: 100 },
  { id: "S3", to: "Kebun C", status: "Packing", progress: 10 },
];

export default function DashboardShipping() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        Monitoring Pengiriman (Dummy)
      </ThemedText>
      <FlatList
        data={DUMMY}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.left}>
              <ThemedText style={styles.shipId}>{item.id}</ThemedText>
              <ThemedText style={styles.to}>{item.to}</ThemedText>
            </View>
            <View style={styles.right}>
              <ThemedText style={styles.status}>{item.status}</ThemedText>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progress, { width: `${item.progress}%` }]}
                />
              </View>
            </View>
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
  },
  title: { fontWeight: "700", marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  left: {},
  right: { width: 140, alignItems: "flex-end" },
  shipId: { fontWeight: "700" },
  to: { color: "#6B7280" },
  status: { fontSize: 12, marginBottom: 6 },
  progressBar: {
    width: 120,
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    overflow: "hidden",
  },
  progress: { height: "100%", backgroundColor: "#10B981" },
});
