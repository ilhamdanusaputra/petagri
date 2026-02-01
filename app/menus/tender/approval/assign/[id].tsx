import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { supabase } from "@/utils/supabase";
import { showError, showSuccess } from "@/utils/toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

export default function ApprovalAssignDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const assignId = (params.id as string) || null;

  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<any[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, any>>({});
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!assignId) return;
      setLoading(true);
      try {
        // load offerings for this assignment with their products
        const { data: offData, error: offErr } = await supabase
          .from("tender_offerings")
          .select("*, tender_offerings_products(*)")
          .eq("tender_assign_id", assignId)
          .order("created_at", { ascending: false });
        if (offErr) throw offErr;

        const offersList = (offData as any[]) || [];
        setOffers(offersList);

        // load existing approve (winner) for this assignment
        const { data: approveData, error: approveErr } = await supabase
          .from("tender_approves")
          .select("winning_tender_offering_id")
          .eq("tender_assign_id", assignId)
          .maybeSingle();
        if (
          !approveErr &&
          approveData &&
          approveData.winning_tender_offering_id
        ) {
          setWinnerId(approveData.winning_tender_offering_id as string);
        }

        // fetch profile names for offered_by ids via view v_profiles
        const offeredByIds = Array.from(
          new Set(offersList.map((o) => o.offered_by)),
        ).filter(Boolean);
        if (offeredByIds.length > 0) {
          const { data: profiles } = await supabase
            .from("v_profiles")
            .select("id, full_name")
            .in("id", offeredByIds);
          const map: Record<string, any> = {};
          (profiles || []).forEach((p: any) => (map[p.id] = p));
          setProfilesMap(map);
        }
      } catch (err: any) {
        showError(err.message || "Gagal memuat penawaran");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assignId]);

  const formatPrice = (v: any) => {
    if (v == null) return "-";
    try {
      return new Intl.NumberFormat("id-ID").format(Number(v));
    } catch (e) {
      return String(v);
    }
  };

  const handlePickWinner = async (offeringId: string) => {
    if (!assignId || !offeringId) return;
    setSaving(true);
    try {
      // Check if an approve already exists for this assignment
      const { data: existsData, error: existsErr } = await supabase
        .from("tender_approves")
        .select("id")
        .eq("tender_assign_id", assignId)
        .single();
      if (existsErr && (existsErr as any).code !== "PGRST116") {
        // PGRST116 = no rows (PostgREST), ignore
      }

      if (existsData && existsData.id) {
        // update existing
        const { error: updErr } = await supabase
          .from("tender_approves")
          .update({ winning_tender_offering_id: offeringId })
          .eq("tender_assign_id", assignId);
        if (updErr) throw updErr;
        setWinnerId(offeringId);
      } else {
        const { error: insErr } = await supabase
          .from("tender_approves")
          .insert([
            {
              tender_assign_id: assignId,
              winning_tender_offering_id: offeringId,
            },
          ]);
        if (insErr) throw insErr;
        setWinnerId(offeringId);
      }

      showSuccess("Pemenang berhasil dipilih");
      router.replace(`/menus/tender/approval?refresh=${Date.now()}`);
    } catch (err: any) {
      showError(err.message || "Gagal memilih pemenang");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#065F46" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <ThemedText type="title">Pilih Pemenang</ThemedText>

        {offers.length === 0 ? (
          <ThemedText style={{ color: "#6B7280", marginTop: 8 }}>
            Tidak ada penawaran untuk tender ini.
          </ThemedText>
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(i: any) => i.id}
            renderItem={({ item }) => {
              const profile = profilesMap[item.offered_by];
              const name = profile?.full_name || item.offered_by;
              const isWinner = item.id === winnerId;

              return (
                <View
                  style={[
                    styles.card,
                    isWinner
                      ? { backgroundColor: "#ECFDF5", borderColor: "#86EFAC" }
                      : {},
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontWeight: "600" }}>
                      {name}
                    </ThemedText>
                    <View style={{ marginTop: 6 }}>
                      {item.tender_offerings_products?.length > 0 ? (
                        item.tender_offerings_products.map(
                          (p: any, idx: number) => (
                            <ThemedText
                              key={`${item.id}-${idx}`}
                              style={{ color: "#6B7280", marginTop: 4 }}
                            >
                              - {p.product_name}
                              {p.dosage ? ` (${p.dosage})` : ""}
                              {p.price != null
                                ? ` — Rp ${formatPrice(p.price)}`
                                : ""}
                            </ThemedText>
                          ),
                        )
                      ) : (
                        <ThemedText style={{ color: "#6B7280", marginTop: 4 }}>
                          (Tidak ada produk)
                        </ThemedText>
                      )}
                    </View>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    {isWinner ? (
                      <ThemedText
                        style={{
                          color: "#065F46",
                          fontWeight: "700",
                          marginBottom: 8,
                        }}
                      >
                        Pemenang
                      </ThemedText>
                    ) : (
                      <Pressable
                        style={[styles.pickBtn, saving ? { opacity: 0.6 } : {}]}
                        onPress={() => handlePickWinner(item.id)}
                        disabled={saving}
                      >
                        <ThemedText
                          style={{ color: "white", fontWeight: "600" }}
                        >
                          Pilih Pemenang
                        </ThemedText>
                      </Pressable>
                    )}
                    <IconSymbol
                      name="chevron.right"
                      size={20}
                      color="#6B7280"
                    />
                  </View>
                </View>
              );
            }}
          />
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  pickBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#065F46",
    marginBottom: 8,
  },
});
