import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<'onboarding' | '(tabs)'>('onboarding');

  // Listen to auth changes from Zustand
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const isDemoMode = useUserStore(state => state.isDemoMode);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // 1. Listen to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      useUserStore.getState().setSession(session);
    });

    // 2. Initial state checking
    async function check() {
      try {
        const isAuth = useUserStore.getState().isAuthenticated;
        if (isAuth || useUserStore.getState().user) {
          setInitialRoute('(tabs)');
        } else {
          setInitialRoute('onboarding');
        }
      } catch {
        setInitialRoute('onboarding');
      } finally {
        setTimeout(() => setReady(true), 400);
      }
    }
    check();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 3. Dynamic routing based on auth state
  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, ready]);

  if (!ready) {
    return (
      <View style={{ flex:1, justifyContent:'center', 
                     alignItems:'center', backgroundColor:'#FAFAF7' }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}
             initialRouteName={initialRoute}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="alert" />
        <Stack.Screen name="claim-tracking" />
        <Stack.Screen name="payout-success" />
      </Stack>
      {isDemoMode && (
        <View style={[styles.demoBanner, { top: insets.top }]}>
          <Text style={styles.demoText}>Demo Mode Active</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  demoBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F59E0B',
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  demoText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
