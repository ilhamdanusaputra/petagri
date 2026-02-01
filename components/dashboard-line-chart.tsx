import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

const DUMMY = [
  { value: 20, label: "Jan" },
  { value: 45, label: "Feb" },
  { value: 28, label: "Mar" },
  { value: 80, label: "Apr" },
  { value: 65, label: "May" },
  { value: 95, label: "Jun" },
];

export default function DashboardLineChart() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Trend Penjualan (Dummy)</ThemedText>
      <View style={{ paddingHorizontal: 6 }}>
        <LineChart
          data={DUMMY}
          width={280}
          height={140}
          initialSpacing={12}
          spacing={36}
          dataPointWidth={6}
          isAnimated
          hideDataPoints={false}
          hideRules
          color="#3B82F6"
          areaChart
          areaChartGradient={{ angle: 90, start: "#DBEAFE", end: "#FFFFFF" }}
          xAxisLabelTextStyle={{ color: "#374151", fontSize: 12 }}
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
