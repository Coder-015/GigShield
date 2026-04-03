import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useIsLoggedIn, useUser } from '@/store/useAppStore';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const isLoggedIn = useIsLoggedIn();
  const user = useUser();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isLoggedIn || !user) {
      router.replace('/login' as any);
    }
  }, [isLoggedIn, user]);

  // If not authenticated, show nothing (will redirect)
  if (!isLoggedIn || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  // If authenticated, show children
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAF7',
  },
  text: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'System',
  },
});
