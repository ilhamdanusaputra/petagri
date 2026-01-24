import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
    useVisit,
    type VisitDetail,
    type VisitRecommendation,
} from "@/hooks/use-visit";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

export default function VisitDetailPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const {
    getVisitById,
    updateVisitStatus,
    saveVisitReport,
    saveRecommendations,
  } = useVisit();
  const id = params?.id as string;

  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const bg = useThemeColor({ light: "#F9FAFB", dark: "#111827" }, "background");
  const cardBg = useThemeColor({}, "card");
  const border = useThemeColor({}, "cardBorder");
  const text = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
  const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");
  const inputBg = useThemeColor(
    { light: "#F9FAFB", dark: "#1F2937" },
    "background",
  );
  const placeholderColor = useThemeColor(
    { light: "#9CA3AF", dark: "#6B7280" },
    "icon",
  );
  const tint = useThemeColor({}, "tint");
  const success = useThemeColor({}, "success");

  // Form Report
  const [reportForm, setReportForm] = useState({
    plantType: "",
    plantAge: "",
    landArea: "",
    problems: "",
    gpsLatitude: "",
    gpsLongitude: "",
    weatherNotes: "",
  });

  // Form Recommendations
  const [recommendations, setRecommendations] = useState<
    Omit<VisitRecommendation, "id" | "visit_report_id" | "created_at">[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("ID kunjungan tidak ditemukan");
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await getVisitById(id);
      if (result.success && result.data) {
        setVisit(result.data);
        setError(null);

        // Populate form if report exists
        if (result.data.report) {
          const r = result.data.report;
          setReportForm({
            plantType: r.plant_type,
            plantAge: r.plant_age,
            landArea: r.land_area.toString(),
            problems: r.problems,
            gpsLatitude: r.gps_latitude?.toString() || "",
            gpsLongitude: r.gps_longitude?.toString() || "",
            weatherNotes: r.weather_notes || "",
          });
        }

        // Populate recommendations
        if (
          result.data.recommendations &&
          result.data.recommendations.length > 0
        ) {
          setRecommendations(
            result.data.recommendations.map((rec) => ({
              product_name: rec.product_name,
              function: rec.function,
              dosage: rec.dosage,
              estimated_qty: rec.estimated_qty,
              urgency: rec.urgency,
              alternative_products: rec.alternative_products || "",
            })),
          );
        }
      } else {
        setError(result.error || "Gagal memuat data");
      }
      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSaveReport = async () => {
    setValidationError(null);

    if (!reportForm.plantType.trim()) {
      setValidationError("Jenis tanaman harus diisi");
      return;
    }
    if (!reportForm.plantAge.trim()) {
      setValidationError("Umur tanaman harus diisi");
      return;
    }
    if (!reportForm.landArea.trim() || isNaN(Number(reportForm.landArea))) {
      setValidationError("Luas lahan harus berupa angka");
      return;
    }
    if (!reportForm.problems.trim()) {
      setValidationError("Masalah harus diisi");
      return;
    }

    setSaving(true);

    // Save report
    const reportResult = await saveVisitReport(id, {
      plant_type: reportForm.plantType,
      plant_age: reportForm.plantAge,
      land_area: Number(reportForm.landArea),
      problems: reportForm.problems,
      gps_latitude: reportForm.gpsLatitude
        ? Number(reportForm.gpsLatitude)
        : null,
      gps_longitude: reportForm.gpsLongitude
        ? Number(reportForm.gpsLongitude)
        : null,
      weather_notes: reportForm.weatherNotes || null,
    });

    if (!reportResult.success) {
      setSaving(false);
      setValidationError(reportResult.error || "Gagal menyimpan laporan");
      return;
    }

    // Save recommendations if any
    if (recommendations.length > 0) {
      const recResult = await saveRecommendations(
        reportResult.reportId!,
        recommendations,
      );
      if (!recResult.success) {
        setSaving(false);
        setValidationError(recResult.error || "Gagal menyimpan rekomendasi");
        return;
      }
    }

    // Update visit status to completed
    await updateVisitStatus(id, "completed");

    setSaving(false);
    setValidationError(null);

    // Refresh data
    const result = await getVisitById(id);
    if (result.success && result.data) {
      setVisit(result.data);
    }

    // Close modal and refresh previous page if possible
    if (router.canGoBack()) {
      router.back();
      setTimeout(() => {
        router.replace(`/menus/konsultasi/visit/${id}`);
      }, 100);
    } else {
      router.replace(`/menus/konsultasi/visit/${id}`);
    }
  };

  const addRecommendation = () => {
    setRecommendations([
      ...recommendations,
      {
        product_name: "",
        function: "",
        dosage: "",
        estimated_qty: "",
        urgency: "terjadwal",
        alternative_products: "",
      },
    ]);
  };

  const removeRecommendation = (index: number) => {
    setRecommendations(recommendations.filter((_, i) => i !== index));
  };

  const updateRecommendation = (
    index: number,
    field: string,
    value: string,
  ) => {
    const updated = [...recommendations];
    (updated[index] as any)[field] = value;
    setRecommendations(updated);
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: bg }]}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#1B5E20" />
          <ThemedText style={{ marginTop: 12, color: muted }}>
            Memuat data...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error || !visit) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: bg }]}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <IconSymbol name="bell.fill" size={48} color={muted} />
          <ThemedText style={{ marginTop: 12, color: "#EF4444" }}>
            Error: {error || "Data tidak ditemukan"}
          </ThemedText>
          <Pressable
            style={{
              marginTop: 16,
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: tint,
              borderRadius: 8,
            }}
            onPress={() => router.back()}
          >
            <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
              Kembali
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  const isCompleted = visit.status === "completed";

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header Card dengan Visual yang Lebih Menarik */}
        <View
          style={[
            styles.headerCard,
            { backgroundColor: cardBg, borderColor: border },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: tint + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <IconSymbol name="leaf.fill" size={28} color={tint} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="subtitle" style={{ marginBottom: 4 }}>
                {visit.farm_name}
              </ThemedText>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  alignSelf: "flex-start",
                  backgroundColor:
                    visit.status === "completed"
                      ? success + "20"
                      : visit.status === "scheduled"
                        ? "#3B82F620"
                        : "#EF444420",
                }}
              >
                <IconSymbol
                  name={
                    visit.status === "completed"
                      ? "checkmark.circle.fill"
                      : visit.status === "scheduled"
                        ? "clock.fill"
                        : "xmark.circle.fill"
                  }
                  size={14}
                  color={
                    visit.status === "completed"
                      ? success
                      : visit.status === "scheduled"
                        ? "#3B82F6"
                        : "#EF4444"
                  }
                />
                <ThemedText
                  style={{
                    marginLeft: 6,
                    fontSize: 12,
                    fontWeight: "600",
                    color:
                      visit.status === "completed"
                        ? success
                        : visit.status === "scheduled"
                          ? "#3B82F6"
                          : "#EF4444",
                  }}
                >
                  {visit.status === "completed"
                    ? "Selesai"
                    : visit.status === "scheduled"
                      ? "Terjadwal"
                      : "Dibatalkan"}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={{ marginTop: 12, gap: 10 }}>
            <View style={styles.infoRow}>
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: inputBg,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <IconSymbol name="person.fill" size={16} color={muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 12, color: muted }}>
                    Konsultan
                  </ThemedText>
                  <ThemedText
                    style={{ fontSize: 14, fontWeight: "600", color: text }}
                  >
                    {visit.consultant_name}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: inputBg,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <IconSymbol name="calendar" size={16} color={muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 12, color: muted }}>
                    Jadwal Kunjungan
                  </ThemedText>
                  <ThemedText
                    style={{ fontSize: 14, fontWeight: "600", color: text }}
                  >
                    {new Date(visit.scheduled_date).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 13, color: muted }}>
                    {new Date(visit.scheduled_date).toLocaleTimeString(
                      "id-ID",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}{" "}
                    WIB
                  </ThemedText>
                </View>
              </View>
            </View>

            {visit.status === "completed" && visit.report?.created_at && (
              <View style={styles.infoRow}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: success + "20",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={16}
                      color={success}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontSize: 12, color: muted }}>
                      Diselesaikan pada
                    </ThemedText>
                    <ThemedText
                      style={{ fontSize: 14, fontWeight: "600", color: text }}
                    >
                      {new Date(visit.report.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </ThemedText>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Form Laporan Kondisi Kebun */}
        {!isCompleted && (
          <View
            style={[
              styles.section,
              { backgroundColor: cardBg, borderColor: border },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: tint + "20",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <IconSymbol name="doc.text.fill" size={18} color={tint} />
              </View>
              <ThemedText type="subtitle">Catatan Kondisi Kebun</ThemedText>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Jenis Tanaman *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBg,
                    color: text,
                    borderColor: border,
                  },
                ]}
                placeholder="Contoh: Kopi Arabika"
                placeholderTextColor={placeholderColor}
                value={reportForm.plantType}
                onChangeText={(val) =>
                  setReportForm({ ...reportForm, plantType: val })
                }
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Umur Tanaman *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBg,
                    color: text,
                    borderColor: border,
                  },
                ]}
                placeholder="Contoh: 3 tahun"
                placeholderTextColor={placeholderColor}
                value={reportForm.plantAge}
                onChangeText={(val) =>
                  setReportForm({ ...reportForm, plantAge: val })
                }
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Luas Lahan (ha) *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBg,
                    color: text,
                    borderColor: border,
                  },
                ]}
                placeholder="Contoh: 2.5"
                placeholderTextColor={placeholderColor}
                value={reportForm.landArea}
                onChangeText={(val) =>
                  setReportForm({ ...reportForm, landArea: val })
                }
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>
                Masalah yang Ditemukan *
              </ThemedText>
              <TextInput
                style={[
                  styles.inputMulti,
                  {
                    backgroundColor: inputBg,
                    color: text,
                    borderColor: border,
                  },
                ]}
                placeholder="Jelaskan masalah yang ditemukan di lapangan"
                placeholderTextColor={placeholderColor}
                value={reportForm.problems}
                onChangeText={(val) =>
                  setReportForm({ ...reportForm, problems: val })
                }
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>
                Lokasi GPS (Opsional)
              </ThemedText>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      backgroundColor: inputBg,
                      color: text,
                      borderColor: border,
                    },
                  ]}
                  placeholder="Latitude"
                  placeholderTextColor={placeholderColor}
                  value={reportForm.gpsLatitude}
                  onChangeText={(val) =>
                    setReportForm({ ...reportForm, gpsLatitude: val })
                  }
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      flex: 1,
                      backgroundColor: inputBg,
                      color: text,
                      borderColor: border,
                    },
                  ]}
                  placeholder="Longitude"
                  placeholderTextColor={placeholderColor}
                  value={reportForm.gpsLongitude}
                  onChangeText={(val) =>
                    setReportForm({ ...reportForm, gpsLongitude: val })
                  }
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>
                Catatan Cuaca (Opsional)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBg,
                    color: text,
                    borderColor: border,
                  },
                ]}
                placeholder="Contoh: Cerah, suhu 28°C"
                placeholderTextColor={placeholderColor}
                value={reportForm.weatherNotes}
                onChangeText={(val) =>
                  setReportForm({ ...reportForm, weatherNotes: val })
                }
              />
            </View>
          </View>
        )}

        {/* Form Rekomendasi Produk */}
        {!isCompleted && (
          <View
            style={[
              styles.section,
              { backgroundColor: cardBg, borderColor: border },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: tint + "20",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <IconSymbol name="bag.fill" size={18} color={tint} />
                </View>
                <ThemedText type="subtitle">Rekomendasi Produk</ThemedText>
              </View>
              <Pressable
                style={{
                  backgroundColor: tint,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
                onPress={addRecommendation}
              >
                <IconSymbol name="plus" size={14} color="#fff" />
                <ThemedText
                  style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}
                >
                  Tambah
                </ThemedText>
              </Pressable>
            </View>

            {recommendations.length === 0 ? (
              <ThemedText style={{ color: muted, fontStyle: "italic" }}>
                Belum ada rekomendasi produk
              </ThemedText>
            ) : (
              recommendations.map((rec, idx) => (
                <View
                  key={idx}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: border,
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <ThemedText style={{ fontWeight: "600" }}>
                      Produk #{idx + 1}
                    </ThemedText>
                    <Pressable onPress={() => removeRecommendation(idx)}>
                      <ThemedText style={{ color: "#EF4444" }}>
                        Hapus
                      </ThemedText>
                    </Pressable>
                  </View>

                  <View style={styles.fieldGroup}>
                    <ThemedText style={styles.labelSmall}>
                      Nama Produk *
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.inputSmall,
                        {
                          backgroundColor: inputBg,
                          color: text,
                          borderColor: border,
                        },
                      ]}
                      placeholder="Ketik nama produk"
                      placeholderTextColor={placeholderColor}
                      value={rec.product_name}
                      onChangeText={(val) =>
                        updateRecommendation(idx, "product_name", val)
                      }
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <ThemedText style={styles.labelSmall}>Fungsi *</ThemedText>
                    <TextInput
                      style={[
                        styles.inputSmall,
                        {
                          backgroundColor: inputBg,
                          color: text,
                          borderColor: border,
                        },
                      ]}
                      placeholder="Contoh: Fungisida"
                      placeholderTextColor={placeholderColor}
                      value={rec.function}
                      onChangeText={(val) =>
                        updateRecommendation(idx, "function", val)
                      }
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <ThemedText style={styles.labelSmall}>Dosis *</ThemedText>
                    <TextInput
                      style={[
                        styles.inputSmall,
                        {
                          backgroundColor: inputBg,
                          color: text,
                          borderColor: border,
                        },
                      ]}
                      placeholder="Contoh: 2 ml/liter"
                      placeholderTextColor={placeholderColor}
                      value={rec.dosage}
                      onChangeText={(val) =>
                        updateRecommendation(idx, "dosage", val)
                      }
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <ThemedText style={styles.labelSmall}>
                      Estimasi Kebutuhan (Qty) *
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.inputSmall,
                        {
                          backgroundColor: inputBg,
                          color: text,
                          borderColor: border,
                        },
                      ]}
                      placeholder="Contoh: 10 liter"
                      placeholderTextColor={placeholderColor}
                      value={rec.estimated_qty}
                      onChangeText={(val) =>
                        updateRecommendation(idx, "estimated_qty", val)
                      }
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <ThemedText style={styles.labelSmall}>Urgensi *</ThemedText>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Pressable
                        style={[
                          styles.urgencyBtn,
                          { borderColor: border },
                          rec.urgency === "terjadwal" && {
                            backgroundColor: tint,
                            borderColor: tint,
                          },
                        ]}
                        onPress={() =>
                          updateRecommendation(idx, "urgency", "terjadwal")
                        }
                      >
                        <ThemedText
                          style={[
                            { fontSize: 13 },
                            rec.urgency === "terjadwal"
                              ? { color: "#fff", fontWeight: "600" }
                              : { color: text },
                          ]}
                        >
                          Terjadwal
                        </ThemedText>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.urgencyBtn,
                          { borderColor: border },
                          rec.urgency === "segera" && {
                            backgroundColor: "#EF4444",
                            borderColor: "#EF4444",
                          },
                        ]}
                        onPress={() =>
                          updateRecommendation(idx, "urgency", "segera")
                        }
                      >
                        <ThemedText
                          style={[
                            { fontSize: 13 },
                            rec.urgency === "segera"
                              ? { color: "#fff", fontWeight: "600" }
                              : { color: text },
                          ]}
                        >
                          Segera
                        </ThemedText>
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.fieldGroup}>
                    <ThemedText style={styles.labelSmall}>
                      Alternatif Produk (Opsional)
                    </ThemedText>
                    <TextInput
                      style={[
                        styles.inputSmall,
                        {
                          backgroundColor: inputBg,
                          color: text,
                          borderColor: border,
                        },
                      ]}
                      placeholder="Produk pengganti"
                      placeholderTextColor={placeholderColor}
                      value={rec.alternative_products || ""}
                      onChangeText={(val) =>
                        updateRecommendation(idx, "alternative_products", val)
                      }
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Validation Error */}
        {validationError && (
          <View
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#FEE2E2",
              borderRadius: 8,
            }}
          >
            <ThemedText style={{ color: "#DC2626", fontSize: 14 }}>
              {validationError}
            </ThemedText>
          </View>
        )}

        {/* Save Button */}
        {!isCompleted && (
          <Pressable
            style={[
              {
                backgroundColor: success,
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: "center",
                marginBottom: 32,
              },
              saving && { opacity: 0.6 },
            ]}
            onPress={handleSaveReport}
            disabled={saving}
          >
            <ThemedText
              style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}
            >
              {saving ? "Menyimpan..." : "Simpan Laporan"}
            </ThemedText>
          </Pressable>
        )}

        {/* Display Report if Completed */}
        {isCompleted && visit.report && (
          <>
            <View
              style={[
                styles.section,
                { backgroundColor: cardBg, borderColor: border },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: success + "20",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <IconSymbol name="doc.text.fill" size={18} color={success} />
                </View>
                <ThemedText type="subtitle">Laporan Kondisi Kebun</ThemedText>
              </View>

              <View style={{ gap: 10 }}>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>
                    Jenis Tanaman
                  </ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {visit.report.plant_type}
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>
                    Umur Tanaman
                  </ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {visit.report.plant_age}
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Luas Lahan</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {visit.report.land_area} ha
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>
                    Masalah Ditemukan
                  </ThemedText>
                  <ThemedText
                    style={[styles.detailValue, { flex: 1, textAlign: "left" }]}
                  >
                    {visit.report.problems}
                  </ThemedText>
                </View>
                {visit.report.gps_latitude && visit.report.gps_longitude && (
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>
                      Koordinat GPS
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {visit.report.gps_latitude}, {visit.report.gps_longitude}
                    </ThemedText>
                  </View>
                )}
                {visit.report.weather_notes && (
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>
                      Kondisi Cuaca
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {visit.report.weather_notes}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>

            {visit.recommendations && visit.recommendations.length > 0 && (
              <View
                style={[
                  styles.section,
                  { backgroundColor: cardBg, borderColor: border },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: tint + "20",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <IconSymbol name="bag.fill" size={18} color={tint} />
                  </View>
                  <ThemedText type="subtitle">Rekomendasi Produk</ThemedText>
                  <View
                    style={{
                      marginLeft: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 10,
                      backgroundColor: tint + "20",
                    }}
                  >
                    <ThemedText
                      style={{ fontSize: 12, fontWeight: "600", color: tint }}
                    >
                      {visit.recommendations.length}
                    </ThemedText>
                  </View>
                </View>
                {visit.recommendations.map((rec, idx) => (
                  <View
                    key={rec.id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: border,
                      marginBottom: 10,
                      backgroundColor: inputBg,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          backgroundColor: tint,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 8,
                        }}
                      >
                        <ThemedText
                          style={{
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: "700",
                          }}
                        >
                          {idx + 1}
                        </ThemedText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText
                          style={{
                            fontSize: 15,
                            fontWeight: "600",
                            marginBottom: 4,
                          }}
                        >
                          {rec.product_name}
                        </ThemedText>
                      </View>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 6,
                        alignSelf: "flex-start",
                        backgroundColor:
                          rec.urgency === "segera" ? "#EF444420" : "#3B82F620",
                      }}
                    >
                      <ThemedText
                        style={{
                          fontSize: 11,
                          fontWeight: "600",
                          color:
                            rec.urgency === "segera" ? "#EF4444" : "#3B82F6",
                        }}
                      >
                        {rec.urgency === "segera" ? "SEGERA" : "TERJADWAL"}
                      </ThemedText>
                    </View>

                    <View style={{ gap: 6, marginTop: 8 }}>
                      <View style={{ flexDirection: "row" }}>
                        <ThemedText
                          style={{ color: muted, fontSize: 13, width: 80 }}
                        >
                          Fungsi
                        </ThemedText>
                        <ThemedText
                          style={{ color: text, fontSize: 13, flex: 1 }}
                        >
                          : {rec.function}
                        </ThemedText>
                      </View>
                      <View style={{ flexDirection: "row" }}>
                        <ThemedText
                          style={{ color: muted, fontSize: 13, width: 80 }}
                        >
                          Dosis
                        </ThemedText>
                        <ThemedText
                          style={{ color: text, fontSize: 13, flex: 1 }}
                        >
                          : {rec.dosage}
                        </ThemedText>
                      </View>
                      <View style={{ flexDirection: "row" }}>
                        <ThemedText
                          style={{ color: muted, fontSize: 13, width: 80 }}
                        >
                          Kebutuhan
                        </ThemedText>
                        <ThemedText
                          style={{ color: text, fontSize: 13, flex: 1 }}
                        >
                          : {rec.estimated_qty}
                        </ThemedText>
                      </View>
                      {rec.alternative_products && (
                        <View style={{ flexDirection: "row" }}>
                          <ThemedText
                            style={{ color: muted, fontSize: 13, width: 80 }}
                          >
                            Alternatif
                          </ThemedText>
                          <ThemedText
                            style={{ color: text, fontSize: 13, flex: 1 }}
                          >
                            : {rec.alternative_products}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    opacity: 0.5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  detailLabel: {
    fontSize: 13,
    color: "#6B7280",
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  fieldGroup: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  labelSmall: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  inputSmall: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  inputMulti: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
  urgencyBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
