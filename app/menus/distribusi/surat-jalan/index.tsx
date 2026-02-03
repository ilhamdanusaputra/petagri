import { SuratJalanCard } from "@/components/surat-jalan/SuratJalanCard";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";

export default function SuratJalanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigns, setAssigns] = useState<any[]>([]);
  const [winnerMap, setWinnerMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: assignsData, error: assignsErr } = await supabase
          .from("tender_assigns")
          .select(`*, visits(*, farms (name)), tender_assign_products(*)`)
          .in("status", ["open", "closed"])
          .order("created_at", { ascending: false });
        if (assignsErr) throw assignsErr;

        const assignsList = assignsData || [];

        const { data: approvesData, error: approvesErr } = await supabase
          .from("tender_approves")
          .select("tender_offering_id");
        if (approvesErr) throw approvesErr;

        const winningOfferingIds = (approvesData || [])
          .map((a: any) => a.tender_offering_id)
          .filter(Boolean);

        const map: Record<string, string> = {};
        if (winningOfferingIds.length > 0) {
          const { data: offData, error: offErr } = await supabase
            .from("tender_offerings")
            .select("id, tender_assign_id")
            .in("id", winningOfferingIds);
          if (offErr) throw offErr;
          (offData || []).forEach((o: any) => {
            if (o.tender_assign_id) map[o.tender_assign_id] = o.id;
          });
        }

        setAssigns(assignsList as any[]);
        setWinnerMap(map);
      } catch (err: any) {
        setError(err.message || "Gagal memuat data surat jalan");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const withWinner = assigns.filter((a) => !!winnerMap[a.id]);

  if (loading)
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#065F46" />
      </ThemedView>
    );

  if (error)
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={{ color: "#EF4444" }}>{error}</ThemedText>
      </ThemedView>
    );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Surat Jalan</ThemedText>

      {/* <ApprovalSectionHeader
        title="Tender — Sudah Ada Pemenang"
        count={withWinner.length}
      /> */}
      {withWinner.length === 0 ? (
        <ThemedText style={{ color: "#6B7280", marginTop: 8 }}>
          Belum ada tender dengan pemenang.
        </ThemedText>
      ) : (
        <FlatList
          data={withWinner}
          keyExtractor={(i: any) => i.id}
          renderItem={({ item }) => (
            <SuratJalanCard
              assign={item}
              winningOfferingId={winnerMap[item.id]}
              onPress={() =>
                router.push(`/menus/distribusi/surat-jalan/assign/${item.id}`)
              }
            />
          )}
        />
      )}

      {/* Removed list of assigns without winners — only show assigns with winners */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({ container: { padding: 16, flex: 1 } });
