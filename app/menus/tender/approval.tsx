import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { StyleSheet } from "react-native";

export default function TenderApproval() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Tender Approval</ThemedText>
      <ThemedText>
        Halaman untuk meninjau dan menyetujui penawaran tender.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
});
