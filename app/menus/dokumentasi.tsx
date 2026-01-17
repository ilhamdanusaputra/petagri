import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function DokumentasiMenu() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">DOKUMENTASI</ThemedText>
      <ThemedText>Halaman dokumentasi dan referensi.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
