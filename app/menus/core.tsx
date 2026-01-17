import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function CoreMenu() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">CORE</ThemedText>
      <ThemedText>Halaman fitur inti aplikasi.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
