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
	Platform,
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
    {
      product_name: "",
      dosage: "",
      qty: 1,
      price: null,
      note: "",
      indent: false,
      indent_date: null,
    },
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
      {
        product_name: "",
        dosage: "",
        qty: 1,
        price: null,
        note: "",
        indent: false,
        indent_date: null,
      },
    ]);
  const removeProduct = (index: number) =>
    setProducts((p) => p.filter((_, i) => i !== index));

  const addProductFromAssign = (p: any) =>
    setProducts((prev) => [
      ...prev,
      {
        product_name: p.product_name || "",
        dosage: p.dosage || "",
        qty: p.qty || 1,
        price: null,
        note: "",
        indent: false,
        indent_date: null,
      },
    ]);

  const [showIndentPickerIndex, setShowIndentPickerIndex] = useState<
    number | null
  >(null);

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
        indent: !!p.indent,
        indent_date: p.indent_date || null,
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
        product_name: p.product_name,
        dosage: p.dosage,
        qty: p.qty,
        price: p.price,
        note: p.note,
        indent_date: p.indent ? p.indent_date : null,
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
                <Pressable
                  key={p.id}
                  onPress={() => addProductFromAssign(p)}
                  style={styles.assignRow}
                >
                  <IconSymbol name="plus" size={18} color="#065F46" />
                  <ThemedText style={{ color: "#374151", marginLeft: 8 }}>
                    {p.product_name}
                    {p.dosage ? ` (dosage: ${p.dosage})` : ""}
                    {p.qty ? ` (qty: ${p.qty})` : ""}
                  </ThemedText>
                </Pressable>
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
              <View style={styles.productBlock}>
                <View style={styles.productRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.fieldLabel}>
                      Nama produk
                    </ThemedText>
                    <TextInput
                      placeholder="Contoh: Pupuk NPK 16-16-16"
                      placeholderTextColor="#9CA3AF"
                      value={item.product_name || ""}
                      onChangeText={(t) =>
                        updateProduct(index, { product_name: t })
                      }
                      style={styles.productNameInput}
                    />

                    <ThemedText style={styles.fieldLabel}>Dosis</ThemedText>
                    <TextInput
                      placeholder="Contoh: 1 kg / hektar"
                      placeholderTextColor="#9CA3AF"
                      value={item.dosage || ""}
                      onChangeText={(t) => updateProduct(index, { dosage: t })}
                      style={styles.productDosageInput}
                    />

                    {/* Indent controls moved here, under Dosis */}
                    <View style={styles.indentRowInline}>
                      <Pressable
                        onPress={() =>
                          updateProduct(index, {
                            indent: !item.indent,
                            indent_date: item.indent ? null : item.indent_date,
                          })
                        }
                        style={styles.indentCheckbox}
                      >
                        <ThemedText>{item.indent ? "✓" : ""}</ThemedText>
                      </Pressable>
                      <ThemedText style={{ marginLeft: 8, marginRight: 12 }}>
                        Indent
                      </ThemedText>

                      {Platform.OS === "web" ? (
                        item.indent ? (
                          // @ts-ignore - using native input on web for date
                          <input
                            type="date"
                            value={item.indent_date || ""}
                            onChange={(e: any) =>
                              updateProduct(index, {
                                indent_date: e.target.value,
                              })
                            }
                          />
                        ) : null
                      ) : (
                        <>
                          <Pressable
                            onPress={() =>
                              setShowIndentPickerIndex(
                                showIndentPickerIndex === index ? null : index,
                              )
                            }
                            style={{ padding: 6 }}
                          >
                            <ThemedText
                              style={
                                item.indent_date
                                  ? styles.indentDateValue
                                  : styles.indentDatePlaceholder
                              }
                            >
                              {item.indent_date || "Pilih tanggal indent"}
                            </ThemedText>
                          </Pressable>
                          {showIndentPickerIndex === index && (
                            <DateTimePicker
                              value={
                                item.indent_date
                                  ? new Date(item.indent_date)
                                  : new Date()
                              }
                              mode="date"
                              display="default"
                              onChange={(_, d) => {
                                setShowIndentPickerIndex(null);
                                if (d) {
                                  const iso = d.toISOString().slice(0, 10);
                                  updateProduct(index, { indent_date: iso });
                                }
                              }}
                            />
                          )}
                        </>
                      )}
                    </View>
                    {/* Qty & Harga moved below */}
                    <View style={styles.qtyPriceRow}>
                      <View style={styles.qtyWrap}>
                        <ThemedText style={styles.smallLabel}>Qty</ThemedText>
                        <TextInput
                          style={[styles.smallInput, { width: "100%" }]}
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                          value={String(item.qty)}
                          onChangeText={(t) =>
                            updateProduct(index, { qty: Number(t || 0) })
                          }
                        />
                      </View>
                      <View style={styles.priceWrap}>
                        <ThemedText style={styles.smallLabel}>Harga</ThemedText>
                        <TextInput
                          style={[styles.smallInput, { width: "100%" }]}
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                          placeholder="Rp"
                          value={item.price ? String(item.price) : ""}
                          onChangeText={(t) =>
                            updateProduct(index, {
                              price: t ? Number(t) : null,
                            })
                          }
                        />
                      </View>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => removeProduct(index)}
                    style={styles.deleteBtn}
                  >
                    <IconSymbol name="trash" size={16} color="#B91C1C" />
                  </Pressable>
                </View>
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
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  productBlock: {
    marginBottom: 8,
  },
  indentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  indentRowInline: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  qtyPriceRow: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
    width: "100%",
  },
  qtyWrap: { flex: 1 },
  priceWrap: { flex: 1, marginLeft: 12 },
  fieldLabel: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 4,
    fontWeight: "600",
  },
  smallLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "600",
  },
  indentCheckbox: {
    width: 26,
    height: 26,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  deleteBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  productNameInput: {
    fontWeight: "600",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
  },
  assignRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  productDosageInput: {
    color: "#374151",
    fontSize: 13,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
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
  /* removed duplicate deleteBtn */
  smallInput: {
    width: 90,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    textAlign: "center",
    backgroundColor: "#FFFFFF",
  },
  indentDatePlaceholder: {
    color: "#6B7280",
  },
  indentDateValue: {
    color: "#065F46",
    fontWeight: "600",
  },
  actionBtn: { padding: 12, borderRadius: 10 },
});
