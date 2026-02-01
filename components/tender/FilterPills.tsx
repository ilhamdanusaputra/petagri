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
        <View style={styles.iconOutline} />
      </Pressable>
      <Pressable
        onPress={() => onChange("open")}
        style={[styles.pill, value === "open" && styles.active]}
      >
        <View style={styles.iconOpen} />
      </Pressable>
      <Pressable
        onPress={() => onChange("closed")}
        style={[styles.pill, value === "closed" && styles.active]}
      >
        <View style={styles.iconClosed} />
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
  iconOutline: {
    width: 14,
    height: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#6B7280",
  },
  iconOpen: {
    width: 14,
    height: 14,
    borderRadius: 8,
    backgroundColor: "#16A34A",
  },
  iconClosed: {
    width: 14,
    height: 14,
    borderRadius: 8,
    backgroundColor: "#B91C1C",
  },
});
