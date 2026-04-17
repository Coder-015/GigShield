import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, ScrollView, StyleSheet,
  Text, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle as SvgCircle, Defs, G, Line, RadialGradient,
  Rect, Stop, Text as SvgText, Polygon
} from 'react-native-svg';
import { router } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { CloudRain, Shield, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: SW, height: SH } = Dimensions.get('window');
const MAP_W = SW * 1.2;
const MAP_H = SH * 0.62;

// ─── Zone data per city with proper relative positions ─────────────────────
interface Zone {
  id: string; name: string;
  x: number; y: number; r: number;
  risk: 'high' | 'medium' | 'safe';
  workers: number; rainfall: number; payout: number;
}

const ZONES: Record<string, Zone[]> = {
  Mumbai: [
    { id: 'dharavi',  name: 'Dharavi',  x: 230, y: 360, r: 70, risk: 'high',   workers: 234, rainfall: 120, payout: 450 },
    { id: 'kurla',    name: 'Kurla',    x: 380, y: 310, r: 60, risk: 'medium', workers: 189, rainfall: 65,  payout: 280 },
    { id: 'andheri',  name: 'Andheri',  x: 180, y: 185, r: 80, risk: 'medium', workers: 312, rainfall: 55,  payout: 250 },
    { id: 'bandra',   name: 'Bandra',   x: 160, y: 295, r: 52, risk: 'safe',   workers: 156, rainfall: 20,  payout: 100 },
    { id: 'worli',    name: 'Worli',    x: 155, y: 430, r: 48, risk: 'safe',   workers: 98,  rainfall: 15,  payout: 80  },
    { id: 'powai',    name: 'Powai',    x: 460, y: 195, r: 65, risk: 'high',   workers: 145, rainfall: 110, payout: 420 },
    { id: 'thane',    name: 'Thane',    x: 520, y: 115, r: 75, risk: 'medium', workers: 203, rainfall: 50,  payout: 230 },
  ],
  Bengaluru: [
    { id: 'koramangala', name: 'Koramangala', x: 280, y: 330, r: 70, risk: 'safe',   workers: 412, rainfall: 18, payout: 85  },
    { id: 'indiranagar', name: 'Indiranagar', x: 390, y: 220, r: 60, risk: 'medium', workers: 320, rainfall: 50, payout: 230 },
    { id: 'hsr',         name: 'HSR Layout',  x: 290, y: 460, r: 80, risk: 'high',   workers: 512, rainfall: 95, payout: 380 },
    { id: 'ecity',       name: 'E-City',      x: 340, y: 580, r: 70, risk: 'medium', workers: 388, rainfall: 45, payout: 200 },
    { id: 'whitefield',  name: 'Whitefield',  x: 510, y: 180, r: 90, risk: 'medium', workers: 450, rainfall: 40, payout: 190 },
  ],
  Delhi: [
    { id: 'lajpat', name: 'Lajpat Nagar',   x: 390, y: 390, r: 65, risk: 'high',   workers: 341, rainfall: 88, payout: 360 },
    { id: 'dwarka', name: 'Dwarka',          x: 175, y: 360, r: 80, risk: 'medium', workers: 280, rainfall: 52, payout: 240 },
    { id: 'rohini', name: 'Rohini',          x: 230, y: 140, r: 78, risk: 'safe',   workers: 210, rainfall: 12, payout: 75  },
    { id: 'cp',     name: 'Connaught Pl.',  x: 310, y: 270, r: 52, risk: 'safe',   workers: 150, rainfall: 10, payout: 60  },
  ],
  Chennai: [
    { id: 'anna',   name: 'Anna Nagar', x: 230, y: 230, r: 72, risk: 'medium', workers: 290, rainfall: 60,  payout: 260 },
    { id: 'adyar',  name: 'Adyar',      x: 330, y: 420, r: 75, risk: 'high',   workers: 310, rainfall: 100, payout: 400 },
    { id: 'tnagar', name: 'T. Nagar',   x: 270, y: 330, r: 60, risk: 'medium', workers: 240, rainfall: 45,  payout: 210 },
  ],
  Hyderabad: [
    { id: 'hitech',   name: 'Hitech City',   x: 220, y: 250, r: 80, risk: 'medium', workers: 445, rainfall: 48, payout: 210 },
    { id: 'banjara',  name: 'Banjara Hills', x: 340, y: 380, r: 65, risk: 'safe',   workers: 230, rainfall: 14, payout: 70  },
    { id: 'secunder', name: 'Secunderabad',  x: 400, y: 185, r: 70, risk: 'medium', workers: 312, rainfall: 42, payout: 190 },
  ],
};

const RISK = {
  high:   { color: '#EF4444', glow: 'rgba(239,68,68,0.35)',   ring: 'rgba(239,68,68,0.12)',  label: 'HIGH' },
  medium: { color: '#F59E0B', glow: 'rgba(245,158,11,0.30)',  ring: 'rgba(245,158,11,0.10)', label: 'MED'  },
  safe:   { color: '#10B981', glow: 'rgba(16,185,129,0.25)',  ring: 'rgba(16,185,129,0.08)', label: 'SAFE' },
};

// ─── Animated pulsing ring ───────────────────────────────────────────────────
function PulseRing({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const opacity = anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.6, 0.2, 0] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: r,
        borderWidth: 2,
        borderColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

export default function MapScreen() {
  const { user, isAuthenticated } = useUserStore();
  const [selected, setSelected] = useState<Zone | null>(null);
  const sheetAnim = useRef(new Animated.Value(300)).current;
  const radarAnim = useRef(new Animated.Value(0)).current;

  const city = user?.city || 'Mumbai';
  const zones = ZONES[city] || ZONES.Mumbai;

  // Radar sweep animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(radarAnim, { toValue: 1, duration: 4000, useNativeDriver: true })
    ).start();
  }, []);

  const openSheet = (zone: Zone) => {
    Haptics.selectionAsync();
    setSelected(zone);
    Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, { toValue: 300, duration: 250, useNativeDriver: true }).start(() => setSelected(null));
  };

  const handleSimulate = () => {
    if (!selected) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeSheet();
    setTimeout(() => {
      router.push(`/alert?zone=${selected.name}&amount=${selected.payout}&rainfall=${selected.rainfall}` as any);
    }, 300);
  };

  if (!isAuthenticated) {
    return (
      <View style={s.container}>
        <SafeAreaView style={s.authCenter}>
          <Shield size={60} color="#F97316" />
          <Text style={s.authTitle}>Sign in to view your risk map</Text>
          <TouchableOpacity style={s.authBtn} onPress={() => router.replace('/login' as any)}>
            <Text style={s.authBtnTxt}>Go to Login</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const totalWorkers = zones.reduce((n, z) => n + z.workers, 0);
  const highRiskZones = zones.filter(z => z.risk === 'high').length;

  return (
    <View style={s.container}>
      {/* ── HUD Header ── */}
      <SafeAreaView style={s.header}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerCity}>📍{city} Risk Radar</Text>
            <Text style={s.headerSub}>{totalWorkers.toLocaleString()} workers • {highRiskZones} high-risk zones</Text>
          </View>
          <View style={s.liveChip}>
            <View style={s.liveDot} />
            <Text style={s.liveTxt}>LIVE</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* ── Map Canvas ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ width: MAP_W }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ height: MAP_H }}>
          {/* SVG base: grid + zones */}
          <View style={{ width: MAP_W, height: MAP_H }}>
            <Svg width={MAP_W} height={MAP_H}>
              <Defs>
                {/* Gradient definitions for each risk type */}
                {(['high', 'medium', 'safe'] as const).map(r => (
                  <RadialGradient key={r} id={`grad_${r}`} cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={RISK[r].color} stopOpacity="0.35" />
                    <Stop offset="60%" stopColor={RISK[r].color} stopOpacity="0.12" />
                    <Stop offset="100%" stopColor={RISK[r].color} stopOpacity="0" />
                  </RadialGradient>
                ))}
              </Defs>

              {/* Dark grid background */}
              <Rect width={MAP_W} height={MAP_H} fill="#0A0A0F" />

              {/* Grid lines */}
              {Array.from({ length: 22 }, (_, i) => (
                <Line key={`h${i}`} x1={0} y1={i * 40} x2={MAP_W} y2={i * 40}
                  stroke="#1A1A2E" strokeWidth="1" />
              ))}
              {Array.from({ length: 22 }, (_, i) => (
                <Line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={MAP_H}
                  stroke="#1A1A2E" strokeWidth="1" />
              ))}

              {/* Diagonal accent lines (city road feel) */}
              {[100, 250, 400].map(x => (
                <Line key={`d${x}`} x1={x} y1={0} x2={x + 150} y2={MAP_H}
                  stroke="#1E1E3A" strokeWidth="0.8" strokeDasharray="6,10" />
              ))}

              {/* Zones */}
              {zones.map(zone => {
                const isSelected = selected?.id === zone.id;
                const cfg = RISK[zone.risk];
                return (
                  <G key={zone.id}>
                    {/* Outer ambient glow */}
                    <SvgCircle cx={zone.x} cy={zone.y} r={zone.r * 1.7}
                      fill={`url(#grad_${zone.risk})`} />
                    {/* Zone ring */}
                    <SvgCircle cx={zone.x} cy={zone.y} r={zone.r}
                      fill={cfg.glow}
                      stroke={cfg.color}
                      strokeWidth={isSelected ? 3 : 1.5}
                      strokeDasharray={isSelected ? undefined : '8,5'}
                    />
                    {/* Center dot */}
                    <SvgCircle cx={zone.x} cy={zone.y} r={5}
                      fill={cfg.color} />
                    {/* Zone name */}
                    <SvgText x={zone.x} y={zone.y - zone.r - 8}
                      fill={isSelected ? '#FFFFFF' : '#D4D4D8'}
                      fontSize={isSelected ? 14 : 12}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle">
                      {zone.name}
                    </SvgText>
                    {/* Risk badge */}
                    <SvgText x={zone.x} y={zone.y + 4}
                      fill={cfg.color}
                      fontSize={10}
                      fontWeight="bold"
                      textAnchor="middle">
                      {cfg.label}
                    </SvgText>
                    {/* Worker count */}
                    <SvgText x={zone.x} y={zone.y + 18}
                      fill="#888"
                      fontSize={10}
                      textAnchor="middle">
                      {zone.workers} workers
                    </SvgText>
                  </G>
                );
              })}
            </Svg>

            {/* Native touch targets over SVG zones */}
            {zones.map(zone => (
              <TouchableOpacity
                key={`tap_${zone.id}`}
                onPress={() => openSheet(zone)}
                activeOpacity={0.6}
                style={{
                  position: 'absolute',
                  left: zone.x - zone.r,
                  top: zone.y - zone.r,
                  width: zone.r * 2,
                  height: zone.r * 2,
                  borderRadius: zone.r,
                }}
              />
            ))}

            {/* Pulse rings for high-risk zones */}
            {zones
              .filter(z => z.risk === 'high')
              .map(zone => (
                <PulseRing key={`pulse_${zone.id}`}
                  x={zone.x} y={zone.y} r={zone.r}
                  color={RISK.high.color} />
              ))}
          </View>
        </ScrollView>
      </ScrollView>

      {/* ── Legend ── */}
      <View style={s.legend}>
        {(['high', 'medium', 'safe'] as const).map(r => (
          <View key={r} style={s.legendRow}>
            <View style={[s.legendDot, { backgroundColor: RISK[r].color }]} />
            <Text style={s.legendTxt}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
          </View>
        ))}
      </View>

      {/* ── Zone Detail Sheet ── */}
      {selected && (
        <Animated.View style={[s.sheet, { transform: [{ translateY: sheetAnim }] }]}>
          <View style={s.sheetHandle} />
          {/* Header */}
          <View style={s.sheetRow}>
            <View style={[s.riskChip, { backgroundColor: RISK[selected.risk].color + '25', borderColor: RISK[selected.risk].color }]}>
              <Text style={[s.riskChipTxt, { color: RISK[selected.risk].color }]}>
                {RISK[selected.risk].label} RISK
              </Text>
            </View>
            <Text style={s.sheetTitle}>{selected.name}</Text>
            <TouchableOpacity onPress={closeSheet} style={s.closeBtn}>
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Stats row */}
          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={s.statVal}>🌧️ {selected.rainfall}mm</Text>
              <Text style={s.statLabel}>Expected Rain</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statVal}>👥 {selected.workers}</Text>
              <Text style={s.statLabel}>Workers Active</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statVal}>₹{selected.payout}</Text>
              <Text style={s.statLabel}>Claim Payout</Text>
            </View>
          </View>

          {/* Simulate button */}
          <TouchableOpacity
            style={[s.simBtn, { backgroundColor: RISK[selected.risk].color }]}
            onPress={handleSimulate}
          >
            <CloudRain size={18} color="#FFF" />
            <Text style={s.simBtnTxt}>Simulate Rain in {selected.name}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  authCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  authTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', marginTop: 20, marginBottom: 24, textAlign: 'center' },
  authBtn: { backgroundColor: '#F97316', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  authBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  header: { backgroundColor: '#0F0F13', borderBottomWidth: 1, borderBottomColor: '#1A1A2E' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  headerCity: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  headerSub: { color: '#666', fontSize: 12, marginTop: 2 },
  liveChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F2910', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, gap: 6, borderWidth: 1, borderColor: '#10B981' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  liveTxt: { color: '#10B981', fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  legend: {
    position: 'absolute', bottom: 110, right: 16,
    backgroundColor: 'rgba(10,10,15,0.92)', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#1A1A2E', gap: 8,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendTxt: { color: '#D4D4D8', fontSize: 12, fontWeight: '600' },

  sheet: {
    position: 'absolute', bottom: 90, left: 12, right: 12,
    backgroundColor: '#141418', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#2A2A3A',
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 12,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sheetTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', flex: 1 },
  riskChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  riskChipTxt: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2A2A3A', justifyContent: 'center', alignItems: 'center' },
  closeTxt: { color: '#888', fontSize: 14, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#1C1C24', borderRadius: 12, padding: 12, alignItems: 'center' },
  statVal: { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  statLabel: { color: '#666', fontSize: 11, textAlign: 'center' },

  simBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 14, paddingVertical: 15,
  },
  simBtnTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
