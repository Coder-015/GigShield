import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, X, ShieldCheck, AlertTriangle } from 'lucide-react-native';
import { analyzeClaim } from '@/services/fraudDetectionEngine';
import { useUserStore } from '@/store/userStore';
import useAppStore from '@/store/useAppStore';
import Svg, { Path, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const { height: H } = Dimensions.get('window');

export default function ClaimTracking() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const claims = useAppStore(state => state.claims);
  const { user } = useUserStore();

  const storedClaim = claims.find(c => c.id === id);
  const targetClaim: any = storedClaim ?? {
    id: id || 'GS-SIM',
    disruption_type: 'Rain Disruption',
    triggered_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    zone: (params.zone as string) || 'Dharavi',
    amount: parseInt(params.amount as string) || 292,
    status: 'completed',
    description: `Heavy rain in ${(params.zone as string) || 'Dharavi'}`,
  };

  const amount = targetClaim.amount || parseInt(params.amount as string) || 292;
  const zone = targetClaim.zone || (params.zone as string) || 'Dharavi';
  const claimDate = new Date(targetClaim.triggered_at || targetClaim.createdAt || new Date());

  const isNewClaim = (Date.now() - claimDate.getTime()) / 1000 < 90;

  const [fraudResult, setFraudResult] = useState<any>(null);

  useEffect(() => {
    const accountAgeMs = user?.created_at ? Date.now() - new Date(user.created_at).getTime() : 120 * 24 * 60 * 60 * 1000;
    const accountAgeDays = Math.round(accountAgeMs / (1000 * 60 * 60 * 24));
    const rainfallMM = parseInt((params.rainfall as string) || '52') || 52;
    const claimedHours = rainfallMM > 60 ? 6 : rainfallMM > 30 ? 4 : 2.5;

    const result = analyzeClaim({
      userId: user?.id || 'user', zone, city: user?.city || 'Mumbai', claimedHours, claimedAmount: amount,
      userWeeklyBaseline: user?.weekly_earnings ? parseInt(String(user.weekly_earnings)) : 4000,
      userPastClaims: claims.filter(c => c.status === 'completed').length,
      weatherRainfall: rainfallMM, weatherConfirmed: rainfallMM > 0, submissionTime: claimDate,
      userAccountAgeDays: Math.max(accountAgeDays, 1),
    });
    setFraudResult(result);
  }, []);

  const [completedSteps, setCompletedSteps] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Draw Path Animation
  const drawAnim = useRef(new Animated.Value(0)).current;
  const pathLength = 280; // approximate length of 5 steps vertical line

  const t = (offsetMins: number) => {
    const d = new Date(claimDate);
    d.setMinutes(d.getMinutes() + offsetMins);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const isFraudLocked = fraudResult && fraudResult.isFraud;

  const STEPS = [
    { id: 1, title: 'Disruption detected',  time: t(0), sub: `${targetClaim.description || 'Heavy weather'}`, delay: 0 },
    { id: 2, title: 'Trigger validated',     time: t(1), sub: 'Parametric rainfall threshold exceeded',  delay: isNewClaim ? 1200 : 0 },
    { id: 3, title: isFraudLocked ? 'Fraud Detected' : 'Fraud check passed',    time: t(2), sub: isFraudLocked ? 'Policy violation flagged by Risk Engine.' : 'GPS location & activity verified',         delay: isNewClaim ? 2400 : 0 },
    ...(isFraudLocked ? [] : [
      { id: 4, title: 'Payout processing',     time: t(4), sub: 'Transferring to UPI wallet…',              delay: isNewClaim ? 3600 : 0 },
      { id: 5, title: `₹${amount} credited`,   time: t(6), sub: `Transfer complete to ${user?.phone || 'UPI'}`, delay: isNewClaim ? 4800 : 0 },
    ])
  ];

  const stepOpacities = useRef(STEPS.map(() => new Animated.Value(0))).current;

  // We recalculate path length dynamically based on if fraud is triggered (array length is 3 instead of 5)
  const activePathLength = isFraudLocked ? 140 : pathLength;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    // 1. If it's a completely new simulated claim, always play the full animation!
    if (isNewClaim) {
      // Simulate live physical drawing line
      Animated.timing(drawAnim, { toValue: activePathLength, duration: isFraudLocked ? 2400 : 5000, useNativeDriver: true }).start();
      
      STEPS.forEach((step, i) => {
        setTimeout(() => {
          setCompletedSteps(i + 1);
          if (isFraudLocked && i === 2) {
             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } else {
             Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          Animated.timing(stepOpacities[i], { toValue: 1, duration: 400, useNativeDriver: true }).start();
          
          if (i === STEPS.length - 1 && !isFraudLocked) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }, step.delay);
      });
      return;
    }
    
    // 2. If it's an old claim, just snap it to the exact state it's logged as
    if (targetClaim.status === 'processing' && !isFraudLocked) {
      setCompletedSteps(2);
      Animated.timing(drawAnim, { toValue: activePathLength * 0.4, duration: 1000, useNativeDriver: true }).start();
      stepOpacities.slice(0, 2).forEach(a => a.setValue(1));
      return;
    }
    if (targetClaim.status === 'rejected' || isFraudLocked) {
      setCompletedSteps(3);
      Animated.timing(drawAnim, { toValue: activePathLength, duration: 500, useNativeDriver: true }).start();
      stepOpacities.slice(0, 3).forEach(a => a.setValue(1));
      return;
    }

    setCompletedSteps(5);
    Animated.timing(drawAnim, { toValue: activePathLength, duration: 500, useNativeDriver: true }).start();
    stepOpacities.forEach(a => a.setValue(1));
  }, [isFraudLocked]);

  const strokeDashoffset = drawAnim.interpolate({
    inputRange: [0, pathLength],
    outputRange: [pathLength, 0],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
            <X color="#A1A1AA" size={24} />
          </TouchableOpacity>
        </View>

        <Animated.View style={[s.content, { opacity: fadeAnim }]}>
          <Text style={s.title}>Claim #{targetClaim.claim_number || targetClaim.id?.slice(0, 8) || 'SIM'}</Text>
          <View style={s.amountCont}>
            <Text style={s.amountLbl}>CLAIM AMOUNT</Text>
            <Text style={s.amountVal}>₹{amount}</Text>
          </View>

          {/* Graphical Progress Step Tracker */}
          <View style={s.timelineWrapper}>
            {/* The SVG physical stroke path */}
            <View style={s.svgLayer}>
              <Svg width="40" height="320" viewBox="0 0 40 320">
                {/* Background Track */}
                <Path d="M 20 20 L 20 300" stroke="rgba(255,255,255,0.05)" strokeWidth="4" strokeLinecap="round" />
                {/* Animated Draw Track */}
                <AnimatedPath 
                  d="M 20 20 L 20 300" 
                  stroke="#10B981" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeDasharray={pathLength}
                  strokeDashoffset={strokeDashoffset}
                />
              </Svg>
            </View>

            <View style={s.stepsContainer}>
              {STEPS.map((step, i) => {
                const isStepDrawn = completedSteps > i;
                return (
                  <View key={step.id} style={s.stepRow}>
                    <View style={s.indicator}>
                       <View style={[s.dot, isStepDrawn && s.dotActive, isFraudLocked && i === 2 && isStepDrawn && { backgroundColor: '#EF4444', borderColor: '#EF4444', shadowColor: '#EF4444' }]} />
                    </View>
                    <Animated.View style={[s.stepText, { opacity: Math.max(isStepDrawn ? 1 : 0.3, stepOpacities[i] as any) }]}>
                      <View style={s.stepHead}>
                        <Text style={[s.stepTitle, isStepDrawn && { color: isFraudLocked && i === 2 ? '#EF4444' : '#10B981' }]}>{step.title}</Text>
                        <Text style={s.stepTime}>{step.time}</Text>
                      </View>
                      <Text style={s.stepSub}>{step.sub}</Text>
                    </Animated.View>
                  </View>
                );
              })}
            </View>
          </View>

          {completedSteps === STEPS.length && !isFraudLocked && (
            <Animated.View style={{ alignItems: 'center', marginTop: 40, opacity: fadeAnim }}>
              <TouchableOpacity style={s.payoutBtn} onPress={() => router.push('/payout-success' as any)}>
                <CheckCircle size={20} color="#FFF" />
                <Text style={s.btnTxt}>View Payout Confirmation</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {completedSteps === STEPS.length && isFraudLocked && (
            <Animated.View style={{ alignItems: 'center', marginTop: 40, opacity: fadeAnim }}>
              <TouchableOpacity style={[s.payoutBtn, { backgroundColor: '#EF4444', shadowColor: '#EF4444' }]} onPress={() => router.back()}>
                <X size={20} color="#FFF" />
                <Text style={s.btnTxt}>Claim Rejected</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Engine Debug Info */}
          {fraudResult && (
            <View style={s.debugBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                 <ShieldCheck size={16} color="#71717A" />
                 <Text style={s.debugTitle}> ML FRAUD ENGINE ANALYSIS</Text>
              </View>
              <Text style={s.debugTxt}>Trust Score: <Text style={{ color: fraudResult.isFraud ? '#EF4444' : '#10B981' }}>{fraudResult.trustScore}/100</Text></Text>
              {fraudResult.flags.map((f: string, i: number) => (
                <Text key={i} style={[s.debugTxt, { color: '#F59E0B' }]}>• {f}</Text>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F13' },
  header: { padding: 20 },
  closeBtn: { alignSelf: 'flex-end', padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20 },
  content: { paddingHorizontal: 24, paddingBottom: 60 },
  title: { fontSize: 32, fontWeight: '900', color: '#FFF', marginBottom: 24 },
  amountCont: { backgroundColor: 'rgba(28,28,30,0.6)', borderRadius: 20, padding: 24, marginBottom: 40, borderWidth: 1, borderColor: '#333336' },
  amountLbl: { color: '#A1A1AA', fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  amountVal: { color: '#10B981', fontSize: 36, fontWeight: '900' },

  timelineWrapper: { flexDirection: 'row', position: 'relative' },
  svgLayer: { width: 40, alignItems: 'center', paddingTop: 8 },
  stepsContainer: { flex: 1, gap: 30, paddingTop: 6 },
  stepRow: { flexDirection: 'row' },
  indicator: { width: 0, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', right: 12, width: 14, height: 14, borderRadius: 7, backgroundColor: '#333336', borderWidth: 2, borderColor: '#0F0F13' },
  dotActive: { backgroundColor: '#10B981', borderColor: '#10B981', shadowColor: '#10B981', shadowOpacity: 0.5, shadowRadius: 10, elevation: 8 },
  stepText: { flex: 1 },
  stepHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  stepTime: { color: '#71717A', fontSize: 12, fontWeight: '600' },
  stepSub: { color: '#A1A1AA', fontSize: 14, marginTop: 4, lineHeight: 20 },

  payoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F97316', paddingVertical: 18, paddingHorizontal: 24, borderRadius: 20, gap: 10, shadowColor: '#F97316', shadowOpacity: 0.4, shadowRadius: 15, elevation: 10 },
  btnTxt: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  debugBox: { marginTop: 40, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#333', backgroundColor: '#1C1C1E' },
  debugTitle: { color: '#71717A', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  debugTxt: { color: '#A1A1AA', fontSize: 13, marginBottom: 4, lineHeight: 20 },
});
