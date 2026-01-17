import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export type MenuGridItem = {
  key: string;
  label: string;
  icon: string;
  onPress?: () => void;
};

export function MenuGrid({ items }: { items: MenuGridItem[] }) {
  const router = useRouter();
  const iconColor = useThemeColor({}, 'tint');
  const iconBg = useThemeColor({ light: '#E6F4FE', dark: '#111827' }, 'card');
  const labelColor = useThemeColor({}, 'text');
  return (
    <View style={styles.container}>
      {items.map((it) => (
        <Pressable
          key={it.key}
          style={styles.tile}
          onPress={it.onPress ?? (() => router.push('/menus'))}
        >
          <View style={styles.iconWrap}>
            <IconSymbol name={it.icon as any} size={28} color={iconColor} />
          </View>
          <ThemedText type="default" style={[styles.label, { color: labelColor }]}>
            {it.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  tile: {
    width: '25%', // 4 columns
    padding: 8,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E6F4FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    textAlign: 'center',
    fontSize: 12,
  },
});
