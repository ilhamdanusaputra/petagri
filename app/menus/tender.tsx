import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function TenderMenu() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">TENDER & PENAWARAN</ThemedText>
      <ThemedText>Halaman tender dan pengelolaan penawaran.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
