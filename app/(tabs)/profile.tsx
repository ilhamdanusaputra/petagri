import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
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

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Profile
      </ThemedText>

      {isLoggedIn ? (
        <ThemedView style={styles.profileCard}>
          <ThemedText type="subtitle">Selamat datang!</ThemedText>
          <ThemedText style={styles.userName}>{user?.name}</ThemedText>
          <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        <ThemedView style={styles.loginCard}>
          <ThemedText type="subtitle" style={styles.loginTitle}>
            Login
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
            secureTextEntry
          />

          <Pressable
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.loginButtonText}>Login</ThemedText>
            )}
          </Pressable>

          <ThemedText style={styles.dummyText}>
            💡 Tip: Gunakan email apapun (contoh: demo@example.com)
          </ThemedText>
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
