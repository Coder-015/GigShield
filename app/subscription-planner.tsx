import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check, TrendingUp, Shield, Star, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';
import { useStats } from '@/store/useAppStore';
import { formatCurrency } from '@/utils';
import { supabase } from '@/lib/supabase';

interface Plan {
  id: string;
  name: string;
  weeklyPrice: number;
  monthlyPrice: number;
  coverage: number;
  features: string[];
  popular?: boolean;
  color: string;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    weeklyPrice: 25,
    monthlyPrice: 100,
    coverage: 500,
    features: [
      'Coverage up to ₹500/day',
      'Basic weather alerts',
      'Standard support',
      'Monthly reports'
    ],
    color: '#6B7280'
  },
  {
    id: 'standard',
    name: 'Standard',
    weeklyPrice: 49,
    monthlyPrice: 196,
    coverage: 700,
    features: [
      'Coverage up to ₹700/day',
      'Real-time weather alerts',
      'Priority support',
      'Weekly reports',
      'AI risk predictions'
    ],
    popular: true,
    color: '#F97316'
  },
  {
    id: 'pro',
    name: 'Pro',
    weeklyPrice: 79,
    monthlyPrice: 316,
    coverage: 1000,
    features: [
      'Coverage up to ₹1000/day',
      'Advanced weather alerts',
      '24/7 dedicated support',
      'Daily reports',
      'AI risk predictions',
      'Multi-city coverage'
    ],
    color: '#0D9488'
  }
];

export default function SubscriptionPlannerScreen() {
  const { user } = useUserStore();
  const stats = useStats();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(
    plans.find(p => p.name.toLowerCase() === user?.plan?.toLowerCase()) || plans[1]
  );
  const [isMonthly, setIsMonthly] = useState(false);
  const [weeklyEarnings, setWeeklyEarnings] = useState('');
  const [cityRisk, setCityRisk] = useState('medium');
  const [showCalculator, setShowCalculator] = useState(false);

  const calculatorResults = useMemo(() => {
    if (!weeklyEarnings || !cityRisk) return null;

    const earnings = parseInt(weeklyEarnings.replace(/[^\d]/g, ''));
    if (isNaN(earnings)) return null;

    const riskMultiplier = cityRisk === 'high' ? 0.8 : cityRisk === 'medium' ? 0.6 : 0.4;
    const expectedLoss = earnings * riskMultiplier;
    
    let recommendedPlan = plans[0];
    let maxCoverage = 0;

    plans.forEach(plan => {
      if (plan.coverage > maxCoverage && plan.coverage <= expectedLoss * 1.5) {
        recommendedPlan = plan;
        maxCoverage = plan.coverage;
      }
    });

    const riskCoverage = Math.min((recommendedPlan.coverage / expectedLoss) * 100, 100);

    return {
      recommendedPlan,
      expectedLoss,
      riskCoverage: Math.round(riskCoverage),
      weeklyPremium: recommendedPlan.weeklyPrice,
      monthlyPremium: recommendedPlan.monthlyPrice
    };
  }, [weeklyEarnings, cityRisk]);

  const renderPlanCard = (plan: Plan) => {
    const isSelected = selectedPlan?.id === plan.id;
    const price = isMonthly ? plan.monthlyPrice : plan.weeklyPrice;
    const priceText = isMonthly ? '/month' : '/week';

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.selectedPlanCard,
          plan.popular && styles.popularPlanCard
        ]}
        onPress={() => setSelectedPlan(plan)}
        activeOpacity={0.8}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Star size={12} color="#FFFFFF" />
            <Text style={styles.popularBadgeText}>Most Popular</Text>
          </View>
        )}
        
        <View style={styles.planHeader}>
          <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
          <View style={styles.planPrice}>
            <Text style={styles.priceCurrency}>₹</Text>
            <Text style={styles.priceAmount}>{price}</Text>
            <Text style={styles.pricePeriod}>{priceText}</Text>
          </View>
        </View>

        <View style={styles.coverageInfo}>
          <Shield size={16} color={plan.color} />
          <Text style={styles.coverageText}>Coverage up to {formatCurrency(plan.coverage)}/day</Text>
        </View>

        <View style={styles.featuresList}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Check size={14} color="#10B981" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCalculator = () => {
    if (!showCalculator) return null;

    return (
      <View style={styles.calculatorContainer}>
        <View style={styles.calculatorContent}>
          <View style={styles.calculatorHeader}>
            <TrendingUp size={20} color="#F97316" />
            <Text style={styles.calculatorTitle}>Smart Plan Calculator</Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Weekly Earnings</Text>
            <TextInput
              style={styles.input}
              value={weeklyEarnings}
              onChangeText={setWeeklyEarnings}
              placeholder="Enter your weekly earnings"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>City Risk Level</Text>
            <View style={styles.riskButtons}>
              {['low', 'medium', 'high'].map((risk) => (
                <TouchableOpacity
                  key={risk}
                  style={[
                    styles.riskButton,
                    cityRisk === risk && styles.riskButtonActive
                  ]}
                  onPress={() => setCityRisk(risk)}
                >
                  <Text style={[
                    styles.riskButtonText,
                    cityRisk === risk && styles.riskButtonTextActive
                  ]}>
                    {risk.charAt(0).toUpperCase() + risk.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {calculatorResults && (
            <View style={styles.resultsSection}>
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Recommended Plan</Text>
                <Text style={[styles.resultValue, { color: calculatorResults.recommendedPlan.color }]}>
                  {calculatorResults.recommendedPlan.name}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Expected Loss</Text>
                  <Text style={styles.resultValue}>
                    {formatCurrency(calculatorResults.expectedLoss)}
                  </Text>
                </View>
                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Risk Coverage</Text>
                  <Text style={styles.resultValue}>{calculatorResults.riskCoverage}%</Text>
                </View>
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Weekly Premium</Text>
                <Text style={styles.resultValue}>
                  {formatCurrency(calculatorResults.weeklyPremium)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const [processingPayment, setProcessingPayment] = useState(false);
  const [payModal, setPayModal] = useState(false);

  const handleActivatePlan = () => {
    if (!selectedPlan) return;
    setPayModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan || !user) return;
    setProcessingPayment(true);
    await new Promise(r => setTimeout(r, 2000));
    try {
      await supabase
        .from('users')
        .update({ plan: selectedPlan.name.toLowerCase() })
        .eq('id', user.id);
      useUserStore.getState().setUser({ user: { ...user, plan: selectedPlan.name.toLowerCase() }, isAuthenticated: true });
      setPayModal(false);
      setProcessingPayment(false);
      Alert.alert('✅ Subscribed!', `You are now on the ${selectedPlan.name} plan! ₹${isMonthly ? selectedPlan.monthlyPrice : selectedPlan.weeklyPrice} deducted via UPI.`, [{ text: 'Done', onPress: () => router.back() }]);
    } catch {
      setProcessingPayment(false);
      Alert.alert('Error', 'Could not activate plan. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Choose Your Plan</Text>
          <Text style={styles.screenSubtitle}>
            Protect your income with AI-powered insurance
          </Text>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleOption, !isMonthly && styles.activeToggle]}
            onPress={() => setIsMonthly(false)}
          >
            <Text style={[styles.toggleText, !isMonthly && styles.activeToggleText]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleOption, isMonthly && styles.activeToggle]}
            onPress={() => setIsMonthly(true)}
          >
            <Text style={[styles.toggleText, isMonthly && styles.activeToggleText]}>
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.plansContainer}>
          {plans.map(renderPlanCard)}
        </View>

        <TouchableOpacity
          style={styles.calculatorToggle}
          onPress={() => setShowCalculator(!showCalculator)}
        >
          <View style={styles.calculatorToggleContent}>
            <TrendingUp size={20} color="#F97316" />
            <Text style={styles.calculatorToggleText}>
              {showCalculator ? 'Hide' : 'Show'} Smart Calculator
            </Text>
            <ChevronRight 
              size={20} 
              color="#6B7280" 
              style={[styles.chevron, showCalculator && styles.chevronRotated]}
            />
          </View>
        </TouchableOpacity>

        {renderCalculator()}

        <View style={styles.ctaContainer}>
          <View style={styles.selectedPlanInfo}>
            <Text style={styles.selectedPlanText}>
              Selected: <Text style={styles.selectedPlanName}>{selectedPlan?.name}</Text>
            </Text>
            <Text style={styles.selectedPlanPrice}>
              {isMonthly ? 'Monthly' : 'Weekly'}: ₹{isMonthly ? selectedPlan?.monthlyPrice || 0 : selectedPlan?.weeklyPrice || 0}
            </Text>
          </View>

          <TouchableOpacity style={styles.activateBtn} onPress={handleActivatePlan} activeOpacity={0.85}>
            <Shield size={18} color="#FFF" />
            <Text style={styles.activateBtnTxt}>Activate {selectedPlan?.name} Plan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Payment Confirmation Modal */}
      <Modal visible={payModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.payModal}>
            <Text style={styles.payTitle}>Confirm Payment</Text>
            <Text style={styles.paySub}>You are subscribing to</Text>
            <Text style={[styles.payPlan, { color: selectedPlan?.color }]}>{selectedPlan?.name} Plan</Text>
            <View style={styles.payDetails}>
              <View style={styles.payRow}>
                <Text style={styles.payLabel}>{isMonthly ? 'Monthly' : 'Weekly'} Premium</Text>
                <Text style={styles.payVal}>₹{isMonthly ? selectedPlan?.monthlyPrice : selectedPlan?.weeklyPrice}</Text>
              </View>
              <View style={styles.payRow}>
                <Text style={styles.payLabel}>Daily Coverage</Text>
                <Text style={styles.payVal}>₹{selectedPlan?.coverage}</Text>
              </View>
              <View style={styles.payRow}>
                <Text style={styles.payLabel}>Payment via</Text>
                <Text style={styles.payVal}>{user?.phone}@ybl</Text>
              </View>
            </View>
            {processingPayment ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator color="#F97316" size="large" />
                <Text style={{ color: '#A1A1AA', marginTop: 12 }}>Processing payment…</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <TouchableOpacity style={styles.payCancelBtn} onPress={() => setPayModal(false)}>
                  <Text style={styles.payCancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.payConfirmBtn, { backgroundColor: selectedPlan?.color }]} onPress={handleConfirmPayment}>
                  <Text style={styles.payConfirmTxt}>Pay Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F13' },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 20, paddingBottom: 24 },
  screenTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  screenSubtitle: { fontSize: 16, color: '#A1A1AA' },
  toggleContainer: {
    flexDirection: 'row', backgroundColor: '#1C1C1E', borderRadius: 12, padding: 4, marginBottom: 24,
    borderWidth: 1, borderColor: '#333336',
  },
  toggleOption: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  activeToggle: { backgroundColor: '#F97316' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#A1A1AA' },
  activeToggleText: { color: '#FFFFFF' },
  plansContainer: { marginBottom: 24 },
  planCard: {
    backgroundColor: '#1C1C1E', borderRadius: 16, padding: 20, marginBottom: 16,
    borderWidth: 2, borderColor: '#333336',
  },
  selectedPlanCard: { borderColor: '#F97316' },
  popularPlanCard: { position: 'relative' },
  popularBadge: {
    position: 'absolute', top: -8, right: 16, backgroundColor: '#F97316',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', zIndex: 1,
  },
  popularBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  planHeader: { marginBottom: 16 },
  planName: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  planPrice: { flexDirection: 'row', alignItems: 'baseline' },
  priceCurrency: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  priceAmount: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  pricePeriod: { fontSize: 14, color: '#A1A1AA', marginLeft: 4 },
  coverageInfo: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E',
    padding: 12, borderRadius: 8, marginBottom: 16,
  },
  coverageText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginLeft: 8 },
  featuresList: { gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center' },
  featureText: { fontSize: 14, color: '#D4D4D8', marginLeft: 8 },
  calculatorToggle: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333336' },
  calculatorToggleContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calculatorToggleText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginLeft: 12, flex: 1 },
  chevron: { transform: [{ rotate: '0deg' }] },
  chevronRotated: { transform: [{ rotate: '90deg' }] },
  calculatorContainer: { backgroundColor: '#1C1C1E', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333336' },
  calculatorContent: { padding: 20 },
  calculatorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  calculatorTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginLeft: 8 },
  inputSection: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#D4D4D8', marginBottom: 8 },
  input: { backgroundColor: '#2C2C2E', borderRadius: 8, padding: 12, fontSize: 16, color: '#FFFFFF', marginBottom: 16, borderWidth: 1, borderColor: '#444' },
  riskButtons: { flexDirection: 'row', gap: 8 },
  riskButton: { flex: 1, backgroundColor: '#2C2C2E', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  riskButtonActive: { backgroundColor: '#F97316' },
  riskButtonText: { fontSize: 12, fontWeight: '600', color: '#A1A1AA' },
  riskButtonTextActive: { color: '#FFFFFF' },
  resultsSection: { gap: 12 },
  resultCard: { backgroundColor: '#2C2C2E', padding: 16, borderRadius: 12 },
  resultRow: { flexDirection: 'row', gap: 12 },
  resultLabel: { fontSize: 12, color: '#A1A1AA', marginBottom: 4 },
  resultValue: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  ctaContainer: { paddingTop: 20, paddingBottom: 40 },
  selectedPlanInfo: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#333336' },
  selectedPlanText: { fontSize: 14, color: '#A1A1AA', marginBottom: 4 },
  selectedPlanName: { fontWeight: 'bold', color: '#FFFFFF' },
  selectedPlanPrice: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  activateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F97316', borderRadius: 16, paddingVertical: 18, gap: 10, shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  activateBtnTxt: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  // Payment Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  payModal: { backgroundColor: '#1C1C1E', borderRadius: 24, padding: 24, width: '100%', borderWidth: 1, borderColor: '#333336' },
  payTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  paySub: { color: '#A1A1AA', fontSize: 14, textAlign: 'center', marginBottom: 4 },
  payPlan: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  payDetails: { backgroundColor: '#2C2C2E', borderRadius: 14, padding: 16, gap: 12 },
  payRow: { flexDirection: 'row', justifyContent: 'space-between' },
  payLabel: { color: '#A1A1AA', fontSize: 14 },
  payVal: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  payCancelBtn: { flex: 1, backgroundColor: '#2C2C2E', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  payCancelTxt: { color: '#A1A1AA', fontWeight: '700', fontSize: 15 },
  payConfirmBtn: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  payConfirmTxt: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
