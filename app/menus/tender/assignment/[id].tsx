import ConsultantOverview from "@/components/consultant-overview";
import FarmOverview from "@/components/farm-overview";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTenderAssignment } from "@/hooks/use-tender-assignment";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

export default function TenderAssignmentDetail() {
  const params = useLocalSearchParams();
  const id = params?.id as string;
  const router = useRouter();
  const { createAssignment, loading } = useTenderAssignment();

  const [loadingData, setLoadingData] = useState(true);
  const [detail, setDetail] = useState<any | null>(null);
  const [deadline, setDeadline] = useState<string | undefined>(undefined);
  const [products, setProducts] = useState<any[]>([]);
  const tint = useThemeColor({}, "tint");

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      try {
        const { data, error } = await supabase
          .from("visit_reports")
          .select(
            `*, visits (*, farms (name), profiles (full_name)), visit_recommendations(*)`,
          )
          .eq("id", id)
          .single();

        if (error || !data) {
          console.warn("visit_report not found", error);
          setDetail(null);
          setLoadingData(false);
          return;
        }

        const recs = data.visit_recommendations || [];

        const detailObj = {
          visit_id: data.visit_id,
          report: data,
          recommendations: recs,
        };

        setDetail(detailObj);
        setProducts(
          recs.map((r: any) => ({
            product_name: r.product_name,
            dosage: r.dosage || null,
            qty: 1,
            price: null,
          })),
        );
      } catch (err: any) {
        console.warn(err);
        setDetail(null);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [id]);

  const updateProduct = (index: number, patch: any) => {
    setProducts((p) =>
      p.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    );
  };

  const handleCreate = async () => {
    const filtered = products.map((p) => ({ ...p, price: p.price || null }));
    const res = await createAssignment(
      { visit_id: detail.visit_id, deadline },
      filtered,
    );
    if (res.success) {
      router.back();
    } else {
      // TODO: show error toast
      console.warn(res.error);
    }
  };

  if (loadingData || !detail) {
    return (
      <ThemedView
        style={{
          flex: 1,
          padding: 16,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ThemedText type="title">
              Buat Tender dari Laporan Kunjungan
            </ThemedText>
          </View>

          {/* Farm overview */}
          <View style={{ marginTop: 12, marginBottom: 8 }}>
            <FarmOverview
              farm={{
                id: detail.report?.visits?.farm_id || "",
                name: detail.report?.visits?.farms?.name || "-",
                commodity: (detail.report?.plant_type as string) || null,
                area_ha: (detail.report?.land_area as number) || null,
                location: undefined,
                status: undefined,
              }}
            />
          </View>

          {/* Consultant overview */}
          <View style={{ marginTop: 8, marginBottom: 8 }}>
            <ConsultantOverview
              consultant={{
                id: detail.report?.visits?.consultant_id || "",
                name: detail.report?.visits?.profiles?.full_name || "-",
                phone: undefined,
                role: undefined,
              }}
            />
          </View>

          <ThemedText style={{ marginTop: 8 }}>
            {detail.report?.problems || "-"}
          </ThemedText>

          <View style={{ marginTop: 12 }}>
            <ThemedText style={{ fontWeight: "600" }}>Deadline</ThemedText>
            <TextInput
              value={deadline}
              onChangeText={setDeadline}
              placeholder="YYYY-MM-DD"
              style={styles.input}
            />
          </View>

          <View style={{ marginTop: 12 }}>
            <ThemedText style={{ fontWeight: "600", marginBottom: 8 }}>
              Produk (Sumber rekomendasi)
            </ThemedText>

            <FlatList
              data={products}
              keyExtractor={(it, idx) => `${idx}`}
              renderItem={({ item, index }) => (
                <View style={styles.productRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontWeight: "600" }}>
                      {item.product_name}
                    </ThemedText>
                    <ThemedText style={{ color: "#6B7280", fontSize: 12 }}>
                      {item.dosage || "-"}
                    </ThemedText>
                  </View>
                  <TextInput
                    style={[styles.smallInput]}
                    keyboardType="numeric"
                    value={String(item.qty)}
                    onChangeText={(t) =>
                      updateProduct(index, { qty: Number(t || 0) })
                    }
                  />
                  <TextInput
                    style={[styles.smallInput, { marginLeft: 8 }]}
                    keyboardType="numeric"
                    placeholder="Harga"
                    value={item.price ? String(item.price) : ""}
                    onChangeText={(t) =>
                      updateProduct(index, { price: t ? Number(t) : null })
                    }
                  />
                </View>
              )}
            />
          </View>

          <View style={{ marginTop: 20 }}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: tint }]}
              onPress={handleCreate}
              disabled={loading}
            >
              <ThemedText
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Buat Tender
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  smallInput: {
    width: 80,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 6,
    borderRadius: 6,
    textAlign: "center",
  },
  actionBtn: { padding: 12, borderRadius: 10 },
});
