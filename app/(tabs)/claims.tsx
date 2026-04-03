import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Animated, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import useAppStore from '@/store/useAppStore';
import { formatCurrency, formatDate, getTimeAgo } from '@/utils';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CloudRain, TrendingUp, ShieldCheck } from 'lucide-react-native';

export default function ClaimsScreen() {
  const { claims, loadUserClaims, createClaim, isClaimProcessing } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserClaims();
    setRefreshing(false);
  }, [loadUserClaims]);

  const allClaims = claims;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'processing':
        return '#F59E0B';
      case 'pending':
        return '#6B7280';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const handleClaimPress = (claimId: string) => {
    router.push(`/claim-tracking?id=${claimId}`);
  };

  const renderClaimCard = (claim: any) => (
    <Pressable
      key={claim.id}
      style={({ pressed }) => [
        styles.claimCard,
        { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
      ]}
      onPress={() => handleClaimPress(claim.id)}
    >
      <View style={styles.claimHeader}>
        <View style={styles.claimInfo}>
          <Text style={styles.claimType}>{claim.type}</Text>
          <Text style={styles.claimDate}>{formatDate(claim.date)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(claim.status) }]}>
          <Text style={styles.statusText}>{getStatusText(claim.status)}</Text>
        </View>
      </View>
      
      <View style={styles.claimDetails}>
        <Text style={styles.claimDescription}>{claim.description}</Text>
        <View style={styles.claimMeta}>
          <Text style={styles.claimZone}>Zone: {claim.zone}</Text>
          <Text style={styles.claimAmount}>{formatCurrency(claim.amount)}</Text>
        </View>
      </View>
      
      <View style={styles.claimFooter}>
        <Text style={styles.claimTime}>{getTimeAgo(claim.createdAt)}</Text>
        <Text style={styles.trackText}>Track Claim →</Text>
      </View>
    </Pressable>
  );

  const handleSimulateRain = () => {
    router.push(`/alert?zone=Simulated Zone&amount=350&rainfall=85`);
  };

  const renderSummaryCard = () => {
    const completedClaims = allClaims.filter(c => c.status === 'completed');
    const processingClaims = allClaims.filter(c => c.status === 'processing');
    const totalPayout = completedClaims.reduce((sum, claim) => sum + claim.amount, 0);

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Claims Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{allClaims.length}</Text>
            <Text style={styles.summaryLabel}>Total Claims</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{completedClaims.length}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{processingClaims.length}</Text>
            <Text style={styles.summaryLabel}>Processing</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatCurrency(totalPayout)}</Text>
            <Text style={styles.summaryLabel}>Total Payout</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!allClaims || allClaims.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <ShieldCheck size={80} color="#10B981" style={{ marginBottom: 24 }} />
          <Text style={styles.emptyTitle}>Safe Today ✅</Text>
          <Text style={styles.emptySubtitle}>
            No claims yet. You're fully protected if extreme weather disrupts your gig shift.
          </Text>
          
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable 
              style={styles.simulateCTA} 
              onPress={handleSimulateRain}
              disabled={isClaimProcessing}
              onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
            >
              {isClaimProcessing ? (
                <LoadingSpinner />
              ) : (
                <>
                  <CloudRain size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.ctaText}>Simulate Rain Event</Text>
                </>
              )}
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />
        }
      >
        <Text style={styles.screenTitle}>Claims History</Text>
        
        {renderSummaryCard()}
        
        <Text style={styles.sectionTitle}>Recent Claims</Text>
        
        {allClaims.map(renderClaimCard)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333336',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  claimCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333336',
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  claimInfo: {
    flex: 1,
  },
  claimType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  claimDate: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  claimDetails: {
    marginBottom: 12,
  },
  claimDescription: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 8,
  },
  claimMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  claimZone: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  claimAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  claimFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333336',
  },
  claimTime: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  trackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  simulateCTA: {
    flexDirection: 'row',
    backgroundColor: '#F97316',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
