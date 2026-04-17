import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Share, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Check, Shield, AlertTriangle, FileText, Download, Share2 } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';

const PLANS: Record<string, { coverage: number; price: number; color: string }> = {
  basic:    { coverage: 500,  price: 25, color: '#6B7280' },
  standard: { coverage: 700,  price: 49, color: '#F97316' },
  pro:      { coverage: 1000, price: 79, color: '#0D9488' },
};

export default function PolicyScreen() {
  const { user } = useUserStore();
  const plan = PLANS[user?.plan?.toLowerCase() || 'standard'];
  const planName = (user?.plan || 'Standard').charAt(0).toUpperCase() + (user?.plan || 'Standard').slice(1);

  const startDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'N/A';

  const renewDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + (7 - d.getDay()));
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My GigShield ${planName} policy covers ₹${plan.coverage}/day for weather disruptions. Policy ID: GS-${user?.id?.slice(0, 8).toUpperCase() || 'N/A'}`,
        title: 'GigShield Policy',
      });
    } catch {}
  };

  const Divider = () => <View style={{ height: 1, backgroundColor: '#2A2A2E', marginVertical: 4 }} />;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.title}>Policy Document</Text>
        <TouchableOpacity onPress={handleShare} style={s.backBtn}>
          <Share2 size={18} color="#F97316" />
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Policy Card */}
        <View style={[s.policyCard, { borderColor: plan.color + '60' }]}>
          <View style={s.policyHeader}>
            <Shield size={28} color={plan.color} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={s.policyName}>{planName} Protection Plan</Text>
              <Text style={[s.policyBadge, { color: plan.color }]}>ACTIVE</Text>
            </View>
            <Text style={[s.premium, { color: plan.color }]}>₹{plan.price}<Text style={s.perWk}>/wk</Text></Text>
          </View>

          <View style={s.policyGrid}>
            <View style={s.policyCell}>
              <Text style={s.cellVal}>₹{plan.coverage}</Text>
              <Text style={s.cellLabel}>Daily Coverage</Text>
            </View>
            <View style={s.policyCell}>
              <Text style={s.cellVal}>{user?.zone || 'N/A'}</Text>
              <Text style={s.cellLabel}>Coverage Zone</Text>
            </View>
            <View style={s.policyCell}>
              <Text style={s.cellVal}>{user?.city || 'N/A'}</Text>
              <Text style={s.cellLabel}>City</Text>
            </View>
            <View style={s.policyCell}>
              <Text style={s.cellVal}>2 hrs</Text>
              <Text style={s.cellLabel}>Avg Payout Time</Text>
            </View>
          </View>
        </View>

        {/* Policy ID + Dates */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Policy Details</Text>
          <Row label="Policy ID" value={`GS-${user?.id?.slice(0, 8).toUpperCase() || 'N/A'}`} />
          <Divider />
          <Row label="Holder" value={user?.name || 'N/A'} />
          <Divider />
          <Row label="Phone" value={user?.phone || 'N/A'} />
          <Divider />
          <Row label="Start Date" value={startDate} />
          <Divider />
          <Row label="Renewal Date" value={renewDate} />
          <Divider />
          <Row label="Platform" value={user?.platform || 'General'} />
        </View>

        {/* Coverage Terms */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Coverage Terms</Text>
          {[
            { icon: Check, text: `Rainfall ≥ 40mm/hr triggers automatic payout`, ok: true },
            { icon: Check, text: `Extreme heat ≥ 43°C triggers automatic payout`, ok: true },
            { icon: Check, text: `Payout settled within 2 hours of trigger`, ok: true },
            { icon: Check, text: `No claim filing needed — fully parametric`, ok: true },
            { icon: Check, text: `Fraud detection AI checks every claim`, ok: true },
            { icon: AlertTriangle, text: `Does not cover accidents or vehicle damage`, ok: false },
            { icon: AlertTriangle, text: `Does not cover non-weather cancellations`, ok: false },
          ].map((item, i) => (
            <View key={i} style={s.termRow}>
              <item.icon size={16} color={item.ok ? '#10B981' : '#F59E0B'} />
              <Text style={[s.termText, { color: item.ok ? '#D4D4D8' : '#A1A1AA' }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* UPI payout info */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Payout Method</Text>
          <Row label="UPI ID" value={`${user?.phone}@ybl` || 'Not set'} />
          <Divider />
          <Row label="Bank" value="Auto-detected from UPI" />
          <Divider />
          <Row label="Settlement" value="Instant · T+0" />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowVal}>{value}</Text>
    </View>
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
  sectionTitle: { color: '#A1A1AA', fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: 12 },
  policyCard: {
    backgroundColor: '#1C1C1E', borderRadius: 20, padding: 20,
    marginTop: 20, marginBottom: 16, borderWidth: 1,
  },
  policyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  policyName: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  policyBadge: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 4 },
  premium: { fontSize: 22, fontWeight: '900' },
  perWk: { fontSize: 13, fontWeight: '400', color: '#A1A1AA' },
  policyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  policyCell: {
    flex: 1, minWidth: '45%', backgroundColor: '#2A2A2E',
    borderRadius: 12, padding: 12,
  },
  cellVal: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cellLabel: { color: '#A1A1AA', fontSize: 11 },
  card: {
    backgroundColor: '#1C1C1E', borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#2A2A2E',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  rowLabel: { color: '#A1A1AA', fontSize: 14 },
  rowVal: { color: '#FFF', fontSize: 14, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  termRow: { flexDirection: 'row', gap: 10, paddingVertical: 8, alignItems: 'flex-start' },
  termText: { fontSize: 13, flex: 1, lineHeight: 18 },
});
