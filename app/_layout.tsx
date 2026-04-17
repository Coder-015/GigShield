import { useEffect, useState, useRef } from 'react';
import { Stack, router } from 'expo-router';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

function BiometricScanner() {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F13' }}>
      <View style={{ width: 80, height: 80, justifyContent: 'center', alignItems: 'center' }}>
        {/* Face ID Box */}
        <Svg width="80" height="80" viewBox="0 0 100 100">
          <Path d="M25 15 L15 15 L15 25 M75 15 L85 15 L85 25 M15 75 L15 85 L25 85 M85 75 L85 85 L75 85" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
          <Path d="M35 35 Q50 20 65 35 Q75 50 65 65 L50 80 L35 65 Q25 50 35 35 Z" stroke="#3B82F6" strokeWidth="3" fill="none" opacity="0.8" />
          <Path d="M45 45 Q50 55 55 45" stroke="#FFF" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Circle cx="40" cy="40" r="2" fill="#FFF" />
          <Circle cx="60" cy="40" r="2" fill="#FFF" />
        </Svg>
        {/* Scanning Laser */}
        <Animated.View style={{ position: 'absolute', top: 40, width: 60, height: 2, backgroundColor: '#10B981', transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 30] }) }] }} />
      </View>
      <Text style={{ marginTop: 24, fontSize: 13, fontWeight: '700', color: '#10B981', letterSpacing: 2, textTransform: 'uppercase' }}>Securing Vault</Text>
    </View>
  );
}

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
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setReady(true);
        }, 1200); // Enforce minimum 1.2s to show beautiful biometric scan
      }
    }
    check();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 3. Dynamic routing based on auth state
  useEffect(() => {
    if (ready) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isAuthenticated, ready]);

  if (!ready) {
    return <BiometricScanner />;
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
        <Stack.Screen name="settings" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="policy" />
        <Stack.Screen name="subscription-planner" />
        <Stack.Screen name="plan-selection" />
      </Stack>

      {isDemoMode && (
        <View style={[styles.demoBanner, { top: insets.top }]}>
          <Text style={styles.demoText}>Developer Demo Mode</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  demoBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#F97316',
    paddingVertical: 4,
    alignItems: 'center',
    zIndex: 999,
  },
  demoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
