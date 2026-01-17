import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function LaporanMenu() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">LAPORAN & ANALITIK</ThemedText>
      <ThemedText>Halaman laporan, grafik, dan analitik.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
