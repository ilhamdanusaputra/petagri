import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { VisitStatusIcon } from "@/components/visit-status-icon";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useVisit } from "@/hooks/use-visit";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

export default function VisitResults() {
  const router = useRouter();
  const { visits, loading, error, fetchVisits } = useVisit();
  const cardBg = useThemeColor({}, "card");
  const border = useThemeColor({}, "cardBorder");
  const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");
  const tint = useThemeColor({}, "tint");

  useEffect(() => {
    fetchVisits();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
      onPress={() => router.push(`/menus/konsultasi/visit-results/${item.id}`)}
    >
      <View style={styles.cardStatus as any}>
        <VisitStatusIcon status={item.status} />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText style={{ fontWeight: "600" }}>{item.farm_name}</ThemedText>
        <ThemedText style={{ color: muted, fontSize: 13 }}>
          {item.consultant_name}
        </ThemedText>
        <ThemedText style={{ color: muted, fontSize: 13 }}>
          {new Date(item.scheduled_date).toLocaleString()}
        </ThemedText>
      </View>

      <IconSymbol name="chevron.right" size={20} color={muted} />
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow as any}>
        <ThemedText type="title">Kelola Hasil Kunjungan</ThemedText>
        <Pressable
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => router.push("/menus/konsultasi/visit-assignment/add")}
        >
          <IconSymbol name="plus" size={16} color={tint} />
          <ThemedText style={{ color: tint, fontWeight: "600", marginLeft: 8 }}>
            Atur Jadwal Kunjungan
          </ThemedText>
        </Pressable>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#1B5E20" />
        </View>
      ) : error ? (
        <ThemedText style={{ color: "#EF4444" }}>Error: {error}</ThemedText>
      ) : visits.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <IconSymbol name="doc.text.fill" size={48} color={muted} />
          <ThemedText style={{ marginTop: 12, color: muted }}>
            Belum ada kunjungan
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(i: any) => i.id}
          renderItem={renderItem}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardStatus: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
});
