import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTenderAssignment } from "@/hooks/use-tender-assignment";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

  const [visitId, setVisitId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [productName, setProductName] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");

  const handleCreate = async () => {
    const products = [
      {
        product_name: productName || "Produk",
        qty: Number(qty) || 1,
        price: price ? Number(price) : null,
      },
    ];
    const res = await createAssignment(
      { visit_id: visitId, deadline: deadline || null },
      products,
    );
    if (res.success) router.back();
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <ThemedText type="title">Buat Penugasan Tender (Manual)</ThemedText>

        <View style={{ marginTop: 12 }}>
          <ThemedText style={{ fontWeight: "600" }}>
            Visit ID (opsional)
          </ThemedText>
          <TextInput
            value={visitId}
            onChangeText={setVisitId}
            style={styles.input}
            placeholder="visit id"
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <ThemedText style={{ fontWeight: "600" }}>Deadline</ThemedText>
          <TextInput
            value={deadline}
            onChangeText={setDeadline}
            style={styles.input}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <ThemedText style={{ fontWeight: "600" }}>Produk</ThemedText>
          <TextInput
            value={productName}
            onChangeText={setProductName}
            style={styles.input}
            placeholder="Nama produk"
          />
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <TextInput
              value={qty}
              onChangeText={setQty}
              style={[styles.input, { flex: 1 }]}
              placeholder="Qty"
              keyboardType="numeric"
            />
            <TextInput
              value={price}
              onChangeText={setPrice}
              style={[styles.input, { flex: 1 }]}
              placeholder="Harga"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: tint }]}
            onPress={handleCreate}
            disabled={loading}
          >
            <ThemedText
              style={{ color: "white", textAlign: "center", fontWeight: "600" }}
            >
              Buat
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
  actionBtn: { padding: 12, borderRadius: 10 },
});
