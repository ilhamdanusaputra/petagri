import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function DistribusiMenu() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">DISTRIBUSI & LOGISTIK</ThemedText>
      <ThemedText>Halaman distribusi, pengiriman, dan logistik.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
