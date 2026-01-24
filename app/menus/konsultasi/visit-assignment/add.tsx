import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useKebun } from "@/hooks/use-kebun";
import { useKonsultan } from "@/hooks/use-konsultan";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useVisit } from "@/hooks/use-visit";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

export default function AddVisit() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { createVisit } = useVisit();
  const { kebuns } = useKebun();
  const { konsultans } = useKonsultan();

  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showFarmPicker, setShowFarmPicker] = useState(false);
  const [showConsultantPicker, setShowConsultantPicker] = useState(false);

  const border = useThemeColor(
    { light: "#E5E7EB", dark: "#374151" },
    "cardBorder",
  );
  const text = useThemeColor({ light: "#1F2937", dark: "#F3F4F6" }, "text");
  const inputBg = useThemeColor(
    { light: "#F9FAFB", dark: "#1F2937" },
    "background",
  );
  const placeholderColor = useThemeColor(
    { light: "#9CA3AF", dark: "#6B7280" },
    "icon",
  );
  const cardBg = useThemeColor({}, "card");

  const [formData, setFormData] = useState({
    farmId: "",
    consultantId: "",
    scheduledDate: new Date(),
    scheduledTime: new Date(),
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Pre-fill farmId from query params
  useEffect(() => {
    if (params.farmId && typeof params.farmId === "string") {
      setFormData((prev) => ({ ...prev, farmId: params.farmId as string }));
    }
  }, [params.farmId]);

  const handleSave = async () => {
    setValidationError(null);

    if (!formData.farmId) {
      setValidationError("Pilih kebun");
      return;
    }
    if (!formData.consultantId) {
      setValidationError("Pilih konsultan");
      return;
    }

    // Combine date and time into ISO string
    const dateStr = formData.scheduledDate.toISOString().split("T")[0];
    const timeStr = formData.scheduledTime.toTimeString().split(" ")[0];
    const scheduledDateTime = `${dateStr}T${timeStr}`;

    setSaving(true);
    const result = await createVisit({
      farm_id: formData.farmId,
      consultant_id: formData.consultantId,
      scheduled_date: scheduledDateTime,
    });
    setSaving(false);

    if (result.success) {
      if (router.canGoBack()) {
        router.back();
        setTimeout(() => {
          // Use router.replace to force reload if needed
          router.replace(`/menus/konsultasi/kebun/${formData.farmId}/`);
        }, 100);
      } else {
        router.replace(`/menus/konsultasi/kebun/${formData.farmId}/`);
      }
    } else {
      setValidationError(result.error || "Gagal membuat jadwal");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Jadwalkan Kunjungan",
          headerBackTitle: "Tutup",
        }}
      />
      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Pilih Kebun */}
        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>Kebun *</ThemedText>
          <Pressable
            style={[
              styles.input,
              {
                backgroundColor: inputBg,
                borderColor: border,
                justifyContent: "center",
              },
            ]}
            onPress={() => setShowFarmPicker(true)}
          >
            <ThemedText
              style={{ color: formData.farmId ? text : placeholderColor }}
            >
              {formData.farmId
                ? kebuns.find((k) => k.id === formData.farmId)?.name
                : "-- Pilih Kebun --"}
            </ThemedText>
          </Pressable>
        </View>

        <Modal visible={showFarmPicker} transparent animationType="slide">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowFarmPicker(false)}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: cardBg, borderColor: border },
              ]}
            >
              <ThemedText style={styles.modalTitle}>Pilih Kebun</ThemedText>
              <FlatList
                data={kebuns}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={[styles.modalItem, { borderBottomColor: border }]}
                    onPress={() => {
                      setFormData({ ...formData, farmId: item.id });
                      setShowFarmPicker(false);
                    }}
                  >
                    <ThemedText style={{ color: text }}>{item.name}</ThemedText>
                  </Pressable>
                )}
              />
              <Pressable
                style={styles.modalClose}
                onPress={() => setShowFarmPicker(false)}
              >
                <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
                  Tutup
                </ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Pilih Konsultan */}
        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>Konsultan *</ThemedText>
          <Pressable
            style={[
              styles.input,
              {
                backgroundColor: inputBg,
                borderColor: border,
                justifyContent: "center",
              },
            ]}
            onPress={() => setShowConsultantPicker(true)}
          >
            <ThemedText
              style={{ color: formData.consultantId ? text : placeholderColor }}
            >
              {formData.consultantId
                ? konsultans.find((k) => k.id === formData.consultantId)
                    ?.full_name ||
                  konsultans.find((k) => k.id === formData.consultantId)?.email
                : "-- Pilih Konsultan --"}
            </ThemedText>
          </Pressable>
        </View>

        <Modal visible={showConsultantPicker} transparent animationType="slide">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowConsultantPicker(false)}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: cardBg, borderColor: border },
              ]}
            >
              <ThemedText style={styles.modalTitle}>Pilih Konsultan</ThemedText>
              <FlatList
                data={konsultans}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={[styles.modalItem, { borderBottomColor: border }]}
                    onPress={() => {
                      setFormData({ ...formData, consultantId: item.id });
                      setShowConsultantPicker(false);
                    }}
                  >
                    <ThemedText style={{ color: text }}>
                      {item.full_name || item.email}
                    </ThemedText>
                  </Pressable>
                )}
              />
              <Pressable
                style={styles.modalClose}
                onPress={() => setShowConsultantPicker(false)}
              >
                <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
                  Tutup
                </ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Tanggal */}
        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>Tanggal *</ThemedText>
          {Platform.OS === "web" ? (
            <input
              type="date"
              value={formData.scheduledDate.toISOString().split("T")[0]}
              onChange={(e: any) => {
                const value = e?.target?.value;
                if (value && value.length === 10) {
                  try {
                    const newDate = new Date(value);
                    if (!isNaN(newDate.getTime())) {
                      setFormData({ ...formData, scheduledDate: newDate });
                    }
                  } catch {
                    console.warn("Invalid date");
                  }
                }
              }}
              style={Object.assign({}, styles.input as any, {
                backgroundColor: inputBg,
                color: text,
                borderColor: border,
              })}
            />
          ) : (
            <>
              <Pressable
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBg,
                    borderColor: border,
                    justifyContent: "center",
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText>
                  {formData.scheduledDate.toISOString().split("T")[0]}
                </ThemedText>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.scheduledDate}
                  mode="date"
                  display="default"
                  onChange={(_, d) => {
                    setShowDatePicker(false);
                    if (d) setFormData({ ...formData, scheduledDate: d });
                  }}
                />
              )}
            </>
          )}
          <ThemedText
            style={{ color: placeholderColor, fontSize: 12, marginTop: 4 }}
          >
            Format: 2026-01-25
          </ThemedText>
        </View>

        {/* Waktu */}
        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>Waktu *</ThemedText>
          {Platform.OS === "web" ? (
            <input
              type="time"
              value={formData.scheduledTime
                .toTimeString()
                .split(" ")[0]
                .substring(0, 5)}
              onChange={(e: any) => {
                const value = e?.target?.value;
                if (value && value.length === 5) {
                  try {
                    const [hours, minutes] = value.split(":");
                    const h = parseInt(hours, 10);
                    const m = parseInt(minutes, 10);
                    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
                      const newTime = new Date();
                      newTime.setHours(h);
                      newTime.setMinutes(m);
                      setFormData({ ...formData, scheduledTime: newTime });
                    }
                  } catch {
                    console.warn("Invalid time");
                  }
                }
              }}
              style={Object.assign({}, styles.input as any, {
                backgroundColor: inputBg,
                color: text,
                borderColor: border,
              })}
            />
          ) : (
            <>
              <Pressable
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBg,
                    borderColor: border,
                    justifyContent: "center",
                  },
                ]}
                onPress={() => setShowTimePicker(true)}
              >
                <ThemedText>
                  {formData.scheduledTime
                    .toTimeString()
                    .split(" ")[0]
                    .substring(0, 5)}
                </ThemedText>
              </Pressable>
              {showTimePicker && (
                <DateTimePicker
                  value={formData.scheduledTime}
                  mode="time"
                  display="default"
                  onChange={(_, d) => {
                    setShowTimePicker(false);
                    if (d) setFormData({ ...formData, scheduledTime: d });
                  }}
                />
              )}
            </>
          )}
          <ThemedText
            style={{ color: placeholderColor, fontSize: 12, marginTop: 4 }}
          >
            Format 24 jam: 14:30
          </ThemedText>
        </View>

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

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.button,
              styles.cancelButton,
              { borderColor: border },
            ]}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.cancelButtonText}>Batal</ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.button,
              styles.saveButton,
              saving && { opacity: 0.6 },
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            <ThemedText style={styles.saveButtonText}>
              {saving ? "Menyimpan..." : "Simpan"}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    maxHeight: "70%",
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalClose: {
    backgroundColor: "#1B5E20",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 12, marginBottom: 32 },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: { borderWidth: 1, backgroundColor: "transparent" },
  cancelButtonText: { fontSize: 16, fontWeight: "600" },
  saveButton: { backgroundColor: "#1B5E20" },
  saveButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },
});
