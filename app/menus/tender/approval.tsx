import { ApprovalCard } from "@/components/tender/ApprovalCard";
import { ApprovalSectionHeader } from "@/components/tender/ApprovalSectionHeader";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";

export default function TenderApproval() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigns, setAssigns] = useState<any[]>([]);
  const [winnerMap, setWinnerMap] = useState<Record<string, string>>({}); // tender_assign_id -> winning offering id

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // load assignments (open/closed)
        const { data: assignsData, error: assignsErr } = await supabase
          .from("tender_assigns")
          .select("*, tender_assign_products(*)")
          .in("status", ["open", "closed"])
          .order("created_at", { ascending: false });
        if (assignsErr) throw assignsErr;

        const assignsList = assignsData || [];

        // load approves to find winning offering ids
        const { data: approvesData, error: approvesErr } = await supabase
          .from("tender_approves")
          .select("winning_tender_offering_id");
        if (approvesErr) throw approvesErr;

        const winningOfferingIds = (approvesData || [])
          .map((a: any) => a.winning_tender_offering_id)
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
        setError(err.message || "Gagal memuat data approval");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const withoutWinner = assigns.filter((a) => !winnerMap[a.id]);
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
      <ThemedText type="title">Tender Approval</ThemedText>

      <ApprovalSectionHeader
        title="Assigned — Belum Ada Pemenang"
        count={withoutWinner.length}
      />
      {withoutWinner.length === 0 ? (
        <ThemedText style={{ color: "#6B7280", marginTop: 8 }}>
          Semua tender sudah memiliki pemenang.
        </ThemedText>
      ) : (
        <FlatList
          data={withoutWinner}
          keyExtractor={(i: any) => i.id}
          renderItem={({ item }) => (
            <ApprovalCard
              assign={item}
              onPress={() =>
                router.push(`/menus/tender/approval/assign/${item.id}`)
              }
            />
          )}
        />
      )}

      <ApprovalSectionHeader
        title="Assigned — Sudah Ada Pemenang"
        count={withWinner.length}
      />
      {withWinner.length === 0 ? (
        <ThemedText style={{ color: "#6B7280", marginTop: 8 }}>
          Belum ada tender yang memiliki pemenang.
        </ThemedText>
      ) : (
        <FlatList
          data={withWinner}
          keyExtractor={(i: any) => i.id}
          renderItem={({ item }) => (
            <ApprovalCard
              assign={item}
              winningOfferingId={winnerMap[item.id]}
              onPress={() =>
                router.push(`/menus/tender/approval/assign/${item.id}`)
              }
            />
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({ container: { padding: 16 } });
