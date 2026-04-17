import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, Switch, Modal, TextInput, ActivityIndicator, Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Bell, Shield, CreditCard, FileCheck, Settings,
  LogOut, ChevronRight, X, Check, TrendingUp, User, Edit3
} from 'lucide-react-native';
import { useStats } from '@/store/useAppStore';
import { useUserStore } from '@/store/userStore';
import { getInitials } from '@/utils';
import useAppStore from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { calculateMLPremium, getCurrentSeason, getZoneFloodHistory } from '@/services/mlPremiumEngine';
import * as Haptics from 'expo-haptics';

const PLANS = [
  { id: 'basic',    name: 'Basic',    price: 25, coverage: 500,  color: '#6B7280', desc: 'For occasional workers' },
  { id: 'standard', name: 'Standard', price: 49, coverage: 700,  color: '#F97316', desc: 'For regular full-timers', popular: true },
  { id: 'pro',      name: 'Pro',      price: 79, coverage: 1000, color: '#0D9488', desc: 'For top earners' },
];

export default function ProfileScreen() {
  const { user, isAuthenticated, isDemoMode, toggleDemoMode, clear } = useUserStore();
  const { loadUserStats, logout } = useAppStore();
  const stats = useStats();

  const [mlScore, setMlScore] = useState<number | null>(null);
  const [mlLabel, setMlLabel] = useState('…');
  const [mlPremium, setMlPremium] = useState<number | null>(null);
  const [planModal, setPlanModal] = useState(false);
  const [confirmPlan, setConfirmPlan] = useState<typeof PLANS[0] | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (isAuthenticated) loadUserStats();
    if (user) {
      const r = calculateMLPremium({
        city: user.city, zone: user.zone,
        platform: user.platform || 'General',
        weeklyEarnings: 4000, monthsActive: 4,
        pastClaims: stats?.completedClaims || 0,
        currentSeason: getCurrentSeason(),
        zoneFloodHistory: getZoneFloodHistory(user.zone),
        avgWeeklyHours: 45,
      });
      setMlScore(r.riskScore);
      setMlPremium(r.basePremium);
      setMlLabel(r.riskScore >= 70 ? 'HIGH' : r.riskScore >= 45 ? 'MEDIUM' : 'LOW');
    }
  }, [isAuthenticated, user, stats?.completedClaims]);

  const currentPlan = PLANS.find(p => p.name.toLowerCase() === user?.plan?.toLowerCase()) || PLANS[1];
  const riskColor = mlLabel === 'HIGH' ? '#EF4444' : mlLabel === 'MEDIUM' ? '#F59E0B' : '#10B981';

  const confirmUpgrade = async () => {
    if (!confirmPlan || !user) return;
    setPaying(true);
    await new Promise(r => setTimeout(r, 2000));
    try {
      await supabase.from('users').update({ plan: confirmPlan.name.toLowerCase() }).eq('id', user.id);
      useUserStore.getState().setUser({ user: { ...user, plan: confirmPlan.name.toLowerCase() }, isAuthenticated: true });
      setPaying(false);
      setConfirmPlan(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✅ Plan Updated!', `You're now on the ${confirmPlan.name} plan. ₹${confirmPlan.price}/week.`);
    } catch {
      setPaying(false);
      Alert.alert('Error', 'Could not update plan. Try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: () => { logout(); clear(); router.replace('/login' as any); }
      },
    ]);
  };

  if (!user || !isAuthenticated) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.center}>
          <Shield size={60} color="#F97316" />
          <Text style={s.authTitle}>Sign in to view your profile</Text>
          <TouchableOpacity style={s.authBtn} onPress={() => router.replace('/login' as any)}>
            <Text style={s.authBtnTxt}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Header ── */}
        <View style={s.hero}>
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarTxt}>{getInitials(user.name)}</Text>
            </View>
          </View>
          <Text style={s.name}>{user.name}</Text>
          <Text style={s.sub}>{user.phone} · {user.city} · {user.zone}</Text>
          <Text style={s.sub}>{user.platform || 'Gig Worker'}</Text>

          {/* Coverage pill */}
          <View style={s.coverPill}>
            <View style={s.greenDot} />
            <Text style={s.coverTxt}>Coverage Active · ₹{currentPlan.coverage}/day</Text>
          </View>
        </View>

        {/* ── ML Stats Grid ── */}
        <View style={s.statsRow}>
          <View style={[s.bigStat, { borderColor: riskColor + '60' }]}>
            <Text style={[s.bigStatVal, { color: riskColor }]}>{mlScore ?? '—'}</Text>
            <Text style={[s.bigStatLabel, { color: riskColor }]}>{mlLabel} RISK</Text>
            <Text style={s.bigStatSub}>ML Score</Text>
          </View>
          <View style={s.smallStats}>
            <View style={s.smallStat}>
              <Text style={s.smallStatVal}>₹{mlPremium ?? currentPlan.price}</Text>
              <Text style={s.smallStatLabel}>Weekly Premium</Text>
            </View>
            <View style={[s.smallStat, { marginTop: 10 }]}>
              <Text style={s.smallStatVal}>{stats?.completedClaims ?? 0}</Text>
              <Text style={s.smallStatLabel}>Claims Paid</Text>
            </View>
          </View>
        </View>

        {/* ── Plan Card ── */}
        <TouchableOpacity style={s.planCard} onPress={() => setPlanModal(true)} activeOpacity={0.8}>
          <View>
            <Text style={s.planLabel}>Current Plan</Text>
            <Text style={s.planName}>{currentPlan.name} · ₹{currentPlan.price}/week</Text>
            <Text style={s.planCoverage}>₹{currentPlan.coverage}/day coverage</Text>
          </View>
          <View style={s.upgradeBtn}>
            <Text style={s.upgradeTxt}>Change</Text>
          </View>
        </TouchableOpacity>

        {/* ── Menu ── */}
        <View style={s.menuCard}>
          <Text style={s.menuTitle}>Account</Text>
          <MenuItem icon={Bell}       label="Notifications"  sub="Manage alert preferences"    onPress={() => router.push('/notifications' as any)} />
          <MenuItem icon={CreditCard}  label="Payment / UPI"  sub="Update payout destination"  onPress={() => router.push('/payment' as any)} />
          <MenuItem icon={FileCheck}   label="Policy Document" sub="View your coverage details"  onPress={() => router.push('/policy' as any)} />
          <MenuItem icon={TrendingUp}  label="Claim History"  sub="All past claims"             onPress={() => router.push('/(tabs)/claims' as any)} />
          <MenuItem icon={Settings}    label="Settings"       sub="App preferences & security"  onPress={() => router.push('/settings' as any)} />
        </View>

        {/* ── Demo Mode ── */}
        <View style={s.demoCard}>
          <View style={{ flex: 1 }}>
            <Text style={s.demoLabel}>Demo Mode</Text>
            <Text style={s.demoSub}>Simulate backend flows</Text>
          </View>
          <Switch
            value={isDemoMode}
            onValueChange={toggleDemoMode}
            trackColor={{ false: '#333', true: '#F97316' }}
            thumbColor="#FFF"
          />
        </View>

        {/* ── Engine tag ── */}
        <Text style={s.engineTag}>GigShield ML Engine v1.2 · Season: {getCurrentSeason()}</Text>

        {/* ── Logout ── */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color="#EF4444" />
          <Text style={s.logoutTxt}>Log Out Securely</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Plan Picker Modal ── */}
      <Modal visible={planModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHead}>
              <Text style={s.sheetTitle}>Choose Plan</Text>
              <TouchableOpacity onPress={() => setPlanModal(false)}>
                <X size={22} color="#A1A1AA" />
              </TouchableOpacity>
            </View>
            {PLANS.map(plan => (
              <TouchableOpacity
                key={plan.id}
                style={[s.planOption, currentPlan.id === plan.id && s.planOptionCurrent]}
                onPress={() => { setPlanModal(false); setConfirmPlan(plan); }}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.planOptionName, { color: plan.color }]}>
                    {plan.name} {plan.popular ? '⭐' : ''}
                  </Text>
                  <Text style={s.planOptionDesc}>{plan.desc}</Text>
                  <Text style={s.planOptionCov}>₹{plan.coverage}/day coverage</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[s.planOptionPrice, { color: plan.color }]}>₹{plan.price}</Text>
                  <Text style={s.planOptionPer}>/week</Text>
                </View>
                {currentPlan.id === plan.id && (
                  <View style={[s.currentBadge, { backgroundColor: plan.color }]}>
                    <Text style={s.currentBadgeTxt}>ACTIVE</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ── Payment Confirm Modal ── */}
      {confirmPlan && (
        <Modal visible transparent animationType="fade">
          <View style={[s.overlay, { justifyContent: 'center', paddingHorizontal: 24 }]}>
            <View style={s.payModal}>
              <Text style={s.payTitle}>Confirm Subscription</Text>
              <Text style={s.paySub}>Switching to</Text>
              <Text style={[s.payPlan, { color: confirmPlan.color }]}>{confirmPlan.name}</Text>

              <View style={s.payGrid}>
                <View style={s.payRow}><Text style={s.payK}>Weekly charge</Text><Text style={s.payV}>₹{confirmPlan.price}</Text></View>
                <View style={s.payRow}><Text style={s.payK}>Daily coverage</Text><Text style={s.payV}>₹{confirmPlan.coverage}</Text></View>
                <View style={s.payRow}><Text style={s.payK}>Payment via</Text><Text style={s.payV}>{user.phone}@ybl</Text></View>
              </View>

              {paying ? (
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <ActivityIndicator color="#F97316" size="large" />
                  <Text style={{ color: '#A1A1AA', marginTop: 12 }}>Processing payment…</Text>
                </View>
              ) : (
                <View style={s.payBtns}>
                  <TouchableOpacity style={s.payCancelBtn} onPress={() => setConfirmPlan(null)}>
                    <Text style={s.payCancelTxt}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.payConfirmBtn, { backgroundColor: confirmPlan.color }]} onPress={confirmUpgrade}>
                    <Text style={s.payConfirmTxt}>Pay ₹{confirmPlan.price}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// Reusable menu item component
function MenuItem({ icon: Icon, label, sub, onPress }: {
  icon: any; label: string; sub: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={s.menuIconBox}><Icon size={18} color="#FFF" /></View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={s.menuItemLabel}>{label}</Text>
        <Text style={s.menuItemSub}>{sub}</Text>
      </View>
      <ChevronRight size={16} color="#555" />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F13' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  authTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', marginTop: 20, marginBottom: 24 },
  authBtn: { backgroundColor: '#F97316', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  authBtnTxt: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  scroll: { flex: 1 },

  // Hero
  hero: { alignItems: 'center', paddingTop: 24, paddingBottom: 20, paddingHorizontal: 20 },
  avatarWrap: { marginBottom: 14 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#F97316',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  avatarTxt: { color: '#FFF', fontSize: 26, fontWeight: '900' },
  name: { color: '#FFF', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  sub: { color: '#A1A1AA', fontSize: 13, marginBottom: 2 },
  coverPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(16,185,129,0.12)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, marginTop: 12,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
  },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  coverTxt: { color: '#10B981', fontSize: 13, fontWeight: '700' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 14 },
  bigStat: {
    flex: 1.5, backgroundColor: '#1C1C1E', borderRadius: 18, padding: 18,
    borderWidth: 1, justifyContent: 'center',
  },
  bigStatVal: { fontSize: 38, fontWeight: '900', marginBottom: 4 },
  bigStatLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  bigStatSub: { color: '#666', fontSize: 11, marginTop: 4 },
  smallStats: { flex: 1, gap: 10 },
  smallStat: {
    backgroundColor: '#1C1C1E', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#2A2A2E', flex: 1, justifyContent: 'center',
  },
  smallStatVal: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  smallStatLabel: { color: '#A1A1AA', fontSize: 10 },

  // Plan card
  planCard: {
    marginHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#1C1C1E', borderRadius: 16,
    padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#2A2A2E',
  },
  planLabel: { color: '#A1A1AA', fontSize: 11, marginBottom: 4 },
  planName: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 2 },
  planCoverage: { color: '#A1A1AA', fontSize: 12 },
  upgradeBtn: { backgroundColor: '#F97316', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  upgradeTxt: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  // Menu
  menuCard: {
    marginHorizontal: 16, backgroundColor: '#1C1C1E', borderRadius: 18,
    padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#2A2A2E',
  },
  menuTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 14 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  menuIconBox: {
    width: 38, height: 38, borderRadius: 11, backgroundColor: '#2A2A2E',
    justifyContent: 'center', alignItems: 'center',
  },
  menuItemLabel: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  menuItemSub: { color: '#A1A1AA', fontSize: 12, marginTop: 1 },

  // Demo
  demoCard: {
    marginHorizontal: 16, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1C1C1E', borderRadius: 14, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: '#2A2A2E',
  },
  demoLabel: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  demoSub: { color: '#A1A1AA', fontSize: 12, marginTop: 2 },

  engineTag: { color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 20 },

  // Logout
  logoutBtn: {
    marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 14, paddingVertical: 16,
    gap: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
  logoutTxt: { color: '#EF4444', fontSize: 16, fontWeight: '700' },

  // Plan Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1C1C1E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  planOption: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A2A2E',
    borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#444',
  },
  planOptionCurrent: { borderColor: '#F97316' },
  planOptionName: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  planOptionDesc: { color: '#A1A1AA', fontSize: 12, marginBottom: 4 },
  planOptionCov: { color: '#CCC', fontSize: 12 },
  planOptionPrice: { fontSize: 22, fontWeight: '900' },
  planOptionPer: { color: '#666', fontSize: 12 },
  currentBadge: { position: 'absolute', top: 8, right: 8, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  currentBadgeTxt: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  // Pay Modal
  payModal: { backgroundColor: '#1C1C1E', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#2A2A2E' },
  payTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  paySub: { color: '#A1A1AA', fontSize: 14, textAlign: 'center', marginBottom: 4 },
  payPlan: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  payGrid: { backgroundColor: '#2A2A2E', borderRadius: 14, padding: 16, gap: 12 },
  payRow: { flexDirection: 'row', justifyContent: 'space-between' },
  payK: { color: '#A1A1AA', fontSize: 14 },
  payV: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  payBtns: { flexDirection: 'row', gap: 12, marginTop: 20 },
  payCancelBtn: { flex: 1, backgroundColor: '#2A2A2E', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  payCancelTxt: { color: '#A1A1AA', fontWeight: '700', fontSize: 15 },
  payConfirmBtn: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  payConfirmTxt: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
