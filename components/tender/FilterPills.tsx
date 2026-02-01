import { ThemedText } from "@/components/themed-text";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  value: "all" | "open" | "closed";
  onChange: (v: "all" | "open" | "closed") => void;
};

export function FilterPills({ value, onChange }: Props) {
  return (
    <View style={{ flexDirection: "row" }}>
      <Pressable
        onPress={() => onChange("all")}
        style={[styles.pill, value === "all" && styles.active]}
      >
        <ThemedText>All</ThemedText>
      </Pressable>
      <Pressable
        onPress={() => onChange("open")}
        style={[styles.pill, value === "open" && styles.active]}
      >
        <ThemedText style={{ color: value === "open" ? "white" : "#065F46" }}>
          OPEN
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={() => onChange("closed")}
        style={[styles.pill, value === "closed" && styles.active]}
      >
        <ThemedText style={{ color: value === "closed" ? "white" : "#6B7280" }}>
          CLOSED
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  active: {
    backgroundColor: "#065F46",
    borderColor: "#065F46",
  },
});
