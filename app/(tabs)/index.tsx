// Refactored Dark Mode Home Screen
import UserStore from '@/store/userStore';
import { formatCurrency } from '@/utils';
import { router } from 'expo-router';
import { Bell, CloudRain, Shield, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated, Easing, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const user = UserStore.getUser();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/login' as any);
    }
  }, [user]);

  // Animations
  const rotAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0.5)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0.5, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const spin = rotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleSimulateRain = async () => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      router.push('/alert?zone=' + (user?.zone || 'Dharavi') + '&amount=292&rainfall=52' as any);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F13' }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning, {user.name.split(' ')[0]}</Text>
            <Text style={styles.locationTag}><Shield size={12} color="#10B981" /> Active in {user.city}</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => Haptics.selectionAsync()}>
            <Bell size={22} color="#FFFFFF" />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* Dynamic Emotional Banner */}
        <Animated.View style={[styles.alertBanner, { opacity: shimmerAnim }]}>
          <CloudRain size={20} color="#60A5FA" />
          <View style={styles.alertTextStack}>
            <Text style={styles.alertPrimary}>Heavy rain in {user.zone} in 2 hrs</Text>
            <Text style={styles.alertSecondary}>Estimated loss {formatCurrency(280)} (Covered)</Text>
          </View>
        </Animated.View>

        {/* Enhanced Glowing Risk Indicator */}
        <View style={styles.riskCard}>
          <Text style={styles.riskTitle}>Live Risk Engine</Text>
          <View style={styles.glowWrapper}>
            <Animated.View style={[styles.glowRing, { transform: [{ scale: pulseAnim }] }]} />
            
            {/* The Rotating Dashed Radar Ring */}
            <Animated.View style={[styles.radarRing, { transform: [{ rotate: spin }] }]} />

            <View style={styles.riskCircle}>
              <Text style={styles.riskScore}>65</Text>
              <Text style={styles.riskLabel}>MEDIUM</Text>
            </View>
          </View>
          <Text style={styles.riskFooter}>Analyzing weather patterns... (4 stations sync)</Text>
        </View>

        {/* Global Dashboard Stats */}
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Text style={styles.gridVal}>0</Text>
            <Text style={styles.gridLbl}>Claims This Month</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridVal}>{formatCurrency(50000)}</Text>
            <Text style={styles.gridLbl}>Protected Today</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridVal}>2 hrs</Text>
            <Text style={styles.gridLbl}>Avg Payout Speed</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridVal}>{(user as any).memberSince || '2024'}</Text>
            <Text style={styles.gridLbl}>Member Since</Text>
          </View>
        </View>

        {/* Financial Predictor Card */}
        <View style={styles.incomeCard}>
          <View style={styles.incomeRow}>
            <View>
              <Text style={styles.incomeLbl}>Estimated Rainfall Loss</Text>
              <Text style={styles.incomeVal}>{formatCurrency(280)}</Text>
            </View>
            <View style={styles.shieldBadge}>
              <Shield size={16} color="#10B981" />
              <Text style={styles.shieldText}>Covered</Text>
            </View>
          </View>
        </View>

        {/* Simulation CTA */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable 
            style={styles.ctaButton} 
            onPress={handleSimulateRain}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <TrendingUp size={20} color="#FFFFFF" />
            <Text style={styles.ctaText}>Simulate Rain Event</Text>
          </Pressable>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13', // Deep Dark Base
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100, // floating tab clearance
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  locationTag: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  bellBtn: {
    backgroundColor: '#1C1C1E',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333336',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  alertTextStack: {
    marginLeft: 16,
    flex: 1,
  },
  alertPrimary: {
    color: '#60A5FA',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  alertSecondary: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '500',
  },
  riskCard: {
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333336',
  },
  riskTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
  },
  glowWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(245, 158, 11, 0.15)', // Amber glow
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  radarRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderStyle: 'dashed',
    zIndex: 1,
  },
  riskCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1C1C1E',
    borderWidth: 3,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  riskScore: {
    fontSize: 48,
    fontWeight: '900',
    color: '#F59E0B',
  },
  riskLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D1D5DB',
    letterSpacing: 2,
  },
  riskFooter: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 24,
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridItem: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#333336',
    borderRadius: 16,
    padding: 16,
    width: '48%',
  },
  gridVal: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  gridLbl: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  incomeCard: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#333336',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  incomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incomeLbl: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  incomeVal: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
  },
  shieldBadge: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  shieldText: {
    color: '#10B981',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 14,
  },
  ctaButton: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 60,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
});
