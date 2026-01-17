import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

type Konsultan = {
  id: string;
  name: string;
  active: boolean;
  region: string;
};

const SAMPLE: Konsultan[] = [
  { id: '1', name: 'Andi Setiawan', active: true, region: 'Kab. Bandung' },
  { id: '2', name: 'Siti Nur', active: true, region: 'Kab. Garut' },
  { id: '3', name: 'Budi Santoso', active: false, region: 'Kab. Tasikmalaya' },
];

export default function KonsultanList() {
  const router = useRouter();
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#1F2937' }, 'card');
  const border = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'cardBorder');
  const text = useThemeColor({ light: '#1F2937', dark: '#F3F4F6' }, 'text');
  const muted = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'icon');

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="title">Kelola Konsultan</ThemedText>
        <Pressable style={[styles.addButton, { backgroundColor: '#1B5E20' }]} onPress={() => router.push('./konsultan/add')}>
          <IconSymbol name="person.fill" size={18} color="#fff" />
        </Pressable>
      </View>

      <ThemedText style={{ marginBottom: 8 }}>Daftar konsultan lapangan. Ketuk untuk melihat detail atau akses aksi cepat.</ThemedText>

      <FlatList
        data={SAMPLE}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
            onPress={() => router.push(`./konsultan/${item.id}`)}>
            <View style={styles.cardLeft}>
              <ThemedText style={[styles.cardTitle, { color: text }]}>{item.name}</ThemedText>
              <ThemedText style={{ color: muted }}>{item.region}</ThemedText>
            </View>
            <View style={styles.cardRight}>
              <ThemedText style={{ color: item.active ? '#10B981' : '#EF4444' }}>{item.active ? 'Aktif' : 'Nonaktif'}</ThemedText>
              <Pressable style={styles.smallButton} onPress={() => router.push(`./konsultan/${item.id}/history`)}>
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
