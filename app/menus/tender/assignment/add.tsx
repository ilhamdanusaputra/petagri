import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTenderAssignment } from "@/hooks/use-tender-assignment";
import { useThemeColor } from "@/hooks/use-theme-color";
import { showError, showSuccess } from "@/utils/toast";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function TenderAssignmentAdd() {
  const router = useRouter();
  const { createAssignment, loading } = useTenderAssignment();
  const tint = useThemeColor({}, "tint");

  const [deadline, setDeadline] = useState("");
  const [message, setMessage] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([
    { product_name: "", dosage: "", qty: 1, price: null },
  ]);

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

  const handleCreateWithStatus = async (status: string) => {
    setCreateError(null);
    const prodPayload = products.map((p) => ({
      product_name: p.product_name || "",
      dosage: p.dosage ?? null,
      qty: p.qty ?? 1,
      price: p.price ?? null,
    }));

    // For manual create we don't have a visit_id; pass null instead of empty string
    const res = await createAssignment(
      {
        visit_id: null,
        deadline: deadline || null,
        message: message || null,
      } as any,
      prodPayload,
    );

    if (res.success) {
      setCreateError(null);
      showSuccess(
        status === "open" ? "Tender dibuka" : "Tender disimpan sebagai draft",
      );
      router.replace(`/menus/tender/assignment?refresh=${Date.now()}`);
    } else {
      const msg = res.error || "Gagal membuat tender";
      setCreateError(msg);
      showError(msg);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <ThemedText type="title">Buat Tender (Manual)</ThemedText>
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

        <View style={{ marginTop: 12 }}>
          <Pressable
            style={[
              styles.actionBtn,
              { backgroundColor: tint, marginBottom: 8 },
            ]}
            onPress={() => handleCreateWithStatus("draft")}
            disabled={loading}
          >
            <ThemedText
              style={{ color: "white", textAlign: "center", fontWeight: "600" }}
            >
              Simpan Draft
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: tint }]}
            onPress={() => handleCreateWithStatus("open")}
            disabled={loading}
          >
            <ThemedText
              style={{ color: "white", textAlign: "center", fontWeight: "600" }}
            >
              Buka Tender
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
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
  reportContent: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  label: { marginLeft: 6, flex: 0.6, color: "#374151", fontSize: 13 },
  valueInput: {
    flex: 0.4,
    textAlign: "right",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 6,
    borderRadius: 8,
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
