import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function KeuanganMenu() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">KEUANGAN</ThemedText>
      <ThemedText>Halaman keuangan dan pembukuan.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
