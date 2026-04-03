import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Bell, 
  Shield, 
  CreditCard, 
  FileCheck, 
  Settings, 
  LogOut,
  TrendingUp,
  DollarSign,
  Clock
} from 'lucide-react-native';
import { useStats } from '@/store/useAppStore';
import { useUserStore } from '@/store/userStore';
import { formatCurrency, getInitials } from '@/utils';
import { Card, Title, Subtitle, Value, Button } from '@/components/DesignSystem';
import useAppStore from '@/store/useAppStore';

export default function ProfileScreen() {
  const { user, isAuthenticated, isDemoMode, toggleDemoMode } = useUserStore();
  const { loadUserStats, logout } = useAppStore();
  const stats = useStats();

  React.useEffect(() => {
    console.log('[DEBUG] Profile Screen Auth:', { isAuthenticated, userId: user?.id });
    if (isAuthenticated) {
      loadUserStats(); // Fetch real stats from SQL View
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login' as any);
          },
        },
      ]
    );
  };

  const handleMenuItem = (item: string) => {
    console.log(`Pressed ${item}`);
  };

  const menuItems = [
    { icon: Bell, title: 'Notifications', subtitle: 'Manage alerts' },
    { icon: Shield, title: 'Insurance Plan', subtitle: 'View or change plan' },
    { icon: CreditCard, title: 'Payment Method', subtitle: 'Update UPI details' },
    { icon: FileCheck, title: 'Documents', subtitle: 'View your policy' },
    { icon: Settings, title: 'Settings', subtitle: 'App preferences' },
  ];

  if (!user || !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Subtitle>Please sign in to view your profile</Subtitle>
          <Button
            onPress={() => router.replace('/login' as any)}
            variant="primary"
          >
            Go to Login
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Fintech Styled Profile Header Backdrop */}
        <View style={styles.headerBackdrop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(user.name)}
            </Text>
          </View>
          <View style={styles.profileInfoC}>
            <Text style={styles.profileNameT}>{user.name}</Text>
            <Text style={styles.profilePhoneT}>{user.phone} • {user.city}</Text>
          </View>
        </View>

        {/* Active Coverage Status Banner */}
        <View style={styles.coverageBanner}>
          <View style={styles.coverageLeft}>
            <View style={styles.coverageDot} />
            <Text style={styles.coverageTitle}>Coverage Active</Text>
          </View>
          <Text style={styles.coverageAmount}>₹50,000 Protected Today</Text>
        </View>

        {/* Global Stats Grid */}
        <View style={styles.glassGrid}>
          <View style={[styles.glassTileMain, { borderColor: '#F59E0B' }]}>
            <Title size="medium" style={styles.tileValueMain}>MEDIUM</Title>
            <Text style={styles.tileLabel}>Today's Risk Level</Text>
            <View style={styles.iconCircleWarning}><Shield size={16} color="#F59E0B" /></View>
          </View>
          
          <View style={styles.rightTiles}>
            <View style={styles.glassTileSmall}>
              <Text style={styles.tileValueSmall}>{formatCurrency(stats?.netBenefit || 0)}</Text>
              <Text style={styles.tileLabel}>Net Benefit</Text>
            </View>
            <View style={[styles.glassTileSmall, { marginTop: 12 }]}>
              <Text style={styles.tileValueSmall}>{(stats as any)?.totalClaims || stats?.completedClaims || 0}</Text>
              <Text style={styles.tileLabel}>Total Claims</Text>
            </View>
          </View>
        </View>

        {/* Netflix-style Subscription Tiers */}
        <View style={styles.subscriptionsSection}>
          <Text style={styles.sectionHeader}>Subscription Plan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.planScrollView}>
            {/* Basic Plan */}
            <TouchableOpacity style={styles.planCard}>
              <Text style={styles.planName}>Basic</Text>
              <Text style={styles.planPrice}>₹25<Text style={styles.planCycle}>/week</Text></Text>
              <Text style={styles.planCoverage}>Up to ₹500/day coverage</Text>
              <Text style={styles.planTarget}>For occasional workers</Text>
            </TouchableOpacity>

            {/* Standard Plan (Active) */}
            <TouchableOpacity style={[styles.planCard, styles.activePlanCard]}>
              <View style={styles.activeTag}><Text style={styles.activeTagText}>CURRENT</Text></View>
              <Text style={[styles.planName, styles.activePlanText]}>Standard</Text>
              <Text style={[styles.planPrice, styles.activePlanText]}>₹49<Text style={[styles.planCycle, styles.activePlanText]}>/week</Text></Text>
              <Text style={[styles.planCoverage, styles.activePlanText]}>Up to ₹700/day coverage</Text>
              <Text style={[styles.planTarget, styles.activePlanText]}>For regular full-timers</Text>
            </TouchableOpacity>

            {/* Pro Plan */}
            <TouchableOpacity style={styles.planCard}>
              <Text style={styles.planName}>Pro</Text>
              <Text style={styles.planPrice}>₹79<Text style={styles.planCycle}>/week</Text></Text>
              <Text style={styles.planCoverage}>Up to ₹1,000/day + priority</Text>
              <Text style={styles.planTarget}>For high-earning partners</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Account Details Panel */}
        <Card style={styles.menuCard}>
          <Title size="medium" style={styles.cardTitle}>Account Settings</Title>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuItem(item.title)}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconBox}><item.icon size={20} color="#1C1C1E" /></View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
               <View style={styles.menuIconBox}><Settings size={20} color="#F97316" /></View>
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Demo Mode</Text>
                <Text style={styles.menuItemSubtitle}>Simulate backend flows</Text>
              </View>
            </View>
            <Switch
              value={isDemoMode}
              onValueChange={toggleDemoMode}
              trackColor={{ false: '#E5E7EB', true: '#F97316' }}
            />
          </View>
        </Card>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out Securely</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13', // Deep fintech dark background
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100, // accommodate floating tabbar
  },
  headerBackdrop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 10,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  profileInfoC: {
    marginLeft: 16,
    flex: 1,
  },
  profileNameT: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '700',
  },
  profilePhoneT: {
    color: '#A1A1AA',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  glassGrid: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  glassTileMain: {
    flex: 1.5,
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 24,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderColor: '#333336',
    borderWidth: 1,
  },
  tileValueMain: {
    color: '#F59E0B',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  iconCircleWarning: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileLabel: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  rightTiles: {
    flex: 1,
    flexDirection: 'column',
  },
  glassTileSmall: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    flex: 1,
    borderColor: '#333336',
    borderWidth: 1,
  },
  tileValueSmall: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  menuCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#333336',
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuIconBox: {
    backgroundColor: '#333336',
    padding: 10,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 16,
  },
  menuItemTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  menuItemSubtitle: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 24,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  coverageBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  coverageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coverageDot: {
    width: 10,
    height: 10,
    backgroundColor: '#10B981',
    borderRadius: 5,
    marginRight: 8,
  },
  coverageTitle: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 16,
  },
  coverageAmount: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  subscriptionsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  planScrollView: {
    overflow: 'visible',
  },
  planCard: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#333336',
    borderRadius: 20,
    padding: 20,
    width: 240,
    marginRight: 16,
  },
  activePlanCard: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  activeTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeTagText: {
    color: '#F97316',
    fontSize: 10,
    fontWeight: '800',
  },
  planName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  planPrice: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
  },
  planCycle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  planCoverage: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  planTarget: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  activePlanText: {
    color: '#FFFFFF',
  },
});
