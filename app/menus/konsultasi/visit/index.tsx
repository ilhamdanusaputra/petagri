import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useKebun } from '@/hooks/use-kebun';
import { useKonsultan } from '@/hooks/use-konsultan';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useVisit } from '@/hooks/use-visit';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

export default function VisitManager() {
  const router = useRouter();
  const { visits, loading, error, fetchVisits, createVisit, updateVisitStatus } = useVisit();
  const { kebuns, fetchKebuns } = useKebun();
  const { konsultans, fetchKonsultans } = useKonsultan();
  const cardBg = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'cardBorder');
  const muted = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'icon');

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [farmId, setFarmId] = useState('');
  const [consultantId, setConsultantId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchKebuns();
    fetchKonsultans();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFarmId('');
    setConsultantId('');
    setScheduledDate('');
    setModalVisible(true);
  };

  const openEdit = (v: any) => {
    setEditing(v);
    setFarmId(v.farm_id);
    setConsultantId(v.consultant_id);
    setScheduledDate(v.scheduled_date?.slice(0, 10) || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!farmId || !consultantId || !scheduledDate) {
      Alert.alert('Validasi', 'Semua field harus diisi');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from('visits')
          .update({ farm_id: farmId, consultant_id: consultantId, scheduled_date: scheduledDate })
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const res = await createVisit({ farm_id: farmId, consultant_id: consultantId, scheduled_date: scheduledDate });
        if (!res.success) throw new Error(res.error || 'Gagal membuat jadwal');
      }

      await fetchVisits();
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Hapus', 'Yakin ingin menghapus jadwal ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('visits').delete().eq('id', id);
            if (error) throw error;
            await fetchVisits();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Gagal menghapus');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
      onPress={() => openEdit(item)}
      onLongPress={() =>
        Alert.alert(item.farm_name || 'Kunjungan', undefined, [
          { text: 'Batal', style: 'cancel' },
          { text: 'Mark Completed', onPress: () => updateVisitStatus(item.id, 'completed') },
          { text: 'Cancel', onPress: () => updateVisitStatus(item.id, 'cancelled') },
          { text: 'Hapus', style: 'destructive', onPress: () => handleDelete(item.id) },
        ])
      }>
      <View style={styles.cardLeft}>
        <ThemedText style={[styles.cardTitle]}>{item.farm_name}</ThemedText>
        <ThemedText style={{ color: muted, fontSize: 13 }}>{item.consultant_name}</ThemedText>
        <ThemedText style={{ color: muted, fontSize: 13 }}>{item.scheduled_date?.slice(0, 16)}</ThemedText>
      </View>
      <View style={styles.cardRight}>
        <IconSymbol name={item.status === 'scheduled' ? 'calendar' : item.status === 'completed' ? 'checkmark' : 'xmark'} size={18} color={muted} />
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
    // ensure visits refreshed when kebun/konsultan change
    fetchVisits();
  }, [kebuns.length, konsultans.length]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow as any}>
        <ThemedText type="title">Kelola Jadwal Kunjungan</ThemedText>
        <Pressable style={[styles.addButton, { backgroundColor: '#1B5E20' }]} onPress={openCreate}>
          <IconSymbol name="calendar" size={18} color="#fff" />
        </Pressable>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1B5E20" />
        </View>
      ) : error ? (
        <ThemedText style={{ color: '#EF4444' }}>Error: {error}</ThemedText>
      ) : visits.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <IconSymbol name="calendar" size={48} color={muted} />
          <ThemedText style={{ marginTop: 12, color: muted }}>Belum ada jadwal kunjungan</ThemedText>
        </View>
      ) : (
        <FlatList data={visits} keyExtractor={(i: any) => i.id} renderItem={renderItem} />
      )}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <ThemedView style={{ flex: 1, padding: 16 }}>
          <View style={styles.headerRow as any}>
            <ThemedText type="title">{editing ? 'Edit Kunjungan' : 'Tambah Kunjungan'}</ThemedText>
            <Pressable onPress={() => setModalVisible(false)}>
              <ThemedText style={{ color: '#0a7ea4' }}>Tutup</ThemedText>
            </Pressable>
          </View>

          <View style={{ height: 12 }} />

          <ThemedText>Petani / Kebun</ThemedText>
          <Pressable style={[styles.input, { borderColor: border }]} onPress={() => {
            // cycle through kebuns for quick pick
            const ids = kebuns.map((k: any) => k.id);
            const idx = ids.indexOf(farmId);
            const next = ids[(idx + 1) % Math.max(1, ids.length)];
            setFarmId(next || '');
          }}>
            <ThemedText>{kebunMap[farmId]?.name || 'Pilih kebun (ketuk untuk memilih)'}</ThemedText>
          </Pressable>

          <ThemedText style={{ marginTop: 8 }}>Konsultan</ThemedText>
          <Pressable style={[styles.input, { borderColor: border }]} onPress={() => {
            const ids = konsultans.map((k: any) => k.id);
            const idx = ids.indexOf(consultantId);
            const next = ids[(idx + 1) % Math.max(1, ids.length)];
            setConsultantId(next || '');
          }}>
            <ThemedText>{konsMap[consultantId]?.full_name || 'Pilih konsultan (ketuk untuk memilih)'}</ThemedText>
          </Pressable>

          <ThemedText style={{ marginTop: 8 }}>Tanggal (YYYY-MM-DD)</ThemedText>
          <TextInput style={[styles.input, { borderColor: border }]} value={scheduledDate} onChangeText={setScheduledDate} placeholder="2026-01-31" />

          <View style={{ height: 12 }} />
          <Pressable style={[styles.saveButton, { backgroundColor: '#1B5E20' }]} onPress={handleSave} disabled={saving}>
            <ThemedText style={{ color: '#fff', fontWeight: '600' }}>{saving ? 'Menyimpan...' : 'Simpan'}</ThemedText>
          </Pressable>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addButton: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  cardLeft: { flex: 1 },
  cardRight: { alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 6 },
  saveButton: { padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
});
