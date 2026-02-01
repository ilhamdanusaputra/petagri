import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTenderAssignment } from "@/hooks/use-tender-assignment";
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

export default function TenderOffering() {
  const router = useRouter();
  const { listAssignments } = useTenderAssignment();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [offeringsMap, setOfferingsMap] = useState<Record<string, any>>({});
  const cardBg = useThemeColor({}, "card");
  const border = useThemeColor({}, "cardBorder");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: sessionData } = await supabase.auth.getUser();
        const userId = (sessionData as any)?.user?.id;

        // load tender_assigns including products and only open/closed
        const { data: assignsData, error: assignsErr } = await supabase
          .from("tender_assigns")
          .select(`*, visits(*, farms (name)), tender_assign_products(*)`)
          .in("status", ["open", "closed"])
          .order("created_at", { ascending: false });
        if (assignsErr) throw assignsErr;

        const assigns: any[] = assignsData || [];

        // fetch offerings by current user
        let offerings: any[] = [];
        if (userId) {
          const { data: offData, error: offErr } = await supabase
            .from("tender_offerings")
            .select("*")
            .eq("offered_by", userId);
          if (offErr) throw offErr;
          offerings = offData || [];
        }

        const map: Record<string, any> = {};
        offerings.forEach((o) => (map[o.tender_assign_id] = o));

        setAssignments(assigns);
        setOfferingsMap(map);
      } catch (err: any) {
        setError(err.message || "Gagal memuat data penawaran");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const assignedNoOffer = assignments.filter((a) => !offeringsMap[a.id]);
  const assignedWithOffer = assignments.filter((a) => !!offeringsMap[a.id]);

  const renderAssign = ({ item }: { item: any }) => {
    const dateStr = item.created_at
      ? new Date(item.created_at).toISOString().split("T")[0]
      : "-";
    const title = `Tender_${dateStr}`;
    const productNames = (item.tender_assign_products || [])
      .map((p: any) => p.product_name)
      .filter(Boolean)
      .join(", ");
    const status = item.status || "-";

    return (
      <Pressable
        style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
        onPress={() =>
          router.push(`/menus/tender/offering/add?tender_assign_id=${item.id}`)
        }
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ThemedText style={{ fontWeight: "600" }}>{title}</ThemedText>
              {item.deadline ? (
                <ThemedText
                  style={{ color: "#B91C1C", marginLeft: 8, fontSize: 13 }}
                >
                  {item.deadline}
                </ThemedText>
              ) : null}
            </View>
            <ThemedText
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: status === "open" ? "#065F46" : "#6B7280",
              }}
            >
              {status.toUpperCase()}
            </ThemedText>
          </View>
          <View style={{ marginTop: 4 }}>
            <ThemedText style={{ color: "#6B7280", fontSize: 13 }}>
              {productNames || "-"}
            </ThemedText>
          </View>
        </View>
        <IconSymbol name="chevron.right" size={20} color="#6B7280" />
      </Pressable>
    );
  };

  const renderOffered = ({ item }: { item: any }) => {
    const dateStr = item.created_at
      ? new Date(item.created_at).toISOString().split("T")[0]
      : "-";
    const title = `Tender_${dateStr}`;
    const productNames = (item.tender_assign_products || [])
      .map((p: any) => p.product_name)
      .filter(Boolean)
      .join(", ");
    const status = item.status || "-";
    const offeringId = offeringsMap[item.id]?.id;

    return (
      <Pressable
        style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
        onPress={() => router.push(`/menus/tender/offering/${offeringId}`)}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ThemedText style={{ fontWeight: "600" }}>{title}</ThemedText>
              {item.deadline ? (
                <ThemedText
                  style={{ color: "#B91C1C", marginLeft: 8, fontSize: 13 }}
                >
                  {item.deadline}
                </ThemedText>
              ) : null}
            </View>
            <ThemedText
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: status === "open" ? "#065F46" : "#6B7280",
              }}
            >
              {status.toUpperCase()}
            </ThemedText>
          </View>
          <View style={{ marginTop: 4 }}>
            <ThemedText style={{ color: "#6B7280", fontSize: 13 }}>
              {productNames || "-"}
            </ThemedText>
          </View>
        </View>
        <IconSymbol name="chevron.right" size={20} color="#6B7280" />
      </Pressable>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={{ color: "#EF4444" }}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Tender Offering</ThemedText>

      <ThemedText style={{ marginTop: 12, fontWeight: "600" }}>
        Assigned — Belum Ajukan Penawaran
      </ThemedText>
      {assignedNoOffer.length === 0 ? (
        <ThemedText style={{ color: "#6B7280", marginTop: 8 }}>
          Tidak ada penugasan yang perlu diajukan.
        </ThemedText>
      ) : (
        <FlatList
          data={assignedNoOffer}
          keyExtractor={(i: any) => i.id}
          renderItem={renderAssign}
        />
      )}

      <ThemedText style={{ marginTop: 12, fontWeight: "600" }}>
        Assigned — Sudah Mengajukan Penawaran
      </ThemedText>
      {assignedWithOffer.length === 0 ? (
        <ThemedText style={{ color: "#6B7280", marginTop: 8 }}>
          Belum ada penawaran yang diajukan.
        </ThemedText>
      ) : (
        <FlatList
          data={assignedWithOffer}
          keyExtractor={(i: any) => i.id}
          renderItem={renderOffered}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
});
