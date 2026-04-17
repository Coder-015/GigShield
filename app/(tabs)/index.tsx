// Home Screen — Premium Fintech Dashboard Upgrade
import UserStore, { useUserStore } from '@/store/userStore';
import { router } from 'expo-router';
import { Bell, CloudRain, Shield, TrendingUp, ChevronRight, Zap } from 'lucide-react-native';
import { getLiveWeather, LiveWeatherData } from '@/services/realWeatherService';
import { calculateMLPremium, getCurrentSeason, getZoneFloodHistory } from '@/services/mlPremiumEngine';
import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity,
  View, Animated, Easing, Pressable, RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import useAppStore from '@/store/useAppStore';
import Svg, { Defs, RadialGradient, Stop, Rect, Path, Circle, LinearGradient } from 'react-native-svg';

const { width: W } = Dimensions.get('window');

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Sparkline Chart Component using purely SVG
function PayoutVelocityChart({ points, color }: { points: number[]; color: string }) {
  const height = 120;
  const width = W - 48; // padding 24 each side
  const paddingY = 20;
  
  const max = Math.max(...points, 10);
  const min = 0;
  
  // Calculate path
  const pathParts = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - paddingY - ((p - min) / (max - min)) * (height - 2 * paddingY);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  });

  // Calculate area path for gradient
  const areaPath = `${pathParts.join(' ')} L ${width} ${height} L 0 ${height} Z`;

  return (
    <View style={{ height, width, marginTop: 10, overflow: 'hidden', borderRadius: 12 }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill="url(#grad)" />
        <Path d={pathParts.join(' ')} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => {
          const x = (i / (points.length - 1)) * width;
          const y = height - paddingY - ((p - min) / (max - min)) * (height - 2 * paddingY);
          return <Circle key={i} cx={x} cy={y} r="4" fill="#0F0F13" stroke={color} strokeWidth="2" />;
        })}
      </Svg>
    </View>
  );
}

export default function HomeScreen() {
  const { user, isAuthenticated } = useUserStore();
  const { claims, loadUserClaims } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [mlResult, setMlResult] = useState<any>(null);

  const loadData = async () => {
    if (!user) return;
    try {
      const w = await getLiveWeather(user.city);
      setWeather(w);
    } catch {}
    const r = calculateMLPremium({
      city: user.city,
      zone: user.zone,
      platform: user.platform || 'General',
      weeklyEarnings: parseFloat(user.weekly_earnings) || 4000,
      monthsActive: 4,
      pastClaims: claims.filter(c => c.status === 'completed').length,
      currentSeason: getCurrentSeason(),
      zoneFloodHistory: getZoneFloodHistory(user.zone),
      avgWeeklyHours: 45,
    });
    setMlResult(r);
  };

  useEffect(() => {
    if (!user || !isAuthenticated) {
      router.replace('/login' as any);
      return;
    }
    loadUserClaims();
    loadData();
  }, [user, isAuthenticated]);

  const onRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await loadData();
    await loadUserClaims();
    setRefreshing(false);
  };

  // Background Glassmorphism Animation
  const bgAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(bgAnim, {
        toValue: 1,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true, // Transform animation allows Native Driver
      })
    ).start();
  }, []);

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F13' }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const completedClaims = claims.filter(c => c.status === 'completed').length;
  const processingClaims = claims.filter(c => c.status === 'processing').length;
  const totalPaidOut = claims
    .filter(c => c.status === 'completed')
    .reduce((s, c) => s + (c.amount || 0), 0);
  const memberYear = user.created_at ? new Date(user.created_at).getFullYear() : '2024';

  const riskColor = mlResult
    ? (mlResult.riskScore >= 70 ? '#EF4444' : mlResult.riskScore >= 45 ? '#F59E0B' : '#10B981')
    : '#3B82F6';

  // SVG Animated drift instead of modifying internal SVG props (which crashes Fabric)
  const tx1 = bgAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 100, 0] });
  const ty1 = bgAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 150, 0] });
  const tx2 = bgAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -100, 0] });

  // Dummy points for the chart based on ML Risk (high risk = choppier payouts)
  const chartPoints = mlResult?.riskScore > 60 ? [10, 80, 45, 120, 30, 200] : [20, 35, 30, 50, 40, 60];

  return (
    <View style={s.container}>
      {/* ── Animated Background ── */}
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: tx1 }, { translateY: ty1 }], left: '-20%', top: '-20%', width: '140%', height: '140%' }]}>
          <Svg width="100%" height="100%">
            <Defs>
              <RadialGradient id="grad1" cx="20%" cy="0%" r="60%">
                <Stop offset="0" stopColor={riskColor} stopOpacity="0.15" />
                <Stop offset="1" stopColor="#0F0F13" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#grad1)" />
          </Svg>
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: tx2 }, { translateY: ty1 }], left: '-20%', top: '-20%', width: '140%', height: '140%' }]}>
          <Svg width="100%" height="100%">
            <Defs>
              <RadialGradient id="grad2" cx="80%" cy="0%" r="70%">
                <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.1" />
                <Stop offset="1" stopColor="#0F0F13" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#grad2)" />
          </Svg>
        </Animated.View>
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={riskColor} />}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* ── Header ── */}
          <View style={s.header}>
            <View>
              <Text style={s.greeting}>{getGreeting()}</Text>
              <Text style={s.name}>{user.name}</Text>
              <View style={s.locationRow}>
                <Shield size={12} color={riskColor} />
                <Text style={[s.locationTag, { color: riskColor }]}> Protected in {user.city} · {user.zone}</Text>
              </View>
            </View>
            <TouchableOpacity style={s.bellBtn} onPress={() => router.push('/notifications' as any)}>
              <Bell size={22} color="#FFFFFF" />
              {processingClaims > 0 && <View style={s.badge} />}
            </TouchableOpacity>
          </View>

          {/* ── Live Risk Engine Glass Card ── */}
          <View style={s.glassCard}>
            <View style={s.aiTitleRow}>
              <Zap size={18} color={riskColor} />
              <Text style={s.aiTitle}>Live AI Risk Engine</Text>
              <Text style={[s.aiScore, { color: riskColor }]}>{mlResult ? `${mlResult.riskScore}/100` : 'SYNCING'}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={s.riskSubTitle}>Current Condition</Text>
                <Text style={s.riskValue}>{weather ? weather.condition : 'Loading...'}</Text>
                <Text style={s.riskDesc}>{weather ? `${Math.round(weather.temperature)}°C · Humidity ${weather.humidity}%` : 'Connecting to station'}</Text>
              </View>
              <View style={[s.riskStatusPill, { backgroundColor: riskColor + '22', borderColor: riskColor + '44' }]}>
                <Text style={[s.riskStatusText, { color: riskColor }]}>
                  {mlResult ? (mlResult.riskScore >= 70 ? 'HIGH RISK' : mlResult.riskScore >= 45 ? 'MODERATE' : 'SAFE') : 'LOADING'}
                </Text>
              </View>
            </View>
            
            {/* Divider */}
            <View style={s.divider} />
            
            {mlResult && mlResult.riskFactors.slice(0, 2).map((f: any) => (
              <View key={f.factor} style={s.aiRow}>
                <View style={[s.aiDot, { backgroundColor: f.impact === 'High' ? '#EF4444' : f.impact === 'Medium' ? '#F59E0B' : '#10B981' }]} />
                <Text style={s.aiText}>{f.factor}</Text>
                <Text style={s.aiImpact}>{f.impact}</Text>
              </View>
            ))}
          </View>

          {/* ── Financial Velocity Chart (Custom SVG) ── */}
          <View style={[s.glassCard, { marginTop: 16 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
              <View>
                <Text style={s.chartLbl}>Total Disbursed</Text>
                <Text style={s.chartVal}>₹{totalPaidOut}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.chartLbl}>Last 6 weeks</Text>
                <Text style={[s.chartVal, { fontSize: 16, color: '#10B981' }]}>+{completedClaims} Claims</Text>
              </View>
            </View>
            {/* The SVG Sparkline */}
            <PayoutVelocityChart points={chartPoints} color="#10B981" />
          </View>

          {/* ── Stats Grid ── */}
          <View style={s.grid}>
            <TouchableOpacity style={s.gridItem} onPress={() => router.push('/(tabs)/claims' as any)}>
              <Text style={s.gridVal}>{completedClaims + processingClaims}</Text>
              <Text style={s.gridLbl}>Total Claims</Text>
            </TouchableOpacity>
            <View style={s.gridItem}>
              <Text style={s.gridVal}>{memberYear}</Text>
              <Text style={s.gridLbl}>Member Since</Text>
            </View>
          </View>

          {/* ── Coverage Card ── */}
          <View style={[s.glassCard, s.coverCard]}>
            <View>
              <Text style={s.coverLabel}>Your Coverage</Text>
              <Text style={s.coverAmount}>₹{user.plan === 'pro' ? '1,000' : user.plan === 'basic' ? '500' : '700'}<Text style={s.coverPer}>/day</Text></Text>
              <Text style={s.coverPlan}>{(user.plan || 'standard').toUpperCase()} PLAN</Text>
            </View>
            <View style={[s.coverBadge, { backgroundColor: riskColor + '1A', borderColor: riskColor + '33' }]}>
              <Shield size={20} color={riskColor} />
              <Text style={[s.coverStat, { color: riskColor }]}>Protected</Text>
            </View>
          </View>

          {/* ── Quick Actions ── */}
          <Text style={s.sectionLabel}>QUICK ACTIONS</Text>
          <View style={s.actionsRow}>
            <TouchableOpacity style={s.actionBtn} onPress={() => router.push('/(tabs)/claims' as any)}>
              <Shield size={22} color="#F97316" />
              <Text style={s.actionTxt}>My Claims</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => router.push('/subscription-planner' as any)}>
              <TrendingUp size={22} color="#0D9488" />
              <Text style={s.actionTxt}>Upgrade Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => router.push('/(tabs)/map' as any)}>
              <CloudRain size={22} color="#3B82F6" />
              <Text style={s.actionTxt}>Risk Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => router.push('/notifications' as any)}>
              <Bell size={22} color="#8B5CF6" />
              <Text style={s.actionTxt}>Alerts</Text>
            </TouchableOpacity>
          </View>

          {/* ── Simulate Rain CTA ── */}
          <Pressable
            style={s.ctaBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              router.push((`/alert?zone=${encodeURIComponent(user.zone || 'Dharavi')}&amount=292&rainfall=52`) as any);
            }}
          >
            <CloudRain size={20} color="#FFF" />
            <Text style={s.ctaTxt}>Simulate Rain Event</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F13' },
  scroll: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 14, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontSize: 32, fontWeight: '900', color: '#FFF', marginTop: 4, marginBottom: 8, letterSpacing: -0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationTag: { fontSize: 13, fontWeight: '700' },
  bellBtn: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  badge: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, backgroundColor: '#EF4444', borderRadius: 4 },

  // Glass Card (Unified style for all cards)
  glassCard: {
    backgroundColor: 'rgba(28,28,30,0.6)',
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  aiTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  aiTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', flex: 1 },
  aiScore: { fontSize: 14, fontWeight: '800' },
  riskSubTitle: { color: '#A1A1AA', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  riskValue: { color: '#FFF', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  riskDesc: { color: '#A1A1AA', fontSize: 14 },
  riskStatusPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  riskStatusText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 16 },
  aiRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  aiDot: { width: 6, height: 6, borderRadius: 3, marginRight: 12 },
  aiText: { color: '#D4D4D8', fontSize: 14, flex: 1 },
  aiImpact: { color: '#A1A1AA', fontSize: 12, fontWeight: '700' },

  // Chart
  chartLbl: { color: '#A1A1AA', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  chartVal: { color: '#FFF', fontSize: 24, fontWeight: '800' },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16 },
  gridItem: {
    flex: 1, minWidth: '45%', backgroundColor: 'rgba(28,28,30,0.6)', borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  gridVal: { color: '#FFF', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  gridLbl: { color: '#A1A1AA', fontSize: 12 },

  // Coverage
  coverCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 28 },
  coverLabel: { color: '#A1A1AA', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  coverAmount: { color: '#FFF', fontSize: 32, fontWeight: '900' },
  coverPer: { fontSize: 16, color: '#A1A1AA', fontWeight: '500' },
  coverPlan: { color: '#A1A1AA', fontSize: 12, marginTop: 6, fontWeight: '700', letterSpacing: 1 },
  coverBadge: { alignItems: 'center', borderRadius: 16, padding: 16, gap: 8, borderWidth: 1 },
  coverStat: { fontSize: 12, fontWeight: '800' },

  // Quick Actions
  sectionLabel: { color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 1, marginBottom: 16, marginTop: 8 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  actionBtn: {
    width: '47%', flexGrow: 1, backgroundColor: 'rgba(28,28,30,0.6)', borderRadius: 18, paddingVertical: 18,
    alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  actionTxt: { color: '#D4D4D8', fontSize: 13, fontWeight: '700', textAlign: 'center' },

  // CTA
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF', borderRadius: 20, paddingVertical: 20, gap: 10,
  },
  ctaTxt: { color: '#000', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
});
