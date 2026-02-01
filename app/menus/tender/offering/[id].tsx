import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { supabase } from "@/utils/supabase";
import { showError, showSuccess } from "@/utils/toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

export default function TenderOfferingEdit() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tint = useThemeColor({}, "tint");

  const offeringId = (params.id as string) || null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [offering, setOffering] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!offeringId) return;
      setLoading(true);
      try {
        const { data: offData, error: offErr } = await supabase
          .from("tender_offerings")
          .select("*, tender_offerings_products(*)")
          .eq("id", offeringId)
          .single();
        if (offErr) throw offErr;

        setOffering(offData as any);
        setProducts((offData?.tender_offerings_products ?? []) as any[]);
      } catch (err: any) {
        showError(err.message || "Gagal memuat penawaran");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [offeringId]);

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

  const handleSave = async () => {
    if (!offeringId) return;
    const validProducts = products
      .map((p) => ({
        product_name: (p.product_name || "").toString().trim(),
        dosage: p.dosage ?? null,
        qty: p.qty ?? 1,
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
      // replace products: delete existing then insert
      await supabase
        .from("tender_offerings_products")
        .delete()
        .eq("tender_offering_id", offeringId);
      const rows = validProducts.map((p) => ({
        tender_offering_id: offeringId,
        ...p,
      }));
      if (rows.length > 0) {
        const { error: prodErr } = await supabase
          .from("tender_offerings_products")
          .insert(rows);
        if (prodErr) throw prodErr;
      }

      showSuccess("Perubahan disimpan");
      // reload
      router.replace(
        `/menus/tender/offering/${offeringId}?refresh=${Date.now()}`,
      );
    } catch (err: any) {
      showError(err.message || "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!offeringId) return;
    Alert.alert("Hapus", "Yakin ingin menghapus penawaran ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await supabase
              .from("tender_offerings_products")
              .delete()
              .eq("tender_offering_id", offeringId);
            const { error } = await supabase
              .from("tender_offerings")
              .delete()
              .eq("id", offeringId);
            if (error) throw error;
            showSuccess("Penawaran dihapus");
            router.replace(`/menus/tender/offering?refresh=${Date.now()}`);
          } catch (err: any) {
            showError(err.message || "Gagal menghapus penawaran");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, padding: 16 }}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!offering) {
    return (
      <ThemedView style={{ flex: 1, padding: 16 }}>
        <ThemedText style={{ color: "#EF4444" }}>
          Penawaran tidak ditemukan.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <ThemedText type="title">Edit Penawaran</ThemedText>

        <View style={{ marginTop: 12 }}>
          <ThemedText style={{ fontWeight: "600", marginBottom: 8 }}>
            Produk Penawaran
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
              style={[styles.addBtn, { width: "100%" }]}
              onPress={addProduct}
            >
              <ThemedText style={styles.addBtnText}>Tambah Produk</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          <Pressable
            style={[
              styles.actionBtn,
              { backgroundColor: tint, marginBottom: 8 },
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <ThemedText
              style={{ color: "white", textAlign: "center", fontWeight: "600" }}
            >
              Simpan Perubahan
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: "#FEF2F2" }]}
            onPress={handleDelete}
          >
            <ThemedText
              style={{
                color: "#B91C1C",
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              Hapus Penawaran
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
