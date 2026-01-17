import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

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

export default function KebunList() {
  const router = useRouter();
  const cardBg = useThemeColor({}, 'card');
  const border = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'cardBorder');
  const text = useThemeColor({ light: '#1F2937', dark: '#F3F4F6' }, 'text');
  const muted = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'icon');

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="title">Kelola Kebun</ThemedText>
        <Pressable style={[styles.addButton, { backgroundColor: '#1B5E20' }]} onPress={() => router.push('./kebun/add')}>
          <IconSymbol name="leaf.fill" size={18} color="#fff" />
        </Pressable>
      </View>

      <ThemedText style={{ marginBottom: 8 }}>Daftar kebun dan ringkasan data. Ketuk nama untuk detail kebun.</ThemedText>

      <FlatList
        data={SAMPLE}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
            onPress={() => router.push(`./kebun/${item.id}`)}>
            <View style={styles.cardLeft}>
              <ThemedText style={[styles.cardTitle, { color: text }]}>{item.name}</ThemedText>
              <ThemedText style={{ color: muted }}>{item.location} • {item.commodity} • {item.areaHa} ha</ThemedText>
            </View>
            <View style={styles.cardRight}>
              <ThemedText style={{ color: item.status === 'Aktif' ? '#10B981' : '#EF4444' }}>{item.status}</ThemedText>
              <Pressable style={styles.smallButton} onPress={() => router.push(`./kebun/${item.id}/visits`)}>
                <ThemedText style={{ color: '#0a7ea4' }}>Riwayat</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addButton: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  cardLeft: { flex: 1 },
  cardRight: { alignItems: 'flex-end', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  smallButton: { marginTop: 6 },
});
