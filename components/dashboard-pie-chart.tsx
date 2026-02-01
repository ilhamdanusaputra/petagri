import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { StyleSheet, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

const DUMMY = [
  { value: 45, color: "#10B981", text: "Produk A" },
  { value: 25, color: "#F59E0B", text: "Produk B" },
  { value: 15, color: "#EF4444", text: "Produk C" },
  { value: 15, color: "#3B82F6", text: "Lainnya" },
];

export default function DashboardPieChart() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Komposisi Produk (Dummy)</ThemedText>
      <View style={{ alignItems: "center" }}>
        <PieChart
          data={DUMMY}
          donut
          showText
          radius={60}
          innerRadius={40}
          strokeWidth={0}
        />
      </View>
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
});
