import { FilterPills } from "@/components/tender/FilterPills";
import { ThemedText } from "@/components/themed-text";
import React from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  title: string;
  count?: number;
  filter: "all" | "open" | "closed";
  setFilter: (v: "all" | "open" | "closed") => void;
};

export function SectionHeader({ title, count, filter, setFilter }: Props) {
  return (
    <View style={styles.row}>
      <ThemedText style={{ fontWeight: "600" }}>{title}</ThemedText>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {typeof count === "number" ? (
          <ThemedText style={{ marginRight: 8, color: "#6B7280" }}>
            {count}
          </ThemedText>
        ) : null}
        <FilterPills value={filter} onChange={setFilter} />
      </View>
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
