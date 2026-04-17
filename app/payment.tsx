import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, CreditCard, Check, Shield, Smartphone } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';

const UPI_COLORS: Record<string, string> = {
  '@ybl': '#6B21A8', '@okaxis': '#1E40AF', '@okhdfcbank': '#15803D',
  '@oksbi': '#B91C1C', '@paytm': '#1E40AF', '@gpay': '#166534',
};

function getUpiColor(upi: string): string {
  const suffix = Object.keys(UPI_COLORS).find(s => upi.includes(s));
  return suffix ? UPI_COLORS[suffix] : '#F97316';
}

export default function PaymentScreen() {
  const { user, setUser } = useUserStore();
  const currentUpi = `${user?.phone || ''}@ybl`;

  const [upiId, setUpiId] = useState((user as any)?.upi_id || currentUpi);
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);

  const validateUpi = (val: string) => {
    return /^[\w.-]+@[\w]+$/.test(val);
  };

  const handleVerify = async () => {
    if (!validateUpi(upiId)) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID like yourname@ybl or phone@paytm');
      return;
    }
    setSubmitting(true);
    // Simulate UPI verification delay (like NPCI ping)
    await new Promise(r => setTimeout(r, 1800));
    setVerified(true);
    setSubmitting(false);
  };

  const handleSave = async () => {
    if (!verified) { handleVerify(); return; }
    setSubmitting(true);
    try {
      if (user) {
        await supabase.from('users').update({ upi_id: upiId }).eq('id', user.id);
        setUser({ user: { ...user, upi_id: upiId } as any, isAuthenticated: true });
      }
      Alert.alert('✅ Payment Updated', `All claims will now be paid to ${upiId}`, [
        { text: 'Done', onPress: () => router.back() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to update UPI. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const QUICK_UPI = [
    { label: 'Google Pay', suffix: '@okicici' },
    { label: 'PhonePe', suffix: '@ybl' },
    { label: 'Paytm', suffix: '@paytm' },
    { label: 'BHIM', suffix: '@upi' },
  ];

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.title}>Payment / UPI</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Info banner */}
          <View style={s.infoBanner}>
            <Shield size={18} color="#10B981" />
            <Text style={s.infoTxt}>
              Claim payouts are sent instantly to your UPI wallet. No bank account needed.
            </Text>
          </View>

          {/* Current UPI card */}
          <View style={s.card}>
            <Text style={s.cardLabel}>Current Payout UPI</Text>
            <View style={s.upiDisplay}>
              <View style={[s.upiIcon, { backgroundColor: getUpiColor(upiId) }]}>
                <Smartphone size={20} color="#FFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.upiValue}>{upiId}</Text>
                <Text style={s.upiSub}>Linked to your account</Text>
              </View>
              {verified && <Check size={20} color="#10B981" />}
            </View>
          </View>

          {/* Update UPI */}
          <View style={s.card}>
            <Text style={s.cardLabel}>Update UPI ID</Text>
            <TextInput
              style={s.input}
              value={upiId}
              onChangeText={(t) => { setUpiId(t); setVerified(false); }}
              placeholder="yourname@ybl or 9876543210@paytm"
              placeholderTextColor="#555"
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* Quick UPI options */}
            <Text style={[s.cardLabel, { marginTop: 12, marginBottom: 8 }]}>Quick Select</Text>
            <View style={s.quickRow}>
              {QUICK_UPI.map(opt => (
                <TouchableOpacity
                  key={opt.label}
                  style={[s.quickBtn, upiId.endsWith(opt.suffix) && s.quickBtnActive]}
                  onPress={() => { setUpiId((user?.phone || '') + opt.suffix); setVerified(false); }}
                >
                  <Text style={[s.quickBtnTxt, upiId.endsWith(opt.suffix) && { color: '#F97316' }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* How payouts work */}
          <View style={s.card}>
            <Text style={s.cardLabel}>How Payouts Work</Text>
            {[
              '1. Rain/heat triggers detected by our sensors',
              '2. Fraud check completes in < 5 seconds',
              '3. Payout initiated automatically via NPCI',
              '4. Money in your UPI wallet within 2 hours',
            ].map((step, i) => (
              <Text key={i} style={s.stepTxt}>{step}</Text>
            ))}
          </View>

          {submitting ? (
            <View style={s.loadingBtn}>
              <ActivityIndicator color="#FFF" />
              <Text style={s.saveBtnTxt}>
                {verified ? 'Saving…' : 'Verifying UPI…'}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[s.saveBtn, verified && { backgroundColor: '#10B981' }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              {verified && <Check size={18} color="#FFF" />}
              <Text style={s.saveBtnTxt}>
                {verified ? 'Save UPI ID' : 'Verify & Save'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F13' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#1C1C1E',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center',
  },
  title: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 12, padding: 14,
    marginTop: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
  },
  infoTxt: { color: '#D4D4D8', fontSize: 13, flex: 1, lineHeight: 18 },
  card: {
    backgroundColor: '#1C1C1E', borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#2A2A2E',
  },
  cardLabel: { color: '#A1A1AA', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 12 },
  upiDisplay: { flexDirection: 'row', alignItems: 'center' },
  upiIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  upiValue: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  upiSub: { color: '#A1A1AA', fontSize: 12, marginTop: 2 },
  input: {
    backgroundColor: '#2A2A2E', borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 15, color: '#FFF',
    borderWidth: 1, borderColor: '#444',
  },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickBtn: {
    backgroundColor: '#2A2A2E', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#444',
  },
  quickBtnActive: { borderColor: '#F97316' },
  quickBtnTxt: { color: '#A1A1AA', fontSize: 12, fontWeight: '600' },
  stepTxt: { color: '#A1A1AA', fontSize: 13, lineHeight: 22 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F97316', borderRadius: 16, paddingVertical: 16,
    gap: 8, marginTop: 8,
    shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  loadingBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#333', borderRadius: 16, paddingVertical: 16, gap: 10, marginTop: 8,
  },
  saveBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
