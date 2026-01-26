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
  const [assignments, setAssignments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cardBg = useThemeColor({}, "card");
  const border = useThemeColor({}, "cardBorder");
  const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");
  const tint = useThemeColor({}, "tint");

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: reportsData, error: reportsErr },
        { data: assignsData, error: assignsErr },
      ] = await Promise.all([
        supabase
          .from("visit_reports")
          .select(`*, visits (*, farms (name), profiles (full_name))`)
          .order("created_at", { ascending: false }),
        supabase
          .from("tender_assigns")
          .select(`*, visits (*, farms (name))`)
          .order("created_at", { ascending: false }),
      ]);

      if (reportsErr) throw reportsErr;
      if (assignsErr) throw assignsErr;

      const mappedReports = (reportsData || []).map((r: any) => ({
        ...r,
        farm_name: r.visits?.farms?.name || "-",
        consultant_name: r.visits?.profiles?.full_name || "-",
        scheduled_date: r.visits?.scheduled_date,
        visit_id: r.visit_id,
      }));

      const mappedAssigns = (assignsData || []).map((a: any) => ({
        ...a,
        farm_name: a.visits?.farms?.name || "-",
        created_at: a.created_at,
      }));

      // find visit_reports that don't have a tender (by visit_id)
      const assignedVisitIds = new Set(
        (mappedAssigns || []).map((x: any) => x.visit_id),
      );
      const reportsNoTender = mappedReports.filter(
        (r: any) => !assignedVisitIds.has(r.visit_id),
      );

      setReports(reportsNoTender);
      setAssignments(mappedAssigns);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data tender");
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

  const renderAssignment = ({ item }: { item: any }) => (
    <Pressable
      style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
      onPress={() => router.push(`/menus/tender/assignment/edit/${item.id}`)}
    >
      <View style={{ flex: 1 }}>
        <ThemedText style={{ fontWeight: "600" }}>{item.farm_name}</ThemedText>
        <ThemedText style={{ color: muted, fontSize: 13 }}>
          {item.status || "-"}
        </ThemedText>
        <ThemedText style={{ color: muted, fontSize: 13 }}>
          {item.created_at ? new Date(item.created_at).toLocaleString() : "-"}
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
      ) : (
        <>
          <ThemedText type="subtitle" style={{ marginTop: 8, marginBottom: 6 }}>
            Laporan Kunjungan (Belum dibuat Tender)
          </ThemedText>
          {reports.length === 0 ? (
            <ThemedText style={{ color: muted, marginBottom: 12 }}>
              Tidak ada laporan belum ditugaskan
            </ThemedText>
          ) : (
            <FlatList
              data={reports}
              keyExtractor={(i: any) => i.id}
              renderItem={renderItem}
              style={{ marginBottom: 12 }}
            />
          )}

          <ThemedText type="subtitle" style={{ marginTop: 8, marginBottom: 6 }}>
            Penugasan Tender (Sudah dibuat)
          </ThemedText>
          {assignments.length === 0 ? (
            <ThemedText style={{ color: muted }}>
              Belum ada penugasan tender
            </ThemedText>
          ) : (
            <FlatList
              data={assignments}
              keyExtractor={(i: any) => i.id}
              renderItem={renderAssignment}
            />
          )}
        </>
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
