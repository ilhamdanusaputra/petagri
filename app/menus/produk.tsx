import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function ProdukMenu() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">PRODUK & TOKO</ThemedText>
      <ThemedText>Halaman manajemen produk dan toko.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
