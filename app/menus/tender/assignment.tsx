import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

export default function TenderAssignment() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useThemeColor({}, "card");
  const border = useThemeColor({}, "cardBorder");
  const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");
  const tint = useThemeColor({}, "tint");

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("visit_reports")
        .select(`*, visits (*, farms (name), profiles (full_name))`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((r: any) => ({
        ...r,
        farm_name: r.visits?.farms?.name || "-",
        consultant_name: r.visits?.profiles?.full_name || "-",
        scheduled_date: r.visits?.scheduled_date,
        visit_id: r.visit_id,
      }));

      setReports(mapped);
    } catch (err: any) {
      setError(err.message || "Gagal memuat laporan kunjungan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
      onPress={() => router.push(`/menus/tender/assignment/${item.id}`)}
    >
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
        <ThemedText type="title">Buat Penugasan Tender</ThemedText>
        <Pressable
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => router.push("/menus/tender/assignment/add")}
        >
          <IconSymbol name="plus" size={16} color={tint} />
          <ThemedText style={{ color: tint, fontWeight: "600", marginLeft: 8 }}>
            Buat Manual
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
      ) : reports.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <IconSymbol name="doc.text.fill" size={48} color={muted} />
          <ThemedText style={{ marginTop: 12, color: muted }}>
            Belum ada laporan kunjungan
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={reports}
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
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
});
