import MapAreaView from '@/components/map-area-view';
import ScheduleCalendar from '@/components/schedule-calendar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
    const cardBg = useThemeColor({}, 'card');
    const border = useThemeColor({}, 'cardBorder');
    const text = useThemeColor({ light: '#1F2937', dark: '#F3F4F6' }, 'text');
    const muted = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'icon');
    const tint = useThemeColor({}, 'tint');
    const accent = useThemeColor({}, 'accent');
    const success = useThemeColor({}, 'success');
    const danger = useThemeColor({}, 'danger');

    return (
        <ThemedView style={[styles.container, { backgroundColor: bg }]}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View style={[styles.header, { backgroundColor: cardBg, borderColor: border }]}>
                    <ThemedText type="title" style={{ marginBottom: 6 }}>{kebun.name}</ThemedText>
                    <ThemedText style={{ color: kebun.status === 'Aktif' ? success : danger }}>{kebun.status}</ThemedText>
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

                        <MapAreaView
                            height={200}
                            coordinates={[
                                [-6.895747, 107.618634],
                                [-6.896200, 107.619200],
                                [-6.896700, 107.618000],
                                [-6.896000, 107.617500],
                            ]}
                        />
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
                    <ThemedText type="subtitle" style={{ marginBottom: 8 }}>Jadwal Kunjungan</ThemedText>

                        {(() => {
                            const upcoming = [
                                { id: 's1', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), note: 'Pemeriksaan umum' },
                                { id: 's2', date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), note: 'Pemupukan' },
                                { id: 's3', date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), note: 'Panen kecil' },
                            ];
                            const [showCalendar, setShowCalendar] = useState(false);
                            return (
                                <View style={{ gap: 10 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <ThemedText style={{ color: muted }}>Menampilkan {upcoming.length} jadwal terdekat</ThemedText>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            <Pressable
                                                style={[styles.actionBtn, { backgroundColor: tint, marginRight: 8 }]}
                                                onPress={() => router.push(`./${kebun.id}/schedule/new`)}
                                            >
                                                <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Tambah Jadwal</ThemedText>
                                            </Pressable>
                                            <Pressable
                                                style={[
                                                    styles.actionBtn,
                                                    showCalendar ? { backgroundColor: tint } : { backgroundColor: cardBg, borderWidth: 1, borderColor: border },
                                                ]}
                                                onPress={() => setShowCalendar((s) => !s)}
                                            >
                                                <ThemedText style={{ color: showCalendar ? '#fff' : text, fontWeight: '600' }}>{showCalendar ? 'List' : 'Kalender'}</ThemedText>
                                            </Pressable>
                                        </View>
                                    </View>

                                    {showCalendar ? (
                                        <ScheduleCalendar events={upcoming.map((s) => ({ id: s.id, date: s.date, note: s.note }))} />
                                    ) : (
                                        upcoming.map((s) => (
                                            <Pressable
                                                key={s.id}
                                                style={[{ flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, borderWidth: 1 }, { backgroundColor: cardBg, borderColor: border }]}
                                                onPress={() =>
                                                    Alert.alert(
                                                        'Detail Jadwal',
                                                        `${s.note}\nTanggal: ${s.date.toLocaleDateString('id-ID')}\nKebun: ${kebun.name}`,
                                                        [{ text: 'Tutup' }]
                                                    )
                                                }
                                            >
                                                <View style={{ width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                                    <IconSymbol name="book" size={18} color={text} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <ThemedText style={{ color: text, fontWeight: '600' }}>{s.date.toLocaleDateString('id-ID')}</ThemedText>
                                                    <ThemedText style={{ color: muted }}>{s.note}</ThemedText>
                                                </View>
                                                <Pressable onPress={() => Alert.alert('Aksi', 'Edit / Hapus (dummy)')} style={{ padding: 6 }}>
                                                    <IconSymbol name="chevron.right" size={18} color={muted} />
                                                </Pressable>
                                            </Pressable>
                                        ))
                                    )}
                                </View>
                            );
                        })()}
                </View>
                <View style={[styles.section, { backgroundColor: cardBg, borderColor: border }]}>
                    <ThemedText type="subtitle" style={{ marginBottom: 8 }}>Aksi</ThemedText>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable style={[styles.actionBtn, { backgroundColor: tint }]} onPress={() => router.push(`./${kebun.id}/edit`)}>
                            <IconSymbol name="gear" size={16} color="#fff" />
                        </Pressable>
                        <Pressable style={[styles.actionBtn, { backgroundColor: accent }]} onPress={() => router.push(`./${kebun.id}/visits`)}>
                            <IconSymbol name="book" size={16} color="#fff" />
                        </Pressable>
                        <Pressable style={[styles.actionBtn, { backgroundColor: kebun.status === 'Aktif' ? danger : success }]} onPress={() => { /* toggle */ }}>
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
    header: {
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 12,
        // subtle elevation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1,
    },
    section: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 12,
        backgroundColor: 'transparent',
        // soft separation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    geoCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, borderWidth: 1, backgroundColor: 'transparent' },
    geoLeft: { width: 44, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    geoBody: { flex: 1 },
});
