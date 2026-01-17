import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function NotifikasiMenu() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">NOTIFIKASI & SISTEM</ThemedText>
      <ThemedText>Halaman pengaturan notifikasi dan sistem.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
