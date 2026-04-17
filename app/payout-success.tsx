import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useUserStore } from '@/store/userStore';
import useAppStore from '@/store/useAppStore';
import * as Haptics from 'expo-haptics';

const { width: W, height: H } = Dimensions.get('window');

const CONFETTI = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * W,
  color: ['#10B981', '#F97316', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'][i % 6],
  delay: i * 120,
  duration: 2800 + Math.random() * 1500,
}));

function ConfettiPiece({ x, color, delay, duration }: { x: number; color: string; delay: number; duration: number }) {
  const y = useRef(new Animated.Value(-20)).current;
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(y,   { toValue: H + 20, duration, delay, useNativeDriver: true }),
      Animated.timing(rot, { toValue: 360,    duration, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[
      styles.confetti,
      { left: x, backgroundColor: color, transform: [
        { translateY: y },
        { rotate: rot.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }
      ]}
    ]} />
  );
}

export default function PayoutSuccess() {
  const params = useLocalSearchParams();
  const amount   = parseInt(params.amount as string) || 292;
  const { user } = useUserStore();
  const { claims } = useAppStore();

  const completedClaims = claims.filter(c => c.status === 'completed').length;
  const totalPaid       = claims.filter(c => c.status === 'completed').reduce((s, c) => s + (c.amount || 0), 0);
  const upiId           = `${user?.phone || ''}@ybl`;
  const now             = new Date().toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const circleAnim  = useRef(new Animated.Value(0)).current;
  const checkAnim   = useRef(new Animated.Value(0)).current;
  const [fadeAnim]  = useState(new Animated.Value(0));
  const [showContent, setShowContent] = useState(false);

  const circleR           = 40;
  const circleCircumf     = 2 * Math.PI * circleR;
  const circleDashOffset  = circleAnim.interpolate({ inputRange: [0, 1], outputRange: [circleCircumf, 0] }) as any;
  const checkLen          = 60;
  const checkDashOffset   = checkAnim.interpolate({ inputRange: [0, 1], outputRange: [checkLen, 0] }) as any;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.timing(circleAnim, { toValue: 1, duration: 800, useNativeDriver: false }).start();
    setTimeout(() => Animated.timing(checkAnim, { toValue: 1, duration: 400, useNativeDriver: false }).start(), 800);
    setTimeout(() => {
      setShowContent(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 1200);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Confetti */}
      <View style={styles.confettiWrap} pointerEvents="none">
        {CONFETTI.map(p => (
          <ConfettiPiece key={p.id} x={p.x} color={p.color} delay={p.delay} duration={p.duration} />
        ))}
      </View>

      <View style={styles.content}>
        {/* Animated SVG checkmark */}
        <View style={styles.svgWrap}>
          <Svg width={120} height={120}>
            <Circle
              cx={60} cy={60} r={circleR}
              stroke="#10B981" strokeWidth={4} fill="none"
              strokeDasharray={circleCircumf} strokeDashoffset={circleDashOffset}
            />
            <Path
              d="M 35 60 L 50 75 L 85 40"
              stroke="#10B981" strokeWidth={4} fill="none"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={checkLen} strokeDashoffset={checkDashOffset}
            />
          </Svg>
        </View>

        {/* Amount headline */}
        {showContent && (
          <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
            <Text style={styles.amountTxt}>₹{amount} Credited!</Text>
            <Text style={styles.subTxt}>Transferred to your UPI wallet</Text>
            <Text style={styles.upiTxt}>{upiId} · {now}</Text>
            <View style={styles.timePill}>
              <Text style={styles.timePillTxt}>✅ Processed in under 2 minutes</Text>
            </View>
          </Animated.View>
        )}

        {/* Summary */}
        {showContent && (
          <Animated.View style={[styles.summaryCard, { opacity: fadeAnim }]}>
            <Text style={styles.summaryTitle}>Claim Summary</Text>
            <SRow label="This payout"       val={`₹${amount}`}        valColor="#10B981" />
            <SRow label="Total claims paid" val={`${completedClaims}`} />
            <SRow label="Lifetime payout"   val={`₹${totalPaid}`}     />
          </Animated.View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(tabs)/claims' as any)}
          >
            <Text style={styles.primaryBtnTxt}>View All Claims</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace('/(tabs)' as any)}
          >
            <Text style={styles.secondaryBtnTxt}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SRow({ label, val, valColor }: { label: string; val: string; valColor?: string }) {
  return (
    <View style={styles.sRow}>
      <Text style={styles.sLabel}>{label}</Text>
      <Text style={[styles.sVal, valColor ? { color: valColor } : {}]}>{val}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F13' },
  confettiWrap: { ...StyleSheet.absoluteFillObject as any, overflow: 'hidden' },
  confetti: { position: 'absolute', width: 8, height: 8, borderRadius: 2 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  svgWrap: { alignItems: 'center', marginBottom: 28 },
  center: { alignItems: 'center', marginBottom: 24 },
  amountTxt: { fontSize: 38, fontWeight: '900', color: '#10B981', textAlign: 'center', marginBottom: 8 },
  subTxt: { fontSize: 16, color: '#A1A1AA', textAlign: 'center', marginBottom: 4 },
  upiTxt: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 14 },
  timePill: { backgroundColor: 'rgba(16,185,129,0.12)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  timePillTxt: { color: '#10B981', fontSize: 13, fontWeight: '600' },
  summaryCard: {
    backgroundColor: '#1C1C1E', borderRadius: 18, padding: 20,
    marginBottom: 24, borderWidth: 1, borderColor: '#2A2A2E',
  },
  summaryTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 14, textAlign: 'center' },
  sRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2A2A2E' },
  sLabel: { color: '#A1A1AA', fontSize: 14 },
  sVal: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: '#10B981', borderRadius: 16, paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  primaryBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center' },
  secondaryBtnTxt: { color: '#A1A1AA', fontSize: 15, fontWeight: '600' },
});
