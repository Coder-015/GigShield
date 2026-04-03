import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, X } from 'lucide-react-native';

import useAppStore from '@/store/useAppStore';

export default function ClaimTracking() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const claims = useAppStore(state => state.claims);
  
  const targetClaim: any = claims.find(c => c.id === id) || {
    id: id || 'GS-20240320-004',
    type: 'Rain Disruption',
    date: new Date().toISOString(),
    zone: 'Dharavi',
    amount: parseInt(params.amount as string) || 292,
    status: 'completed',
    description: 'Heavy rain detected',
    createdAt: new Date().toISOString()
  };

  const amount = targetClaim.amount;
  const [completedSteps, setCompletedSteps] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  const createdAt = new Date(targetClaim.createdAt);
  const time0 = createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  createdAt.setMinutes(createdAt.getMinutes() + 1);
  const time1 = createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  createdAt.setMinutes(createdAt.getMinutes() + 1);
  const time2 = createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  createdAt.setMinutes(createdAt.getMinutes() + 2);
  const time3 = createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  const STEPS = [
    { id: 1, title: 'Disruption detected', time: time0, sub: `${targetClaim.description} in ${targetClaim.zone}`, delay: 0 },
    { id: 2, title: 'Trigger validated', time: time1, sub: 'Parametric threshold exceeded', delay: targetClaim.status === 'processing' ? -1 : 1500 },
    { id: 3, title: 'Fraud check passed', time: time2, sub: 'GPS and activity verified', delay: targetClaim.status === 'processing' ? -1 : 3000 },
    { id: 4, title: 'Payout processing', time: time3, sub: 'Transferring to UPI...', delay: targetClaim.status === 'processing' ? -1 : 4500 },
    { id: 5, title: 'Credited to UPI', time: '...', sub: `Transfer complete — Rs. ${amount}`, delay: targetClaim.status === 'processing' ? -1 : 6000 },
  ];

  const stepOpacities = useRef(STEPS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.stagger(200, stepOpacities.map((anim: Animated.Value) => 
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    )).start();

    if (targetClaim.status !== 'rejected') {
      STEPS.forEach((step, index) => {
        if (step.delay >= 0) {
          setTimeout(() => {
            setCompletedSteps(index + 1);
            if (index === STEPS.length - 1 && targetClaim.status === 'completed') {
              setTimeout(() => {
                router.replace(`/payout-success?amount=${amount}` as any);
              }, 1500);
            }
          }, step.delay);
        } else if (targetClaim.status === 'processing') {
          setCompletedSteps(2);
        }
      });
    }
  }, []);

  const renderStep = (step: typeof STEPS[0], index: number) => {
    const isCompleted = completedSteps > index;
    const isActive = completedSteps === index;
    const isPending = completedSteps < index;

    return (
      <Animated.View key={step.id} style={[styles.stepContainer, { opacity: stepOpacities[index] }]}>
        <View style={styles.stepDotContainer}>
          <View style={[
            styles.stepDot,
            isCompleted && styles.stepDotCompleted,
            isActive && styles.stepDotActive,
            isPending && styles.stepDotPending,
          ]}>
            {isCompleted && <CheckCircle size={16} color="#FFFFFF" />}
            {isActive && (
              <Animated.View style={styles.pulsingDot}>
                <View style={styles.innerDot} />
              </Animated.View>
            )}
            {isPending && <View style={styles.innerDot} />}
          </View>
          
          {index < STEPS.length - 1 && (
            <View style={[
              styles.connectingLine,
              isCompleted && styles.connectingLineCompleted,
              isActive && styles.connectingLineActive,
              isPending && styles.connectingLinePending,
            ]} />
          )}
        </View>

        <View style={styles.stepContent}>
          <View style={styles.stepHeader}>
            <Text style={[
              styles.stepTitle,
              isCompleted && styles.stepTitleCompleted,
              isActive && styles.stepTitleActive,
              isPending && styles.stepTitlePending,
            ]}>
              {step.title}
            </Text>
            <Text style={[
              styles.stepTime,
              isCompleted && styles.stepTimeCompleted,
              isActive && styles.stepTimeActive,
              isPending && styles.stepTimePending,
            ]}>
              {step.time}
            </Text>
          </View>
          <Text style={[
            styles.stepSubtitle,
            isCompleted && styles.stepSubtitleCompleted,
            isActive && styles.stepSubtitleActive,
            isPending && styles.stepSubtitlePending,
          ]}>
            {step.sub}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Exit */}
      <TouchableOpacity onPress={() => router.replace('/(tabs)' as any)} style={styles.exitButton}>
        <X color="#A1A1AA" size={24} />
      </TouchableOpacity>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Claim Tracking</Text>
          <Text style={styles.headerSubtitle}>{targetClaim.id}</Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.stepsCard}>
          {STEPS.map((step, index) => renderStep(step, index))}
        </View>

        {/* Payout Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Payout Breakdown</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownText}>Trigger type</Text>
            <Text style={styles.breakdownEquals}>Rain / {targetClaim.zone}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownText}>Calculated Disruption</Text>
            <Text style={styles.breakdownEquals}>~ 4 hrs</Text>
          </View>
          <View style={styles.breakdownResult}>
            <Text style={styles.breakdownResultText}>Rs. {amount}</Text>
          </View>
        </View>

        {/* Track Button */}
        {completedSteps === STEPS.length && (
          <TouchableOpacity
            onPress={() => router.push(`/payout-success?amount=${amount}`)}
            style={styles.trackButton}
          >
            <Text style={styles.trackButtonText}>View Payout Details</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B', // Slightly darker root to frame the step card
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 50,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 24,
    marginBottom: 24, // spacing above breakdown
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#A1A1AA',
    fontSize: 16,
    fontWeight: '500',
  },
  stepsCard: {
    padding: 24,
    marginBottom: 24,
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#333336',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  stepDotContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stepDotCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  stepDotActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  stepDotPending: {
    backgroundColor: '#333336',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  pulsingDot: {
    // Pulsing logic
  },
  connectingLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  connectingLineCompleted: {
    backgroundColor: '#10B981',
  },
  connectingLineActive: {
    backgroundColor: '#3B82F6',
  },
  connectingLinePending: {
    backgroundColor: '#333336',
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  stepTitleCompleted: {
    color: '#10B981',
  },
  stepTitleActive: {
    color: '#60A5FA',
  },
  stepTitlePending: {
    color: '#6B7280',
  },
  stepTime: {
    fontSize: 14,
  },
  stepTimeCompleted: {
    color: '#10B981',
  },
  stepTimeActive: {
    color: '#60A5FA',
  },
  stepTimePending: {
    color: '#333336',
  },
  stepSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepSubtitleCompleted: {
    color: '#059669',
  },
  stepSubtitleActive: {
    color: '#93C5FD',
  },
  stepSubtitlePending: {
    color: '#4B5563',
  },
  breakdownCard: {
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#333336',
  },
  breakdownTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownText: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  breakdownEquals: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  breakdownResult: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333336',
    marginTop: 8,
  },
  breakdownResultText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
  },
  trackButton: {
    marginBottom: 20,
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
