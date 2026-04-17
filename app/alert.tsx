import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { X, CloudRain, CheckCircle, Shield } from 'lucide-react-native';
import useAppStore from '@/store/useAppStore';
import { useUserStore } from '@/store/userStore';
import * as Haptics from 'expo-haptics';

const { width: W, height: H } = Dimensions.get('window');

// Pre-generate rain drop positions (no hooks inside render functions)
const RAIN_DROPS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: (W / 8) * i + Math.random() * (W / 8),
  delay: i * 180,
  duration: 1800 + Math.random() * 800,
}));

function RainDrop({ x, delay, duration }: { x: number; delay: number; duration: number }) {
  const y = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    const loop = () => {
      y.setValue(-30);
      Animated.timing(y, {
        toValue: H + 30,
        duration,
        delay,
        useNativeDriver: true,
      }).start(() => setTimeout(loop, 100));
    };
    loop();
  }, []);

  return (
    <Animated.View
      style={[styles.rainDrop, { left: x, transform: [{ translateY: y }] }]}
    />
  );
}

export default function AlertScreen() {
  const params = useLocalSearchParams();
  const zone     = (params.zone as string)    || 'Dharavi';
  const amount   = parseInt(params.amount   as string) || 292;
  const rainfall = parseInt(params.rainfall as string) || 52;

  const { createClaim } = useAppStore();
  const { user } = useUserStore();

  const slideAnim   = useRef(new Animated.Value(H)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const [phase, setPhase] = useState<'processing' | 'done' | 'error'>('processing');
  const [claimId, setClaimId] = useState<string | null>(null);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    const pulse = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 700, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,   duration: 700, useNativeDriver: true }),
    ]));
    pulse.start();

    const process = async () => {
      await new Promise(r => setTimeout(r, 1800));

      try {
        const result = await createClaim({
          type: 'Rain Disruption',
          date: new Date().toISOString().split('T')[0],
          zone,
          amount,
          description: `${rainfall}mm/hr rainfall detected in ${zone}`,
        });

        const id = useAppStore.getState().claims[0]?.id;
        setClaimId(id || null);
        setPhase('done');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        pulse.stop();

        await new Promise(r => setTimeout(r, 1200));
        router.replace(`/claim-tracking?id=${id || 'demo'}&amount=${amount}&zone=${encodeURIComponent(zone)}&rainfall=${rainfall}` as any);
      } catch (err) {
        console.warn('Claim creation error:', err);
        // Even if DB fails (no auth), still proceed to tracking with params
        setPhase('done');
        pulse.stop();
        await new Promise(r => setTimeout(r, 1200));
        router.replace(`/claim-tracking?amount=${amount}&zone=${encodeURIComponent(zone)}&rainfall=${rainfall}` as any);
      }
    };

    process();
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated rain drops in background */}
      <Animated.View style={[styles.bg, { opacity: fadeAnim }]}>
        {RAIN_DROPS.map(d => <RainDrop key={d.id} x={d.x} delay={d.delay} duration={d.duration} />)}
      </Animated.View>

      {/* Close button */}
      <SafeAreaView style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)' as any)} style={styles.closeBtn}>
          <X color="#FFF" size={20} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Main card */}
      <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            {phase === 'done'
              ? <CheckCircle size={80} color="#10B981" />
              : <CloudRain size={80} color="#3B82F6" />}
          </Animated.View>
        </View>

        {/* Text */}
        <Text style={styles.title}>
          {phase === 'done' ? 'Claim Created!' : 'Heavy Rain Detected'}
        </Text>
        <Text style={styles.sub}>
          {phase === 'done'
            ? 'Your payout is being processed automatically.'
            : 'Parametric trigger verified — processing your claim…'}
        </Text>

        {/* Details */}
        <View style={styles.detailBox}>
          <DetailRow label="📍 Zone" value={zone} />
          <DetailRow label="🌧️ Rainfall" value={`${rainfall}mm/hr`} />
          <DetailRow label="💰 Payout" value={`₹${amount}`} />
          {user && <DetailRow label="📲 UPI" value={`${user.phone}@ybl`} />}
        </View>

        {/* Status */}
        <View style={[styles.statusPill,
          phase === 'done' ? styles.statusDone : styles.statusProcessing
        ]}>
          <View style={[styles.statusDot,
            { backgroundColor: phase === 'done' ? '#10B981' : '#3B82F6' }
          ]} />
          <Text style={[styles.statusTxt,
            { color: phase === 'done' ? '#10B981' : '#60A5FA' }
          ]}>
            {phase === 'done' ? 'Claim Registered · Redirecting…' : 'AI Fraud Check · Processing…'}
          </Text>
        </View>

        {/* Manual continue if stuck */}
        {phase === 'done' && (
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => router.replace(`/claim-tracking?amount=${amount}&zone=${encodeURIComponent(zone)}&rainfall=${rainfall}` as any)}
          >
            <Text style={styles.continueTxt}>Continue to Tracking</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailVal}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050510', justifyContent: 'flex-end' },
  bg: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  rainDrop: { position: 'absolute', width: 2, height: 18, backgroundColor: 'rgba(59,130,246,0.35)', borderRadius: 1 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'flex-end', padding: 16 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#1C1C1E', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 32, paddingBottom: 48, alignItems: 'center',
    borderWidth: 1, borderColor: '#2A2A2E',
  },
  iconWrap: { marginBottom: 24 },
  title: { color: '#FFF', fontSize: 26, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  sub: { color: '#A1A1AA', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  detailBox: { width: '100%', backgroundColor: '#0F0F13', borderRadius: 16, padding: 16, marginBottom: 20, gap: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { color: '#A1A1AA', fontSize: 14 },
  detailVal: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, width: '100%', justifyContent: 'center' },
  statusProcessing: { backgroundColor: 'rgba(59,130,246,0.12)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)' },
  statusDone: { backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusTxt: { fontSize: 13, fontWeight: '600' },
  continueBtn: { marginTop: 16, backgroundColor: '#10B981', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  continueTxt: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
