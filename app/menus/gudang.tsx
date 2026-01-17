import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function GudangMenu() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">GUDANG & STOK</ThemedText>
      <ThemedText>Halaman manajemen gudang dan persediaan.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
