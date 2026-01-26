import ConsultantOverview from "@/components/consultant-overview";
import FarmOverview from "@/components/farm-overview";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTenderAssignment } from "@/hooks/use-tender-assignment";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/utils/supabase";
import { showError, showSuccess } from "@/utils/toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function EditTenderAssign() {
  const params = useLocalSearchParams();
  const id = params?.id as string;
  const router = useRouter();
  const { getAssignmentById, updateAssignment, deleteAssignment, loading } =
    useTenderAssignment();
  const tint = useThemeColor({}, "tint");

  const [loadingData, setLoadingData] = useState(true);
  const [assign, setAssign] = useState<any | null>(null);
  const [deadline, setDeadline] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [products, setProducts] = useState<any[]>([]);
  const [detail, setDetail] = useState<any | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      setError(null);
      setFetchError(null);
      try {
        const res = await getAssignmentById(id);
        if (!res.success)
          throw new Error(res.error || "Gagal memuat penugasan");
        const data = res.data;
        setAssign(data);
        setDeadline(data.deadline ?? undefined);
        setMessage(data.message ?? undefined);
        setProducts((data.products || []).map((p: any) => ({ ...p })));

        if (data.visit_id) {
          try {
            const { data: rpt } = await supabase
              .from("visit_reports")
              .select(
                `*, visits (*, farms (name), profiles (full_name)), visit_recommendations(*)`,
              )
              .eq("visit_id", data.visit_id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (rpt) {
              setDetail({
                visit_id: data.visit_id,
                report: rpt,
                recommendations: rpt.visit_recommendations || [],
              });
            } else {
              const { data: v } = await supabase
                .from("visits")
                .select(`*, farms (name), profiles (full_name)`)
                .eq("id", data.visit_id)
                .maybeSingle();
              setDetail({
                visit_id: data.visit_id,
                report: null,
                visits: v,
                recommendations: [],
              });
            }
          } catch (innerErr: any) {
            console.warn(innerErr);
            setDetail(null);
          }
        }
      } catch (e: any) {
        setError(e?.message || "Gagal memuat penugasan");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [id]);

  const updateProduct = (index: number, patch: any) =>
    setProducts((p) =>
      p.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    );

  const addProduct = () =>
    setProducts((p) => [
      ...p,
      { product_name: "", dosage: "", qty: 1, price: null },
    ]);
  const removeProduct = (index: number) =>
    setProducts((p) => p.filter((_, i) => i !== index));
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
        .filter(
          (rp: any) => !existing.has((rp.product_name || "").toLowerCase()),
        );
      return [...current, ...recProducts];
    });
  };

  const handleSave = async () => {
    setError(null);
    try {
      const patch: any = {
        deadline: deadline ?? null,
        message: message ?? null,
      };
      const prodPayload = products.map((p) => ({
        product_name: p.product_name,
        dosage: p.dosage ?? null,
        qty: p.qty ?? 1,
        price: p.price ?? null,
        note: p.note ?? null,
      }));
      const res = await updateAssignment(id, patch, prodPayload);
      if (!res.success) throw new Error(res.error || "Gagal menyimpan");
      showSuccess("Perubahan tersimpan");
      router.replace(`/menus/tender/assignment?refresh=${Date.now()}`);
    } catch (e: any) {
      const msg = e?.message || "Gagal menyimpan perubahan";
      setError(msg);
      showError(msg);
    }
  };

  const handleSaveWithStatus = async (status: string) => {
    setError(null);
    try {
      const patch: any = {
        deadline: deadline ?? null,
        message: message ?? null,
        status,
      };
      const prodPayload = products.map((p) => ({
        product_name: p.product_name,
        dosage: p.dosage ?? null,
        qty: p.qty ?? 1,
        price: p.price ?? null,
        note: p.note ?? null,
      }));
      const res = await updateAssignment(id, patch, prodPayload);
      if (!res.success) throw new Error(res.error || "Gagal menyimpan");
      if (status === "open") {
        showSuccess("Tender dibuka");
      } else if (status === "closed") {
        showSuccess("Tender ditutup");
      } else {
        showSuccess("Draft tersimpan");
      }
      router.replace(`/menus/tender/assignment?refresh=${Date.now()}`);
    } catch (e: any) {
      const msg = e?.message || "Gagal menyimpan perubahan";
      setError(msg);
      showError(msg);
    }
  };

  const confirmDelete = () => {
    // web: use window.confirm for synchronous confirmation
    if (Platform.OS === "web") {
      const ok = confirm("Yakin ingin menghapus penugasan ini?");
      if (!ok) return;
      (async () => {
        try {
          showSuccess("Menghapus...");
          setDeleting(true);
          console.warn("Deleting tender_assign", id);
          const res = await deleteAssignment(id);
          setDeleting(false);
          if (res.success) {
            showSuccess("Penugasan dihapus");
            router.replace(`/menus/tender/assignment?refresh=${Date.now()}`);
          } else {
            const msg = res.error || "Gagal menghapus penugasan";
            setError(msg);
            showError(msg);
          }
        } catch (e: any) {
          setDeleting(false);
          const msg = e?.message || "Gagal menghapus penugasan";
          setError(msg);
          showError(msg);
        }
      })();
      return;
    }

    Alert.alert("Hapus Penugasan", "Yakin ingin menghapus penugasan ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            showSuccess("Menghapus...");
            setDeleting(true);
            console.warn("Deleting tender_assign", id);
            const res = await deleteAssignment(id);
            setDeleting(false);
            if (res.success) {
              showSuccess("Penugasan dihapus");
              router.replace(`/menus/tender/assignment?refresh=${Date.now()}`);
            } else {
              const msg = res.error || "Gagal menghapus penugasan";
              setError(msg);
              showError(msg);
            }
          } catch (e: any) {
            setDeleting(false);
            const msg = e?.message || "Gagal menghapus penugasan";
            setError(msg);
            showError(msg);
          }
        },
      },
    ]);
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

  if (error) {
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
          {error}
        </ThemedText>
        <Pressable
          style={[styles.addBtn, { marginTop: 12 }]}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.addBtnText}>Kembali</ThemedText>
        </Pressable>
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
            <ThemedText type="title">Edit Penugasan Tender</ThemedText>
          </View>

          <View style={{ marginTop: 12, marginBottom: 8 }}>
            <FarmOverview
              farm={{
                id: detail?.visit_id || assign?.visit_id || "",
                name:
                  detail?.report?.visits?.farms?.name ||
                  detail?.visits?.farms?.name ||
                  "-",
                commodity: (detail?.report?.plant_type as string) || null,
                area_ha: (detail?.report?.land_area as number) || null,
                location: undefined,
                status: undefined,
              }}
            />
          </View>

          <View style={{ marginTop: 8, marginBottom: 8 }}>
            <ConsultantOverview
              consultant={{
                id:
                  detail?.report?.visits?.consultant_id ||
                  detail?.visits?.consultant_id ||
                  "",
                name:
                  detail?.report?.visits?.profiles?.full_name ||
                  detail?.visits?.profiles?.full_name ||
                  "-",
                phone: undefined,
                role: undefined,
              }}
            />
          </View>

          <View style={styles.reportCard}>
            {detail?.report?.field_photo_url ? (
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
                  {detail?.report?.plant_type || "-"}
                </ThemedText>
              </View>

              <View style={styles.row}>
                <IconSymbol name="calendar" size={16} color="#1E88E5" />
                <ThemedText style={styles.label}>Umur Tanaman</ThemedText>
                <ThemedText style={styles.value}>
                  {detail?.report?.plant_age || "-"}
                </ThemedText>
              </View>

              <View style={styles.row}>
                <IconSymbol name="chart.bar.fill" size={16} color="#F59E0B" />
                <ThemedText style={styles.label}>Luas Lahan</ThemedText>
                <ThemedText style={styles.value}>
                  {detail?.report?.land_area
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
                    {detail?.report?.problems || "-"}
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
              Produk
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
            {error ? (
              <ThemedText style={{ color: "#EF4444", marginTop: 8 }}>
                {error}
              </ThemedText>
            ) : null}
          </View>

          <View style={{ marginTop: 12 }}>
            <Pressable
              style={[
                styles.restoreBtn,
                { backgroundColor: "#FEF2F2", borderColor: "#FCA5A5" },
              ]}
              onPress={confirmDelete}
              disabled={loading || deleting}
            >
              <ThemedText
                style={{
                  color: "#B91C1C",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                {deleting ? "Menghapus..." : "Hapus Penugasan"}
              </ThemedText>
            </Pressable>
          </View>

          <View style={{ marginTop: 12 }}>
            <Pressable
              style={[
                styles.actionBtn,
                { backgroundColor: tint, marginBottom: 8 },
              ]}
              onPress={() => handleSaveWithStatus("draft")}
              disabled={loading}
            >
              <ThemedText
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Simpan Draft
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.actionBtn,
                { backgroundColor: tint, marginBottom: 8 },
              ]}
              onPress={() => handleSaveWithStatus("open")}
              disabled={loading}
            >
              <ThemedText
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Buka Tender
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.actionBtn,
                { backgroundColor: "#DC2626", marginBottom: 8 },
              ]}
              onPress={() => handleSaveWithStatus("closed")}
              disabled={loading}
            >
              <ThemedText
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Tutup Tender
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: tint }]}
              onPress={handleSave}
              disabled={loading}
            >
              <ThemedText
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Simpan Perubahan
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
