import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { StyleSheet, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const DUMMY = [
  { value: 50, label: "W1", frontColor: "#06b6d4" },
  { value: 80, label: "W2", frontColor: "#06b6d4" },
  { value: 40, label: "W3", frontColor: "#06b6d4" },
  { value: 70, label: "W4", frontColor: "#06b6d4" },
  { value: 90, label: "W5", frontColor: "#06b6d4" },
  { value: 60, label: "W6", frontColor: "#06b6d4" },
];

export default function DashboardChart() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Statistik Mingguan (Dummy)</ThemedText>
      <View style={{ paddingHorizontal: 6 }}>
        <BarChart
          data={DUMMY}
          barWidth={18}
          spacing={18}
          initialSpacing={0}
          hideRules
          noOfSections={4}
          curved={false}
          roundedCornerRadius={6}
          height={120}
          barBorderRadius={6}
          yAxisThickness={0}
          xAxisLabelTextStyle={{ color: "#374151", fontSize: 12 }}
          isAnimated
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
  },
  title: { fontWeight: "700", marginBottom: 8 },
});
