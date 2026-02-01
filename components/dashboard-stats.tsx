import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { supabase } from "@/utils/supabase";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

function StatCard({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number;
}) {
  return (
    <ThemedView style={styles.card}>
      <View style={styles.iconWrap}>
        <IconSymbol name={icon} size={22} color="#065F46" />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.statValue}>{value}</ThemedText>
        <ThemedText style={styles.statLabel}>{label}</ThemedText>
      </View>
    </ThemedView>
  );
}

export default function DashboardStats() {
  const [counts, setCounts] = useState({
    users: 0,
    farms: 0,
    konsultan: 0,
    mitra: 0,
    openTenders: 0,
    completedTenders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [usersRes, farmsRes, konsRes, mitraRes, openRes, completedRes] =
          await Promise.all([
            supabase
              .from("v_profiles")
              .select("id", { count: "exact", head: true }),
            supabase.from("farms").select("id", { count: "exact", head: true }),
            supabase
              .from("v_profiles")
              .select("id", { count: "exact", head: true })
              .contains("roles", ["konsultan"]),
            supabase
              .from("v_profiles")
              .select("id", { count: "exact", head: true })
              .contains("roles", ["mitra_toko"]),
            supabase
              .from("tender_assigns")
              .select("id", { count: "exact", head: true })
              .eq("status", "open"),
            supabase
              .from("tender_approves")
              .select("id", { count: "exact", head: true }),
          ]);

        setCounts({
          users: usersRes.count ?? 0,
          farms: farmsRes.count ?? 0,
          konsultan: konsRes.count ?? 0,
          mitra: mitraRes.count ?? 0,
          openTenders: openRes.count ?? 0,
          completedTenders: completedRes.count ?? 0,
        });
      } catch (err) {
        console.warn("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <StatCard icon={"person.fill"} label="Jumlah User" value={counts.users} />
      <StatCard icon={"leaf.fill"} label="Jumlah Kebun" value={counts.farms} />
      <StatCard
        icon={"person"}
        label="Jumlah Konsultan"
        value={counts.konsultan}
      />
      <StatCard icon={"bag.fill"} label="Jumlah Mitra" value={counts.mitra} />
      <StatCard icon={"gavel"} label="Open Tender" value={counts.openTenders} />
      <StatCard
        icon={"checkmark.circle.fill"}
        label="Tender Selesai"
        value={counts.completedTenders}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginHorizontal: -4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    marginBottom: 8,
    width: "48%",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  statValue: { fontWeight: "700", fontSize: 16 },
  statLabel: { color: "#6B7280", fontSize: 12, marginTop: 2 },
});
