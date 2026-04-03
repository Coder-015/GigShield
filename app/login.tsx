import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const cleanPhone = phone.trim().replace(/\s/g, '');

    if (cleanPhone.length !== 10) {
      Alert.alert('Error', 'Enter a valid 10-digit number');
      return;
    }

    setLoading(true);
    try {
      // Use select with filter — most reliable approach
      const response = await supabase
        .from('users')
        .select('*')
        .filter('phone', 'eq', cleanPhone);

      console.log('Full response:', JSON.stringify(response));

      if (response.error) {
        console.error('Query error:', response.error);
        throw response.error;
      }

      const users = response.data;
      console.log('Users found:', users?.length);

      if (users && users.length > 0) {
        const user = users[0];
        console.log('Logging in as:', user.name);
        useUserStore.getState().setUser({ user, isAuthenticated: true });
        console.log('[DEBUG] Zustand State after login:', JSON.stringify({
          isAuthenticated: useUserStore.getState().isAuthenticated,
          userId: useUserStore.getState().user?.id
        }));
        router.replace('/(tabs)' as any);
      } else {
        // No user found — check if it's a Supabase config issue
        // by trying to count all users
        const countResponse = await supabase
          .from('users')
          .select('phone');
        
        console.log('All phones in DB:', 
          JSON.stringify(countResponse.data));
        
        Alert.alert(
          'Not Found',
          `No account for ${cleanPhone}.\n\nDid you sign up with a different number?`,
          [
            { text: 'Sign Up', onPress: () => router.push('/signup') },
            { text: 'Demo Login', onPress: handleDemoLogin },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } catch (e: any) {
      console.error('Login failed:', e?.message || e);
      Alert.alert(
        'Error',
        'Cannot connect to server. Try demo login.',
        [{ text: 'Demo Login', onPress: handleDemoLogin }]
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin() {
    useUserStore.getState().setUser({
      user: {
        id: 'demo-001',
        name: 'Rahul Kumar',
        phone: '9876543210',
        email: 'rahul@demo.com',
        city: 'Mumbai',
        zone: 'Dharavi',
        platform: 'Zomato',
        weekly_earnings: 'Rs.3000-4000',
        plan: 'standard',
        created_at: new Date().toISOString(),
      },
      isAuthenticated: true
    });
    console.log('[DEBUG] Zustand State after demo login:', JSON.stringify({
      isAuthenticated: useUserStore.getState().isAuthenticated,
      userId: useUserStore.getState().user?.id
    }));
    router.replace('/(tabs)' as any);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>
        Enter the phone number you signed up with
      </Text>

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="10-digit mobile number"
        placeholderTextColor="#9CA3AF"
        keyboardType="numeric"
        maxLength={10}
        autoFocus
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Login</Text>
        }
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity
        style={styles.demoButton}
        onPress={handleDemoLogin}
        activeOpacity={0.8}
      >
        <Text style={styles.demoText}>
          Use Demo Account (skip login)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => router.push('/signup')}
      >
        <Text style={styles.linkText}>
          New here?{' '}
          <Text style={styles.linkOrange}>Create account</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
    padding: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 40,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#1C1C1E',
    marginBottom: 24,
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  demoButton: {
    borderWidth: 1.5,
    borderColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  demoText: {
    color: '#F97316',
    fontSize: 15,
    fontWeight: '600',
  },
  link: {
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkOrange: {
    color: '#F97316',
    fontWeight: '600',
  },
});
