import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function PenjualanMenu() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">PENJUALAN</ThemedText>
      <ThemedText>Halaman penjualan dan pesanan.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
