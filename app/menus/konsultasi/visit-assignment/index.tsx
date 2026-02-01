import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { VisitStatusIcon } from "@/components/visit-status-icon";
import { useKebun } from "@/hooks/use-kebun";
import { useKonsultan } from "@/hooks/use-konsultan";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useVisit } from "@/hooks/use-visit";
import { supabase } from "@/utils/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

export default function VisitManager() {
  const router = useRouter();
  const {
    visits,
    loading,
    error,
    fetchVisits,
    createVisit,
    updateVisitStatus,
  } = useVisit();
  const { kebuns, fetchKebuns } = useKebun();
  const { konsultans, fetchKonsultans } = useKonsultan();
  const cardBg = useThemeColor({}, "card");
  const border = useThemeColor({}, "cardBorder");
  const muted = useThemeColor({ light: "#6B7280", dark: "#9CA3AF" }, "icon");
  const tint = useThemeColor({}, "tint");

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [farmId, setFarmId] = useState("");
  const [consultantId, setConsultantId] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState<Date>(new Date());
  const [showFarmPicker, setShowFarmPicker] = useState(false);
  const [showConsultantPicker, setShowConsultantPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchKebuns();
    fetchKonsultans();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFarmId("");
    setConsultantId("");
    setScheduledDate(new Date());
    setScheduledTime(new Date());
    setModalVisible(true);
  };

  const openEdit = (v: any) => {
    setEditing(v);
    setFarmId(v.farm_id);
    setConsultantId(v.consultant_id);
    try {
      const d = v.scheduled_date ? new Date(v.scheduled_date) : new Date();
      setScheduledDate(d);
      setScheduledTime(d);
    } catch {
      setScheduledDate(new Date());
      setScheduledTime(new Date());
    }
    setModalVisible(true);
  };

  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [menuModalPos, setMenuModalPos] = useState({ x: 0, y: 0 });
  const [menuModalItem, setMenuModalItem] = useState<any | null>(null);
  const menuActionRef = useRef(false);

  const windowWidth = Dimensions.get("window").width;

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
      if (editing) {
        const { error } = await supabase
          .from("visits")
          .update({
            farm_id: farmId,
            consultant_id: consultantId,
            scheduled_date: scheduledDateTime,
          })
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const res = await createVisit({
          farm_id: farmId,
          consultant_id: consultantId,
          scheduled_date: scheduledDateTime,
        });
        if (!res.success) throw new Error(res.error || "Gagal membuat jadwal");
      }

      await fetchVisits();
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
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
          } catch (err: any) {
            Alert.alert("Error", err.message || "Gagal menghapus");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
      onPress={() => {
        if (menuActionRef.current) {
          menuActionRef.current = false;
          return;
        }
        router.push(`/menus/konsultasi/visit-assignment/edit/${item.id}`);
      }}
      onLongPress={() =>
        Alert.alert(item.farm_name || "Kunjungan", undefined, [
          { text: "Batal", style: "cancel" },
          {
            text: "Mark Completed",
            onPress: () => updateVisitStatus(item.id, "completed"),
          },
          {
            text: "Cancel",
            onPress: () => updateVisitStatus(item.id, "cancelled"),
          },
          {
            text: "Hapus",
            style: "destructive",
            onPress: () => handleDelete(item.id),
          },
        ])
      }
    >
      <View style={styles.cardStatus}>
        <VisitStatusIcon status={item.status} />
      </View>

      <View style={styles.cardLeft}>
        <ThemedText style={[styles.cardTitle]}>{item.farm_name}</ThemedText>
        <ThemedText style={{ color: muted, fontSize: 13 }}>
          {item.consultant_name}
        </ThemedText>
        <ThemedText style={{ color: muted, fontSize: 13 }}>
          {item.scheduled_date?.slice(0, 16)}
        </ThemedText>
      </View>
      <View style={styles.cardRight}>
        <Pressable
          style={[styles.menuButton, { backgroundColor: cardBg }]}
          onPressIn={(e) => {
            // prevent parent onPress navigation
            menuActionRef.current = true;
            const { pageX, pageY } = e.nativeEvent;
            setMenuModalPos({ x: pageX, y: pageY });
            setMenuModalItem(item);
            setMenuModalVisible(true);
          }}
        >
          <IconSymbol name="list.bullet" size={18} color={muted} />
        </Pressable>
      </View>
    </Pressable>
  );

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

  useEffect(() => {
    fetchVisits();
  }, [kebuns.length, konsultans.length]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow as any}>
        <ThemedText type="title">Kelola Jadwal Kunjungan</ThemedText>
        <Pressable
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => router.push("/menus/konsultasi/visit-assignment/add")}
        >
          <IconSymbol name="calendar" size={16} color={tint} />
          <ThemedText style={{ color: tint, fontWeight: "600", marginLeft: 8 }}>
            Atur Jadwal Kunjungan
          </ThemedText>
        </Pressable>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#1B5E20" />
        </View>
      ) : error ? (
        <ThemedText style={{ color: "#EF4444" }}>Error: {error}</ThemedText>
      ) : visits.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <IconSymbol name="calendar" size={48} color={muted} />
          <ThemedText style={{ marginTop: 12, color: muted }}>
            Belum ada jadwal kunjungan
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(i: any) => i.id}
          renderItem={renderItem}
        />
      )}

      {/* Dropdown modal to avoid clipping by card/list */}
      <Modal
        visible={menuModalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={() => setMenuModalVisible(false)}
        >
          {menuModalItem && (
            <View
              style={[
                styles.menuDropdown,
                {
                  backgroundColor: cardBg,
                  borderColor: border,
                  left: Math.min(
                    Math.max(8, menuModalPos.x - 160 + 24),
                    windowWidth - 160 - 8,
                  ),
                  top: menuModalPos.y + 8,
                  position: "absolute",
                },
              ]}
            >
              <Pressable
                style={styles.menuItem}
                onPress={async () => {
                  try {
                    await updateVisitStatus(menuModalItem.id, "scheduled");
                    await fetchVisits();
                  } catch (err: any) {
                    Alert.alert(
                      "Error",
                      err.message || "Gagal mengubah status",
                    );
                  } finally {
                    setMenuModalVisible(false);
                  }
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <IconSymbol name="calendar" size={16} color={muted} />
                  <ThemedText style={{ marginLeft: 8 }}>Scheduled</ThemedText>
                </View>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={async () => {
                  try {
                    await updateVisitStatus(menuModalItem.id, "completed");
                    await fetchVisits();
                  } catch (err: any) {
                    Alert.alert(
                      "Error",
                      err.message || "Gagal mengubah status",
                    );
                  } finally {
                    setMenuModalVisible(false);
                  }
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={16}
                    color="#16A34A"
                  />
                  <ThemedText style={{ marginLeft: 8 }}>Completed</ThemedText>
                </View>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={async () => {
                  try {
                    await updateVisitStatus(menuModalItem.id, "cancelled");
                    await fetchVisits();
                  } catch (err: any) {
                    Alert.alert(
                      "Error",
                      err.message || "Gagal mengubah status",
                    );
                  } finally {
                    setMenuModalVisible(false);
                  }
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <IconSymbol
                    name="xmark.circle.fill"
                    size={16}
                    color="#EF4444"
                  />
                  <ThemedText style={{ marginLeft: 8, color: "#EF4444" }}>
                    Cancelled
                  </ThemedText>
                </View>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Modal>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={{ flex: 1, padding: 16 }}>
          <View style={styles.headerRow as any}>
            <ThemedText type="title">
              {editing ? "Edit Kunjungan" : "Tambah Kunjungan"}
            </ThemedText>
            <Pressable onPress={() => setModalVisible(false)}>
              <ThemedText style={{ color: "#0a7ea4" }}>Tutup</ThemedText>
            </Pressable>
          </View>

          <View style={{ height: 12 }} />

          <ThemedText>Petani / Kebun</ThemedText>
          <Pressable
            style={[styles.input, { borderColor: border }]}
            onPress={() => setShowFarmPicker(true)}
          >
            <ThemedText>
              {kebunMap[farmId]?.name || "Pilih kebun (ketuk untuk memilih)"}
            </ThemedText>
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
                keyExtractor={(item) => item.id}
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
              {konsMap[consultantId]?.full_name ||
                "Pilih konsultan (ketuk untuk memilih)"}
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
                keyExtractor={(item) => item.id}
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

          <ThemedText style={{ marginTop: 8 }}>Tanggal (YYYY-MM-DD)</ThemedText>
          {Platform.OS === "web" ? (
            <input
              type="date"
              value={scheduledDate.toISOString().split("T")[0]}
              onChange={(e: any) => {
                const text = e?.target?.value;
                if (text && text.length === 10) {
                  const d = new Date(text);
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
                <ThemedText>
                  {scheduledDate.toISOString().split("T")[0]}
                </ThemedText>
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

          <ThemedText style={{ marginTop: 8 }}>Waktu (HH:MM)</ThemedText>
          {Platform.OS === "web" ? (
            <input
              type="time"
              value={scheduledTime.toTimeString().split(" ")[0].substring(0, 5)}
              onChange={(e: any) => {
                const text = e?.target?.value;
                if (text && text.length === 5) {
                  const [h, m] = text.split(":");
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
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    overflow: "visible",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardLeft: { flex: 1 },
  cardStatus: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "600" },
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
  menuButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  menuDropdown: {
    position: "absolute",
    right: 8,
    top: 42,
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 140,
    zIndex: 9999,
    overflow: "visible",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    backgroundColor: "transparent",
  },
});
