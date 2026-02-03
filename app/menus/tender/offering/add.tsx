import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/utils/supabase";
import { showError, showSuccess } from "@/utils/toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
	FlatList,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from "react-native";

export default function TenderOfferingAdd() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tint = useThemeColor({}, "tint");

  const tenderAssignId = (params.tender_assign_id as string) || null;

  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([
    { product_name: "", dosage: "", qty: 1, price: null, note: "" },
  ]);
  const [assignProducts, setAssignProducts] = useState<any[]>([]);

  useEffect(() => {
    const loadAssignProducts = async () => {
      if (!tenderAssignId) return;
      try {
        const { data, error } = await supabase
          .from("tender_assign_products")
          .select("*")
          .eq("tender_assign_id", tenderAssignId);
        if (error) throw error;
        setAssignProducts(data || []);
      } catch (err: any) {
        showError(err.message || "Gagal memuat produk yang dibutuhkan");
      }
    };
    loadAssignProducts();
  }, [tenderAssignId]);

  const updateProduct = (index: number, patch: any) =>
    setProducts((p) =>
      p.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    );
  const addProduct = () =>
    setProducts((p) => [
      ...p,
      { product_name: "", dosage: "", qty: 1, price: null, note: "" },
    ]);
  const removeProduct = (index: number) =>
    setProducts((p) => p.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!tenderAssignId) {
      showError("Missing tender assignment id");
      return;
    }

    const validProducts = products
      .map((p) => ({
        product_name: (p.product_name || "").toString().trim(),
        dosage: p.dosage || null,
        qty: p.qty || 1,
        price: p.price ?? null,
        note: p.note ?? null,
      }))
      .filter((p) => p.product_name.length > 0);

    if (validProducts.length === 0) {
      showError("Tambahkan minimal 1 produk dengan nama");
      return;
    }

    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = (userData as any)?.user?.id;
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("tender_offerings")
        .insert([
          {
            tender_assign_id: tenderAssignId,
            offered_by: userId,
          },
        ])
        .select("id")
        .single();

      if (error) throw error;
      if (!data?.id) throw new Error("Offering ID not returned");
      const created = data;
      if (!created) throw new Error("Failed to create offering");

      const rows = validProducts.map((p) => ({
        tender_offering_id: created.id,
        ...p,
      }));
      if (rows.length > 0) {
        const { error: prodErr } = await supabase
          .from("tender_offerings_products")
          .insert(rows);
        if (prodErr) throw prodErr;
      }

      showSuccess("Penawaran berhasil diajukan");
      router.replace(`/menus/tender/offering/${created.id}`);
    } catch (err: any) {
      showError(err.message || "Gagal mengajukan penawaran");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ThemedText type="title">Ajukan Penawaran</ThemedText>
        </View>

        <View style={{ marginTop: 12 }}>
          <ThemedText style={{ fontWeight: "600", marginBottom: 8 }}>
            Produk Dibutuhkan
          </ThemedText>

          {assignProducts.length === 0 ? (
            <ThemedText style={{ color: "#6B7280", marginBottom: 8 }}>
              Tidak ada daftar produk yang dibutuhkan.
            </ThemedText>
          ) : (
            <View style={{ marginBottom: 8 }}>
              {assignProducts.map((p: any) => (
                <ThemedText
                  key={p.id}
                  style={{ color: "#374151", marginBottom: 4 }}
                >
                  - {p.product_name}
                  {p.dosage ? ` (dosage: ${p.dosage})` : ""}
                  {p.qty ? ` (qty: ${p.qty})` : ""}
                </ThemedText>
              ))}
            </View>
          )}

          <ThemedText style={{ fontWeight: "600", marginBottom: 8 }}>
            Produk (Ajukan)
          </ThemedText>

          <FlatList
            data={products}
            keyExtractor={(_, idx) => `${idx}`}
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
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: tint }]}
            onPress={handleSubmit}
            disabled={saving}
          >
            <ThemedText
              style={{ color: "white", textAlign: "center", fontWeight: "600" }}
            >
              Ajukan Penawaran
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
