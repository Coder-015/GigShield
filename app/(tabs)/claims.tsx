import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import useAppStore from '@/store/useAppStore';
import { useUserStore } from '@/store/userStore';
import { CloudRain, ShieldCheck, ChevronRight } from 'lucide-react-native';

export default function ClaimsScreen() {
  const { claims, loadUserClaims } = useAppStore();
  const { isAuthenticated } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);

  // Load real claims from Supabase on mount
  useEffect(() => {
    if (isAuthenticated) loadUserClaims();
  }, [isAuthenticated]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserClaims();
    setRefreshing(false);
  }, [loadUserClaims]);

  const getStatus = (status: string) => {
    switch (status) {
      case 'completed': return { label: 'Paid',       color: '#10B981' };
      case 'processing': return { label: 'Processing', color: '#F59E0B' };
      case 'rejected':  return { label: 'Rejected',   color: '#EF4444' };
      default:           return { label: 'Pending',    color: '#6B7280' };
    }
  };

  const formatClaimDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch { return '—'; }
  };

  const completed = claims.filter(c => c.status === 'completed');
  const processing = claims.filter(c => c.status === 'processing');
  const totalPayout = completed.reduce((s, c) => s + (c.amount || 0), 0);

  if (!claims || claims.length === 0) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.header}>
          <Text style={s.title}>Claims Ledger</Text>
          <Text style={s.sub}>Your insurance claim history</Text>
        </View>
        <View style={s.empty}>
          <ShieldCheck size={64} color="#333" />
          <Text style={s.emptyTitle}>No Claims Yet</Text>
          <Text style={s.emptySub}>
            Your claims will appear here when a weather event triggers your policy.
          </Text>
          <TouchableOpacity
            style={s.simulateBtn}
            onPress={() => router.push('/alert?zone=Dharavi&amount=350&rainfall=85' as any)}
          >
            <CloudRain size={18} color="#FFF" />
            <Text style={s.simulateBtnTxt}>Simulate a Rain Claim</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Claims Ledger</Text>
          <Text style={s.sub}>Pull down to refresh</Text>
        </View>

        {/* Summary tiles */}
        <View style={s.statsRow}>
          <View style={s.statTile}>
            <Text style={s.statVal}>{claims.length}</Text>
            <Text style={s.statLabel}>Total Claims</Text>
          </View>
          <View style={s.statTile}>
            <Text style={[s.statVal, { color: '#10B981' }]}>{completed.length}</Text>
            <Text style={s.statLabel}>Paid Out</Text>
          </View>
          <View style={s.statTile}>
            <Text style={[s.statVal, { color: '#F59E0B' }]}>{processing.length}</Text>
            <Text style={s.statLabel}>Processing</Text>
          </View>
          <View style={s.statTile}>
            <Text style={[s.statVal, { color: '#F97316' }]}>₹{totalPayout}</Text>
            <Text style={s.statLabel}>Total Paid</Text>
          </View>
        </View>

        {/* Ledger Table */}
        <View style={s.ledger}>
          {/* Table Header */}
          <View style={s.tableHead}>
            <Text style={[s.headTxt, { flex: 1.2 }]}>DATE / ID</Text>
            <Text style={[s.headTxt, { flex: 1.5 }]}>ZONE</Text>
            <Text style={[s.headTxt, { flex: 1, textAlign: 'right' }]}>AMOUNT</Text>
            <Text style={[s.headTxt, { flex: 1.2, textAlign: 'right' }]}>STATUS</Text>
          </View>

          {/* Rows */}
          {claims.map((claim: any) => {
            const st = getStatus(claim.status);
            const dateStr = claim.triggered_at || claim.date || claim.createdAt || new Date().toISOString();
            const claimNum = claim.claim_number || claim.id?.slice(0, 8) || 'GS-N/A';
            const zone = claim.zone || '—';
            const amount = claim.amount || 0;

            return (
              <Pressable
                key={claim.id}
                style={({ pressed }) => [
                  s.tableRow,
                  pressed && { backgroundColor: '#2A2A2E' }
                ]}
                onPress={() => router.push(`/claim-tracking?id=${claim.id}` as any)}
              >
                <View style={{ flex: 1.2 }}>
                  <Text style={s.rowMain}>{formatClaimDate(dateStr)}</Text>
                  <Text style={s.rowSub}>{claimNum}</Text>
                </View>
                <View style={{ flex: 1.5 }}>
                  <Text style={s.rowMain}>{zone}</Text>
                  <Text style={s.rowSub}>{claim.disruption_type || claim.type || 'Rain'}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={[s.rowAmt, { color: st.color }]}>₹{amount}</Text>
                </View>
                <View style={{ flex: 1.2, alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 4 }}>
                  <View style={[s.badge, { backgroundColor: st.color + '22' }]}>
                    <Text style={[s.badgeTxt, { color: st.color }]}>{st.label}</Text>
                  </View>
                  <ChevronRight size={14} color="#555" />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Simulate button */}
        <TouchableOpacity
          style={s.simulateBtn}
          onPress={() => router.push('/alert?zone=Dharavi&amount=350&rainfall=85' as any)}
        >
          <CloudRain size={18} color="#FFF" />
          <Text style={s.simulateBtnTxt}>Simulate Rain Claim</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F13' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 16, paddingBottom: 20 },
  title: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  sub: { color: '#A1A1AA', fontSize: 13, marginTop: 4 },

  // Empty state
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 60 },
  emptyTitle: { color: '#FFF', fontSize: 22, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  emptySub: { color: '#A1A1AA', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statTile: { flex: 1, backgroundColor: '#1C1C1E', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333336' },
  statVal: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: '#A1A1AA', fontSize: 10, textAlign: 'center' },

  // Ledger
  ledger: { backgroundColor: '#1C1C1E', borderRadius: 16, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#333336' },
  tableHead: { flexDirection: 'row', backgroundColor: '#2C2C2E', paddingHorizontal: 16, paddingVertical: 12 },
  headTxt: { color: '#A1A1AA', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
  },
  rowMain: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  rowSub: { color: '#A1A1AA', fontSize: 11, marginTop: 2 },
  rowAmt: { fontSize: 14, fontWeight: '800' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeTxt: { fontSize: 11, fontWeight: '700' },

  // Simulate button
  simulateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F97316', borderRadius: 14, paddingVertical: 16, gap: 10, shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  simulateBtnTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
