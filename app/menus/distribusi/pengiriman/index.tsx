import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { supabase } from "@/utils/supabase";
import { showError } from "@/utils/toast";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

export default function KelolaPengiriman() {
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("delivery")
          .select("*")
          .order("tanggal", { ascending: false });
        if (error) throw error;
        setDeliveries((data as any[]) || []);
      } catch (err: any) {
        showError(err.message || "Gagal memuat pengiriman");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontWeight: "600" }}>
            {item.nomor_surat || "-"}
          </ThemedText>
          <ThemedText style={{ color: "#6B7280", marginTop: 6 }}>
            Tanggal: {item.tanggal || "-"} • Status:{" "}
            {item.status_perjalanan || "-"}
          </ThemedText>
          <ThemedText style={{ color: "#6B7280", marginTop: 6 }}>
            Driver: {item.driver_id || "-"} • Toko: {item.mitra_toko_id || "-"}
          </ThemedText>
        </View>
        <Pressable style={styles.actionBtn} onPress={() => {}}>
          <ThemedText style={{ color: "white", fontWeight: "600" }}>
            Detail
          </ThemedText>
        </Pressable>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#065F46" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Kelola Pengiriman</ThemedText>
      <ThemedText style={{ marginBottom: 12 }}>
        Daftar pengiriman sesuai tabel `delivery`.
      </ThemedText>

      <FlatList
        data={deliveries}
        keyExtractor={(i: any) => String(i.id)}
        renderItem={renderItem}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    backgroundColor: "#065F46",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
});
