import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

type Kebun = {
  id: string;
  name: string;
  location: string;
  commodity: string;
  areaHa: number;
  status: string;
};

const SAMPLE: Kebun[] = [
  { id: 'k1', name: 'Kebun Suka Maju', location: 'Kec. Lembang', commodity: 'Kopi', areaHa: 2.5, status: 'Aktif' },
  { id: 'k2', name: 'Kebun Makmur', location: 'Kec. Garut', commodity: 'Kakao', areaHa: 1.2, status: 'Aktif' },
  { id: 'k3', name: 'Kebun Sejahtera', location: 'Kec. Tasik', commodity: 'Teh', areaHa: 3.1, status: 'Nonaktif' },
];

export default function KebunDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = (params?.id as string) ?? 'k1';
  const kebun = SAMPLE.find((k) => k.id === id) ?? SAMPLE[0];

  const bg = useThemeColor({ light: '#F9FAFB', dark: '#111827' }, 'background');
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#1F2937' }, 'card');
  const border = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'cardBorder');
  const text = useThemeColor({ light: '#1F2937', dark: '#F3F4F6' }, 'text');
  const muted = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'icon');

  return (
    <ThemedView style={[styles.container, { backgroundColor: bg }]}> 
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={[styles.header, { backgroundColor: cardBg, borderColor: border }]}>
          <ThemedText type="title" style={{ marginBottom: 6 }}>{kebun.name}</ThemedText>
          <ThemedText style={{ color: kebun.status === 'Aktif' ? '#10B981' : '#EF4444' }}>{kebun.status}</ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
          <ThemedText type="subtitle" style={{ marginBottom: 8 }}>Detail Kebun</ThemedText>
          <View style={styles.row}><ThemedText style={{ color: muted }}>Lokasi</ThemedText><ThemedText style={{ color: text }}>{kebun.location}</ThemedText></View>
          <View style={styles.row}><ThemedText style={{ color: muted }}>Komoditas</ThemedText><ThemedText style={{ color: text }}>{kebun.commodity}</ThemedText></View>
          <View style={styles.row}><ThemedText style={{ color: muted }}>Luas</ThemedText><ThemedText style={{ color: text }}>{kebun.areaHa} ha</ThemedText></View>
        </View>

        <View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
          <ThemedText type="subtitle" style={{ marginBottom: 8 }}>Peta & Area (Geospasial)</ThemedText>
          <View style={{ gap: 12 }}>
            <Pressable
              style={[styles.geoCard, { backgroundColor: cardBg, borderColor: border }]}
              onPress={() => Alert.alert('Area Kebun (Dummy)', `Luas terdaftar: ${kebun.areaHa} ha\nPoligon contoh: [(lat1,lng1), (lat2,lng2), ...]`)}>
              <View style={styles.geoLeft}>
                <IconSymbol name="leaf.fill" size={20} color={text} />
              </View>
              <View style={styles.geoBody}>
                <ThemedText style={{ color: text, fontWeight: '600' }}>Area Kebun</ThemedText>
                <ThemedText style={{ color: muted }}>{kebun.areaHa} ha — Poligon dummy tersedia</ThemedText>
              </View>
            </Pressable>

            <Pressable
              style={[styles.geoCard, { backgroundColor: cardBg, borderColor: border }]}
              onPress={() => Alert.alert('Koordinat (Dummy)', 'Bounding box: [(-7.12,107.62), (-7.11,107.63)]')}
            >
              <View style={styles.geoLeft}>
                <IconSymbol name="book" size={20} color={text} />
              </View>
              <View style={styles.geoBody}>
                <ThemedText style={{ color: text, fontWeight: '600' }}>Koordinat</ThemedText>
                <ThemedText style={{ color: muted }}>Bounding box & centroid (dummy)</ThemedText>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
          <ThemedText type="subtitle" style={{ marginBottom: 8 }}>Aksi</ThemedText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable style={[styles.actionBtn, { backgroundColor: '#1B5E20' }]} onPress={() => router.push(`./${kebun.id}/edit`)}>
              <IconSymbol name="gear" size={16} color="#fff" />
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: '#0a7ea4' }]} onPress={() => router.push(`./${kebun.id}/visits`)}>
              <IconSymbol name="book" size={16} color="#fff" />
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: kebun.status === 'Aktif' ? '#EF4444' : '#10B981' }]} onPress={() => { /* toggle */ }}>
              <ThemedText style={{ color: '#fff', fontWeight: '600' }}>{kebun.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
          <ThemedText type="subtitle" style={{ marginBottom: 8 }}>Riwayat Kunjungan</ThemedText>
          <ThemedText style={{ color: muted }}>Belum ada data kunjungan. Tekan Riwayat untuk melihat catatan.</ThemedText>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  section: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  geoCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, borderWidth: 1 },
  geoLeft: { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  geoBody: { flex: 1 },
});
