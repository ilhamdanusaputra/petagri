import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, View } from "react-native";

type VisitStatus = "scheduled" | "completed" | "cancelled" | string;

export function VisitStatusIcon({
  status,
  size = 18,
}: {
  status: VisitStatus;
  size?: number;
}) {
  const tint = useThemeColor({}, "tint");
  const cardBg = useThemeColor({}, "card");

  let iconName: Parameters<typeof IconSymbol>[0]["name"] = "clock.fill" as any;
  let bgColor = cardBg;
  let iconColor = tint;

  if (status === "scheduled") {
    iconName = "calendar";
    bgColor = "rgba(27,94,32,0.08)"; // subtle green
    iconColor = "#166534";
  } else if (status === "completed") {
    iconName = "checkmark.circle.fill";
    bgColor = "#16A34A"; // solid green
    iconColor = "#fff";
  } else if (status === "cancelled") {
    iconName = "xmark.circle.fill";
    bgColor = "#EF4444"; // solid red
    iconColor = "#fff";
  } else {
    iconName = "clock.fill";
    bgColor = "rgba(107,114,128,0.08)"; // muted
    iconColor = "#6B7280";
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }] as any}>
      <IconSymbol name={iconName} size={size} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
