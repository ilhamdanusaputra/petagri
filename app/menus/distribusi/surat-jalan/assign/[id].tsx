import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

export default function SuratJalanAssignDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const assignId = (params.id as string) || null;

  const [loading, setLoading] = useState(true);
  const [assign, setAssign] = useState<any | null>(null);
  const [winnerOffering, setWinnerOffering] = useState<any | null>(null);
  const [winnerProfile, setWinnerProfile] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!assignId) return;
      setLoading(true);
      try {
        const { data: aData, error: aErr } = await supabase
          .from("tender_assigns")
          .select(`*, visits(*, farms (*)), tender_assign_products(*)`)
          .eq("id", assignId)
          .maybeSingle();
        if (aErr) throw aErr;
        setAssign(aData as any);

        // find approve -> offering
        const { data: approveData, error: approveErr } = await supabase
          .from("tender_approves")
          .select("tender_offering_id")
          .eq("id", assignId)
          .maybeSingle();
        if (!approveErr && approveData && approveData.tender_offering_id) {
          const offerId = approveData.tender_offering_id;
          const { data: offData, error: offErr } = await supabase
            .from("tender_offerings")
            .select("*, tender_offerings_products(*)")
            .eq("id", offerId)
            .maybeSingle();
          if (!offErr) {
            setWinnerOffering(offData as any);
            // fetch profile for offered_by
            try {
              const offeredById = (offData as any)?.offered_by;
              if (offeredById) {
                const { data: profileData, error: profileErr } = await supabase
                  .from("v_profiles")
                  .select("id, full_name, phone, email")
                  .eq("id", offeredById)
                  .maybeSingle();
                if (!profileErr && profileData)
                  setWinnerProfile(profileData as any);
              }
            } catch (e) {
              console.warn(e);
            }
          }
        }
      } catch (err: any) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assignId]);

  if (loading)
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#065F46" />
      </ThemedView>
    );

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <ThemedText type="title">Atur Surat Jalan</ThemedText>

        {assign ? (
          <View style={{ marginTop: 12 }}>
            <ThemedText style={{ fontWeight: "600" }}>
              Tender: {assign.title || assign.id}
            </ThemedText>
            <ThemedText style={{ color: "#6B7280", marginTop: 6 }}>
              Kebun: {assign?.visits?.farms?.name || "-"}
            </ThemedText>
            <ThemedText style={{ color: "#6B7280", marginTop: 6 }}>
              Alamat: {assign?.visits?.farms?.location || "-"}
            </ThemedText>
            <ThemedText style={{ color: "#6B7280", marginTop: 6 }}>
              Tanggal dibuat:{" "}
              {assign?.created_at
                ? new Date(assign.created_at).toLocaleString()
                : "-"}
            </ThemedText>

            <View style={{ height: 12 }} />

            <ThemedText style={{ fontWeight: "600" }}>Pemenang</ThemedText>
            {winnerOffering ? (
              <View style={{ marginTop: 8 }}>
                <ThemedText style={{ fontWeight: "600" }}>
                  {winnerProfile?.full_name || winnerOffering.offered_by}
                </ThemedText>
                {winnerProfile?.phone ? (
                  <ThemedText style={{ color: "#6B7280", marginTop: 4 }}>
                    {winnerProfile.phone}
                  </ThemedText>
                ) : null}
                {winnerOffering.tender_offerings_products?.map((p: any) => (
                  <ThemedText
                    key={p.id}
                    style={{ color: "#6B7280", marginTop: 4 }}
                  >
                    - {p.product_name}{" "}
                    {p.price != null
                      ? `— Rp ${new Intl.NumberFormat("id-ID").format(p.price)}`
                      : ""}
                  </ThemedText>
                ))}
              </View>
            ) : (
              <ThemedText style={{ color: "#6B7280", marginTop: 8 }}>
                Belum ada pemenang untuk tender ini.
              </ThemedText>
            )}
          </View>
        ) : (
          <ThemedText style={{ color: "#6B7280", marginTop: 8 }}>
            Tidak dapat menemukan data tender.
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 } });
