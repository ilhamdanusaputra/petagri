import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

const ITEMS = [
  {
    id: "assignment",
    title: "Tender Assignment",
    subtitle: "Buat dan atur penugasan tender",
    icon: "🗂️",
  },
  {
    id: "offering",
    title: "Tender Offering",
    subtitle: "Kelola penawaran dan dokumen",
    icon: "📝",
  },
  {
    id: "approval",
    title: "Tender Approval",
    subtitle: "Tinjau dan setujui penawaran",
    icon: "✅",
  },
];

function Card({ item }: { item: (typeof ITEMS)[number] }) {
  return (
    <Pressable
      onPress={() => console.log("Tapped", item.id)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.iconWrap}>
        <ThemedText style={styles.iconText}>{item.icon}</ThemedText>
      </View>
      <View style={styles.cardContent}>
        <ThemedText type="title">{item.title}</ThemedText>
        <ThemedText style={styles.subtitle}>{item.subtitle}</ThemedText>
      </View>
      <ThemedText style={styles.chev}>›</ThemedText>
    </Pressable>
  );
}

export default function TenderMenu() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">TENDER & PENAWARAN</ThemedText>
      <ThemedText>Halaman tender dan pengelolaan penawaran.</ThemedText>

      <View style={styles.list}>
        {ITEMS.map((it) => (
          <Card key={it.id} item={it} />
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  list: { marginTop: 8, gap: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  cardPressed: { opacity: 0.8 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  iconText: { fontSize: 22 },
  cardContent: { flex: 1 },
  subtitle: { fontSize: 13, color: "rgba(0,0,0,0.6)", marginTop: 2 },
  chev: { fontSize: 20, color: "rgba(0,0,0,0.35)" },
});
