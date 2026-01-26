import ConsultantOverview from "@/components/consultant-overview";
import FarmOverview from "@/components/farm-overview";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTenderAssignment } from "@/hooks/use-tender-assignment";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [createError, setCreateError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const tint = useThemeColor({}, "tint");

  const load = async () => {
    setLoadingData(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from("visit_reports")
        .select(
          `*, visits (*, farms (name), profiles (full_name)), visit_recommendations(*)`,
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        const msg =
          (error && (error.message || String(error))) ||
          "Laporan kunjungan tidak ditemukan";
        console.warn("visit_report not found", error);
        setDetail(null);
        setFetchError(msg);
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
      const msg = err?.message || "Gagal memuat data";
      console.warn(err);
      setDetail(null);
      setFetchError(msg);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateProduct = (index: number, patch: any) => {
    setProducts((p) =>
      p.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    );
  };

  const addProduct = () => {
    setProducts((p) => [
      ...p,
      { product_name: "", dosage: "", qty: 1, price: null },
    ]);
  };

  const removeProduct = (index: number) => {
    setProducts((p) => p.filter((_, i) => i !== index));
  };

  const resetProducts = () => {
    const recs = detail?.recommendations || [];
    setProducts((current) => {
      const existing = new Set(
        current.map((p) => (p.product_name || "").toLowerCase()),
      );
      const recProducts = recs
        .map((r: any) => ({
          product_name: r.product_name || "",
          dosage: r.dosage || "",
          qty: 1,
          price: null,
        }))
        .filter((rp) => !existing.has((rp.product_name || "").toLowerCase()));
      return [...current, ...recProducts];
    });
  };

  const handleCreate = async () => {
    setCreateError(null);
    const filtered = products.map((p) => ({ ...p, price: p.price || null }));
    const res = await createAssignment(
      { visit_id: detail.visit_id, deadline, message },
      filtered,
    );
    if (res.success) {
      router.back();
    } else {
      const msg = res.error || "Gagal membuat tender";
      setCreateError(msg);
      console.warn(msg);
    }
  };

  if (loadingData) {
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

  if (fetchError) {
    return (
      <ThemedView
        style={{
          flex: 1,
          padding: 16,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconSymbol name="xmark.circle.fill" size={48} color="#EF4444" />
        <ThemedText style={{ color: "#EF4444", marginTop: 12 }}>
          {fetchError}
        </ThemedText>
        <View
          style={{
            flexDirection: "row",
            marginTop: 16,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Pressable
            style={[styles.addBtn, { width: 140, marginRight: 8 }]}
            onPress={() => load()}
          >
            <ThemedText style={styles.addBtnText}>Coba Lagi</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.addBtn, { width: 140 }]}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.addBtnText}>Kembali</ThemedText>
          </Pressable>
        </View>
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

          <View style={styles.reportCard}>
            {detail.report?.field_photo_url ? (
              <Image
                source={{ uri: detail.report.field_photo_url }}
                style={styles.photoTop}
              />
            ) : (
              <View style={styles.photoTopPlaceholder}>
                <IconSymbol name="leaf.fill" size={28} color="#fff" />
              </View>
            )}

            <View style={styles.reportContent}>
              <View style={styles.row}>
                <IconSymbol name="leaf.fill" size={16} color="#34A853" />
                <ThemedText style={styles.label}>Jenis Tanaman</ThemedText>
                <ThemedText style={styles.value}>
                  {detail.report?.plant_type || "-"}
                </ThemedText>
              </View>

              <View style={styles.row}>
                <IconSymbol name="calendar" size={16} color="#1E88E5" />
                <ThemedText style={styles.label}>Umur Tanaman</ThemedText>
                <ThemedText style={styles.value}>
                  {detail.report?.plant_age || "-"}
                </ThemedText>
              </View>

              <View style={styles.row}>
                <IconSymbol name="chart.bar.fill" size={16} color="#F59E0B" />
                <ThemedText style={styles.label}>Luas Lahan</ThemedText>
                <ThemedText style={styles.value}>
                  {detail.report?.land_area
                    ? `${detail.report.land_area} ha`
                    : "-"}
                </ThemedText>
              </View>

              <View style={styles.problemsBox}>
                <View style={styles.problemsHeader}>
                  <IconSymbol name="doc.text.fill" size={16} color="#6B7280" />
                  <ThemedText style={styles.problemsLabel}>
                    Masalah / Catatan Lapangan
                  </ThemedText>
                </View>
                <View style={styles.problemsHeader}>
                  <View style={{ width: 16, height: 16 }} />
                  <ThemedText style={styles.problemsLabel}>
                    {detail.report?.problems || "-"}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

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
                    <TextInput
                      placeholder="Nama produk"
                      value={item.product_name || ""}
                      onChangeText={(t) =>
                        updateProduct(index, { product_name: t })
                      }
                      style={styles.productNameInput}
                    />
                    <TextInput
                      placeholder="Dosis"
                      value={item.dosage || ""}
                      onChangeText={(t) => updateProduct(index, { dosage: t })}
                      style={styles.productDosageInput}
                    />
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
                  <Pressable
                    onPress={() => removeProduct(index)}
                    style={styles.deleteBtn}
                  >
                    <IconSymbol name="trash" size={14} color="#B91C1C" />
                  </Pressable>
                </View>
              )}
            />

            <View style={{ flexDirection: "column", marginTop: 8 }}>
              <Pressable
                style={[styles.addBtn, { width: "100%", marginTop: 8 }]}
                onPress={addProduct}
              >
                <ThemedText style={styles.addBtnText}>Tambah Produk</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.addBtn, { width: "100%" }]}
                onPress={resetProducts}
              >
                <ThemedText style={styles.addBtnText}>
                  Kembalikan Produk Rekomendasi Konsultan
                </ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <ThemedText style={{ fontWeight: "600" }}>
              Pesan Tender (Catatan untuk pembuat tender)
            </ThemedText>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Tambahkan catatan untuk penerima tender..."
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              multiline
            />
            {createError ? (
              <ThemedText style={{ color: "#EF4444", marginTop: 8 }}>
                {createError}
              </ThemedText>
            ) : null}
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
  reportCard: {
    flexDirection: "column",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    marginTop: 8,
  },
  photoTop: { width: "100%", height: 160, borderRadius: 8, marginBottom: 12 },
  photoTopPlaceholder: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
  },
  reportContent: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  label: { marginLeft: 6, flex: 0.6, color: "#374151", fontSize: 13 },
  value: { flex: 0.4, textAlign: "right", color: "#111827", fontWeight: "600" },
  problems: { marginTop: 6, color: "#374151" },
  problemsBox: {
    marginTop: 6,
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 10,
    paddingLeft: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  problemsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  problemsLabel: {
    marginLeft: 6,
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
  },
  problemsText: { color: "#92400E", lineHeight: 20, marginLeft: 0 },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  productNameInput: { fontWeight: "600", padding: 0 },
  productDosageInput: {
    color: "#6B7280",
    fontSize: 12,
    padding: 0,
    marginTop: 4,
  },
  addBtn: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#fff",
    width: "100%",
  },
  addBtnText: { color: "#065F46", fontWeight: "600" },
  deleteBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  restoreBtn: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  restoreBtnText: { color: "#0C4A6E", fontWeight: "600" },
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
