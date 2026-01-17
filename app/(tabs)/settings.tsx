import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useThemePreference } from '@/hooks/use-theme-preference';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function SettingsScreen() {
  const { colorScheme, userPreference, toggleTheme, setTheme, isLoading } = useThemePreference();
  
  const bgColor = useThemeColor({ light: '#F9FAFB', dark: '#111827' }, 'background');
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#1F2937' }, 'background');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'card');
  const primaryGreen = useThemeColor({ light: '#1B5E20', dark: '#81C784' }, 'tint');
  const textColor = useThemeColor({ light: '#1F2937', dark: '#F3F4F6' }, 'text');

  const handleThemeChange = (scheme: 'light' | 'dark' | null) => {
    setTheme(scheme);
  };

  return (
    <ScrollView style={{ backgroundColor: bgColor }}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={[styles.header, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="title" style={[styles.title, { color: primaryGreen }]}>
            Pengaturan
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Kelola preferensi aplikasi Anda
          </ThemedText>
        </ThemedView>

        {/* Theme Section */}
        <ThemedView style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Tampilan
          </ThemedText>

          {/* Theme Options */}
          <ThemedView style={styles.optionsContainer}>
            {/* Auto (System) */}
            <Pressable
              style={[
                styles.themeOption,
                { borderColor },
                userPreference === null && [styles.themeOptionSelected, { borderColor: primaryGreen, borderWidth: 2 }],
              ]}
              onPress={() => handleThemeChange(null)}
            >
              <View style={[styles.themeIcon, { backgroundColor: '#F0F4EE' }]}>
                <IconSymbol name="gearshape.fill" size={24} color={primaryGreen} />
              </View>
              <ThemedText style={[styles.themeLabel, { color: textColor }]}>
                Otomatis
              </ThemedText>
              <ThemedText style={styles.themeDescription}>
                Mengikuti sistem
              </ThemedText>
              {userPreference === null && (
                <View style={[styles.checkmark, { backgroundColor: primaryGreen }]}>
                  <ThemedText style={{ color: '#fff', fontSize: 16 }}>✓</ThemedText>
                </View>
              )}
            </Pressable>

            {/* Light Theme */}
            <Pressable
              style={[
                styles.themeOption,
                { borderColor },
                userPreference === 'light' && [styles.themeOptionSelected, { borderColor: primaryGreen, borderWidth: 2 }],
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <View style={[styles.themeIcon, { backgroundColor: '#F9FAFB' }]}>
                <IconSymbol name="sun.max.fill" size={24} color={primaryGreen} />
              </View>
              <ThemedText style={[styles.themeLabel, { color: textColor }]}>
                Terang
              </ThemedText>
              <ThemedText style={styles.themeDescription}>
                Mode terang
              </ThemedText>
              {userPreference === 'light' && (
                <View style={[styles.checkmark, { backgroundColor: primaryGreen }]}>
                  <ThemedText style={{ color: '#fff', fontSize: 16 }}>✓</ThemedText>
                </View>
              )}
            </Pressable>

            {/* Dark Theme */}
            <Pressable
              style={[
                styles.themeOption,
                { borderColor },
                userPreference === 'dark' && [styles.themeOptionSelected, { borderColor: primaryGreen, borderWidth: 2 }],
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <View style={[styles.themeIcon, { backgroundColor: '#1F2937' }]}>
                <IconSymbol name="moon.fill" size={24} color="#81C784" />
              </View>
              <ThemedText style={[styles.themeLabel, { color: textColor }]}>
                Gelap
              </ThemedText>
              <ThemedText style={styles.themeDescription}>
                Mode gelap
              </ThemedText>
              {userPreference === 'dark' && (
                <View style={[styles.checkmark, { backgroundColor: primaryGreen }]}>
                  <ThemedText style={{ color: '#fff', fontSize: 16 }}>✓</ThemedText>
                </View>
              )}
            </Pressable>
          </ThemedView>

          {/* Quick Toggle Button */}
          <Pressable
            style={[styles.toggleButton, { backgroundColor: primaryGreen }]}
            onPress={toggleTheme}
            disabled={isLoading}
          >
            <IconSymbol name="moon.fill" size={20} color="#fff" />
            <ThemedText style={styles.toggleButtonText}>
              {colorScheme === 'light' ? 'Beralih ke Mode Gelap' : 'Beralih ke Mode Terang'}
            </ThemedText>
          </Pressable>
        </ThemedView>

        {/* Info Section */}
        <ThemedView style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Tentang
          </ThemedText>
          <ThemedText style={styles.infoText}>
            Petagri Platform v1.0.0
          </ThemedText>
          <ThemedText style={[styles.infoText, { marginTop: 8 }]}>
            Platform agribisnis terpadu untuk konsultasi, penjualan, dan distribusi.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 12,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.7,
  },
  section: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  themeOptionSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  themeDescription: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoText: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 20,
  },
});
