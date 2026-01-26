import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { StyleSheet } from "react-native";

export default function TenderOffering() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Tender Offering</ThemedText>
      <ThemedText>
        Halaman untuk mengelola penawaran dan dokumen tender.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
