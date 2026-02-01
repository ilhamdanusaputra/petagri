import { ThemedText } from "@/components/themed-text";
import React from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  title: string;
  count?: number;
};

export function ApprovalSectionHeader({ title, count }: Props) {
  return (
    <View style={styles.row}>
      <ThemedText style={{ fontWeight: "600" }}>{title}</ThemedText>
      {typeof count === "number" ? (
        <ThemedText style={{ color: "#6B7280" }}>{count}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
});
