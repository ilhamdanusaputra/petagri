import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useThemePreference } from '@/hooks/use-theme-preference';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput } from 'react-native';

export default function ProfileScreen() {
  const { user, isLoading, login, logout, isLoggedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email.trim() && password.trim()) {
      await login(email, password);
      setPassword('');
    }
  };

  const handleLogout = () => {
    logout();
    setEmail('');
    setPassword('');
  };

  const { colorScheme } = useThemePreference();

  const bgColor = useThemeColor({ light: '#F9FAFB', dark: '#111827' }, 'background');
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#1F2937' }, 'card');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'cardBorder');
  const primaryGreen = useThemeColor({ light: '#1B5E20', dark: '#81C784' }, 'tint');
  const textColor = useThemeColor({ light: '#1F2937', dark: '#F3F4F6' }, 'text');
  const dangerColor = useThemeColor({ light: '#EF4444', dark: '#EF4444' }, 'danger');

  return (
    <ThemedView style={[styles.container, { backgroundColor: bgColor }]}> 
      <ThemedText type="title" style={[styles.title, { color: primaryGreen }]}> 
        Profile
      </ThemedText>

      {isLoggedIn ? (
        <ThemedView style={[styles.profileCard, { backgroundColor: cardBg, borderColor }] }>
          <ThemedText type="subtitle" style={{ color: textColor }}>Selamat datang!</ThemedText>
          <ThemedText style={[styles.userName, { color: textColor }]}>{user?.name}</ThemedText>
          <ThemedText style={[styles.userEmail, { color: textColor }]}>{user?.email}</ThemedText>

          <Pressable style={[styles.logoutButton, { backgroundColor: dangerColor }]} onPress={handleLogout}>
            <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        <ThemedView style={[styles.loginCard, { backgroundColor: cardBg, borderColor }] }>
          <ThemedText type="subtitle" style={[styles.loginTitle, { color: textColor }]}>Login</ThemedText>

          <TextInput
            style={[styles.input, { color: textColor, borderColor, backgroundColor: cardBg }]}
            placeholder="Email"
            placeholderTextColor={colorScheme === 'light' ? '#999' : '#9CA3AF'}
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, { color: textColor, borderColor, backgroundColor: cardBg }]}
            placeholder="Password"
            placeholderTextColor={colorScheme === 'light' ? '#999' : '#9CA3AF'}
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
            secureTextEntry
          />

          <Pressable
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled, { backgroundColor: primaryGreen }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.loginButtonText}>Login</ThemedText>
            )}
          </Pressable>

          <ThemedText style={[styles.dummyText, { color: textColor }]}>💡 Tip: Gunakan email apapun (contoh: demo@example.com)</ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  profileCard: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#E6F4FE',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  loginCard: {
    padding: 24,
    borderRadius: 12,
    gap: 16,
  },
  loginTitle: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#0a7ea480',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  dummyText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
