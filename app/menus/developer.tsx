import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function DeveloperMenu() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">DEVELOPER TOOLS</ThemedText>
      <ThemedText>Alat dan utilitas untuk pengembang.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
