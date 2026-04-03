import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Check, TrendingUp, Shield, Star, ChevronRight } from 'lucide-react-native';
import { useUser, useStats } from '@/store/useAppStore';
import useAppStore from '@/store/useAppStore';
import { formatCurrency } from '@/utils';
import { Button } from '@/components/Button';

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
  const user = useUser();
  const stats = useStats();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(
    plans.find(p => p.name === user?.plan) || plans[1]
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

  const handleActivatePlan = () => {
    if (!selectedPlan) return;
    
    Alert.alert(
      "Confirm Subscription",
      `Are you sure you want to activate the ${selectedPlan.name} plan for ₹${isMonthly ? selectedPlan.monthlyPrice : selectedPlan.weeklyPrice}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: () => {
            // Update the user store
            const store = useAppStore.getState();
            store.setUser({
              ...(store.user as any),
              plan: selectedPlan.name,
              isCovered: true
            });
            Alert.alert("Success", "Your subscription has been updated.");
            router.push('/(tabs)/profile');
          }
        }
      ]
    );
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
              {isMonthly ? 'Monthly' : 'Weekly'}: {formatCurrency(isMonthly ? selectedPlan?.monthlyPrice || 0 : selectedPlan?.weeklyPrice || 0)}
            </Text>
          </View>
          
          <Button
            title="Activate Plan"
            onPress={handleActivatePlan}
            variant="primary"
            size="large"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    fontFamily: 'System',
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'System',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#F97316',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'System',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlanCard: {
    borderColor: '#F97316',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  popularPlanCard: {
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#F97316',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: 'System',
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'System',
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceCurrency: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    fontFamily: 'System',
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    fontFamily: 'System',
  },
  pricePeriod: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    fontFamily: 'System',
  },
  coverageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  coverageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
    fontFamily: 'System',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 8,
    fontFamily: 'System',
  },
  calculatorToggle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  calculatorToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calculatorToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 12,
    flex: 1,
    fontFamily: 'System',
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronRotated: {
    transform: [{ rotate: '90deg' }],
  },
  calculatorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  calculatorContent: {
    padding: 20,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  calculatorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginLeft: 8,
    fontFamily: 'System',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    fontFamily: 'System',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 16,
    fontFamily: 'System',
  },
  riskButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  riskButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  riskButtonActive: {
    backgroundColor: '#F97316',
  },
  riskButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'System',
  },
  riskButtonTextActive: {
    color: '#FFFFFF',
  },
  resultsSection: {
    gap: 12,
  },
  resultCard: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
  },
  resultRow: {
    flexDirection: 'row',
    gap: 12,
  },
  resultLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'System',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    fontFamily: 'System',
  },
  ctaContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  selectedPlanInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedPlanText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'System',
  },
  selectedPlanName: {
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  selectedPlanPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    fontFamily: 'System',
  },
});
