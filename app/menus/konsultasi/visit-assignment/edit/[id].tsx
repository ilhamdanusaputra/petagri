import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useKebun } from "@/hooks/use-kebun";
import { useKonsultan } from "@/hooks/use-konsultan";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useVisit } from "@/hooks/use-visit";
import { supabase } from "@/utils/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

export default function EditVisitPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { getVisitById, fetchVisits } = useVisit();
  const { kebuns, fetchKebuns } = useKebun();
  const { konsultans, fetchKonsultans } = useKonsultan();

  const id = params?.id as string;

  const cardBg = useThemeColor({}, "card");
  const border = useThemeColor({}, "cardBorder");
  const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visit, setVisit] = useState<any | null>(null);

  const [farmId, setFarmId] = useState("");
  const [consultantId, setConsultantId] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState<Date>(new Date());
  const [showFarmPicker, setShowFarmPicker] = useState(false);
  const [showConsultantPicker, setShowConsultantPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    fetchKebuns();
    fetchKonsultans();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const res = await getVisitById(id);
      if (res.success && res.data) {
        setVisit(res.data);
        setFarmId(res.data.farm_id);
        setConsultantId(res.data.consultant_id);
        try {
          const d = res.data.scheduled_date
            ? new Date(res.data.scheduled_date)
            : new Date();
          setScheduledDate(d);
          setScheduledTime(d);
        } catch {
          setScheduledDate(new Date());
          setScheduledTime(new Date());
        }
      } else {
        Alert.alert("Error", res.error || "Gagal memuat kunjungan");
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const kebunMap = useMemo(() => {
    const m: Record<string, any> = {};
    kebuns.forEach((k) => (m[k.id] = k));
    return m;
  }, [kebuns]);

  const konsMap = useMemo(() => {
    const m: Record<string, any> = {};
    konsultans.forEach((k) => (m[k.id] = k));
    return m;
  }, [konsultans]);

  const handleSave = async () => {
    if (!farmId || !consultantId || !scheduledDate) {
      Alert.alert("Validasi", "Semua field harus diisi");
      return;
    }

    const dateStr = scheduledDate.toISOString().split("T")[0];
    const timeStr = scheduledTime.toTimeString().split(" ")[0];
    const scheduledDateTime = `${dateStr}T${timeStr}`;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("visits")
        .update({
          farm_id: farmId,
          consultant_id: consultantId,
          scheduled_date: scheduledDateTime,
        })
        .eq("id", id);
      if (error) throw error;
      await fetchVisits();
      router.replace("/menus/konsultasi/visit-assignment");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Hapus", "Yakin ingin menghapus jadwal ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("visits")
              .delete()
              .eq("id", id);
            if (error) throw error;
            await fetchVisits();
            router.replace("/menus/konsultasi/visit-assignment");
          } catch (err: any) {
            Alert.alert("Error", err.message || "Gagal menghapus");
          }
        },
      },
    ]);
  };

  if (loading)
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#1B5E20" />
      </ThemedView>
    );

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <Stack.Screen options={{ title: "Edit Jadwal Kunjungan" }} />

      <ThemedText style={{ marginBottom: 8 }}>Petani / Kebun</ThemedText>
      <Pressable
        style={[styles.input, { borderColor: border }]}
        onPress={() => setShowFarmPicker(true)}
      >
        <ThemedText>{kebunMap[farmId]?.name || "Pilih kebun"}</ThemedText>
      </Pressable>

      {showFarmPicker && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: cardBg, borderColor: border },
          ]}
        >
          <FlatList
            data={kebuns}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.dropdownItem, { borderBottomColor: border }]}
                onPress={() => {
                  setFarmId(item.id);
                  setShowFarmPicker(false);
                }}
              >
                <ThemedText>{item.name}</ThemedText>
              </Pressable>
            )}
          />
        </View>
      )}

      <ThemedText style={{ marginTop: 8 }}>Konsultan</ThemedText>
      <Pressable
        style={[styles.input, { borderColor: border }]}
        onPress={() => setShowConsultantPicker(true)}
      >
        <ThemedText>
          {konsMap[consultantId]?.full_name || "Pilih konsultan"}
        </ThemedText>
      </Pressable>

      {showConsultantPicker && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: cardBg, borderColor: border },
          ]}
        >
          <FlatList
            data={konsultans}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.dropdownItem, { borderBottomColor: border }]}
                onPress={() => {
                  setConsultantId(item.id);
                  setShowConsultantPicker(false);
                }}
              >
                <ThemedText>{item.full_name || item.email}</ThemedText>
              </Pressable>
            )}
          />
        </View>
      )}

      <ThemedText style={{ marginTop: 8 }}>Tanggal</ThemedText>
      {Platform.OS === "web" ? (
        <input
          type="date"
          value={scheduledDate.toISOString().split("T")[0]}
          onChange={(e: any) => {
            const v = e?.target?.value;
            if (v) {
              const d = new Date(v);
              if (!isNaN(d.getTime())) setScheduledDate(d);
            }
          }}
          style={Object.assign({}, styles.input as any, {
            borderColor: border,
          })}
        />
      ) : (
        <>
          <Pressable
            style={[
              styles.input,
              { borderColor: border, justifyContent: "center" },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText>{scheduledDate.toISOString().split("T")[0]}</ThemedText>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={scheduledDate}
              mode="date"
              display="default"
              onChange={(_, d) => {
                setShowDatePicker(false);
                if (d) setScheduledDate(d);
              }}
            />
          )}
        </>
      )}

      <ThemedText style={{ marginTop: 8 }}>Waktu</ThemedText>
      {Platform.OS === "web" ? (
        <input
          type="time"
          value={scheduledTime.toTimeString().split(" ")[0].substring(0, 5)}
          onChange={(e: any) => {
            const v = e?.target?.value;
            if (v && v.length === 5) {
              const [h, m] = v.split(":");
              const hh = parseInt(h, 10);
              const mm = parseInt(m, 10);
              if (!isNaN(hh) && !isNaN(mm)) {
                const nd = new Date();
                nd.setHours(hh);
                nd.setMinutes(mm);
                setScheduledTime(nd);
              }
            }
          }}
          style={Object.assign({}, styles.input as any, {
            borderColor: border,
          })}
        />
      ) : (
        <>
          <Pressable
            style={[
              styles.input,
              { borderColor: border, justifyContent: "center" },
            ]}
            onPress={() => setShowTimePicker(true)}
          >
            <ThemedText>
              {scheduledTime.toTimeString().split(" ")[0].substring(0, 5)}
            </ThemedText>
          </Pressable>
          {showTimePicker && (
            <DateTimePicker
              value={scheduledTime}
              mode="time"
              display="default"
              onChange={(_, d) => {
                setShowTimePicker(false);
                if (d) setScheduledTime(d);
              }}
            />
          )}
        </>
      )}

      <View style={{ height: 12 }} />
      <Pressable
        style={[styles.saveButton, { backgroundColor: "#1B5E20" }]}
        onPress={handleSave}
        disabled={saving}
      >
        <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
          {saving ? "Menyimpan..." : "Simpan"}
        </ThemedText>
      </Pressable>
      <View style={{ height: 8 }} />
      <Pressable
        style={[styles.saveButton, { backgroundColor: "#EF4444" }]}
        onPress={handleDelete}
      >
        <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
          Hapus
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 6 },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  dropdown: { borderRadius: 8, borderWidth: 1, maxHeight: 240, marginTop: 8 },
  dropdownItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
  },
});
