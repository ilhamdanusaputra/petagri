import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTenderAssignment } from "@/hooks/use-tender-assignment";
import { useThemeColor } from "@/hooks/use-theme-color";
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

export default function EditTenderAssign() {
  const params = useLocalSearchParams();
  const id = params?.id as string;
  const router = useRouter();
  const { getAssignmentById, updateAssignment, loading } =
    useTenderAssignment();
  const tint = useThemeColor({}, "tint");

  const [loadingData, setLoadingData] = useState(true);
  const [assign, setAssign] = useState<any | null>(null);
  const [deadline, setDeadline] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingData(true);
      setError(null);
      try {
        const res = await getAssignmentById(id);
        if (!res.success)
          throw new Error(res.error || "Gagal memuat penugasan");
        const data = res.data;
        setAssign(data);
        setDeadline(data.deadline ?? undefined);
        setMessage(data.message ?? undefined);
        setProducts((data.products || []).map((p: any) => ({ ...p })));
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

  const handleSave = async () => {
    setError(null);
    try {
      const patch: any = {
        deadline: deadline ?? null,
        message: message ?? null,
      };
      const prodPayload = products.map((p) => ({
        product_name: p.product_name,
        dosage: p.dosage,
        qty: p.qty,
        price: p.price,
        note: p.note,
      }));
      const res = await updateAssignment(id, patch, prodPayload);
      if (!res.success) throw new Error(res.error || "Gagal menyimpan");
      router.back();
    } catch (e: any) {
      setError(e?.message || "Gagal menyimpan perubahan");
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
          <ThemedText type="title">Edit Penugasan Tender</ThemedText>

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
            <ThemedText style={{ fontWeight: "600" }}>Pesan Tender</ThemedText>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Catatan..."
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              multiline
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
                </View>
              )}
            />
          </View>

          {error ? (
            <ThemedText style={{ color: "#EF4444", marginTop: 8 }}>
              {error}
            </ThemedText>
          ) : null}

          <View style={{ marginTop: 20 }}>
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
  smallInput: {
    width: 80,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 6,
    borderRadius: 6,
    textAlign: "center",
  },
  actionBtn: { padding: 12, borderRadius: 10 },
  addBtn: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#fff",
    width: 140,
  },
  addBtnText: { color: "#065F46", fontWeight: "600" },
});
