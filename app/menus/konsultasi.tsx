import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function KonsultasiMenu() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">KONSULTASI & KEBUN</ThemedText>
      <ThemedText>Halaman untuk konsultasi dan manajemen kebun.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
