import { Button, Card, Subtitle, Title, Value } from '@/components/DesignSystem';
import useAppStore from '@/store/useAppStore';
import { router } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { AlertTriangle, Shield, TrendingUp, X } from 'lucide-react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop, Text as SvgText, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ZoneDetails {
  id: string;
  name: string;
  risk: 'high' | 'medium' | 'safe';
  workers: number;
  x: number;
  y: number;
  radius: number;
}

const CITY_ZONES: Record<string, ZoneDetails[]> = {
  Mumbai: [
    { id: 'dharavi', name: 'Dharavi', x: 200, y: 300, radius: 60, risk: 'high', workers: 234 },
    { id: 'kurla', name: 'Kurla', x: 340, y: 280, radius: 70, risk: 'medium', workers: 189 },
    { id: 'andheri', name: 'Andheri', x: 150, y: 150, radius: 90, risk: 'medium', workers: 312 },
    { id: 'bandra', name: 'Bandra', x: 120, y: 240, radius: 50, risk: 'safe', workers: 156 },
    { id: 'worli', name: 'Worli', x: 120, y: 400, radius: 55, risk: 'safe', workers: 98 },
    { id: 'colaba', name: 'Colaba', x: 150, y: 550, radius: 45, risk: 'safe', workers: 67 },
    { id: 'powai', name: 'Powai', x: 420, y: 160, radius: 65, risk: 'high', workers: 145 },
    { id: 'thane', name: 'Thane', x: 500, y: 80, radius: 100, risk: 'medium', workers: 203 },
  ],
  Bengaluru: [
    { id: 'koramangala', name: 'Koramang.', x: 250, y: 300, radius: 70, risk: 'safe', workers: 412 },
    { id: 'indiranagar', name: 'Indiranagar', x: 350, y: 200, radius: 60, risk: 'medium', workers: 320 },
    { id: 'hsr', name: 'HSR Layout', x: 270, y: 450, radius: 80, risk: 'high', workers: 512 },
    { id: 'whitefield', name: 'Whitefield', x: 500, y: 150, radius: 110, risk: 'medium', workers: 450 },
    { id: 'electronic_city', name: 'E-City', x: 320, y: 600, radius: 85, risk: 'safe', workers: 388 },
  ],
  Delhi: [
    { id: 'cp', name: 'Connaught P', x: 300, y: 250, radius: 50, risk: 'safe', workers: 150 },
    { id: 'dwarka', name: 'Dwarka', x: 120, y: 350, radius: 95, risk: 'medium', workers: 280 },
    { id: 'lajpat', name: 'Lajpat Nagar', x: 380, y: 400, radius: 60, risk: 'high', workers: 341 },
    { id: 'rohini', name: 'Rohini', x: 200, y: 100, radius: 85, risk: 'safe', workers: 210 },
  ]
};

const RISK_COLORS = {
  high: { core: '#EF4444', outer: 'rgba(239, 68, 68, 0.4)' },
  medium: { core: '#F59E0B', outer: 'rgba(245, 158, 11, 0.4)' },
  safe: { core: '#10B981', outer: 'rgba(16, 185, 129, 0.4)' },
};



export default function MapScreen() {
  const { stats, createClaim, isClaimProcessing, loadUserClaims } = useAppStore();
  const { user, isAuthenticated, isDemoMode } = useUserStore();
  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  useEffect(() => {
    console.log('[DEBUG] Map Screen Auth:', { isAuthenticated, userId: user?.id });
  }, [isAuthenticated, user]);
  const [bottomSheetAnim] = useState(new Animated.Value(screenHeight));
  const [pulsingZones, setPulsingZones] = useState<Set<string>>(new Set());

  const currentCityZones = CITY_ZONES[user?.city || 'Mumbai'] || CITY_ZONES['Mumbai'];
  const scrollViewRef = useRef<ScrollView>(null);

  // Center map on startup
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, y: 60, animated: true });
      }, 500);
    }
  }, [user?.city]);

  // Create pulse animation driver
  const [pulseScale] = useState(new Animated.Value(1));
  const [pulseOpac] = useState(new Animated.Value(0.4));
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.15, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpac, { toValue: 0.1, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseOpac, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
        ])
      ])
    ).start();
  }, []);

  // Check if user's zone is high risk
  const userZone = currentCityZones.find(zone => zone.id === user?.zone || zone.name === user?.zone);
  const isUserZoneHighRisk = userZone?.risk === 'high';

  const handleZonePress = (zone: any) => {
    setSelectedZone(zone);
    Haptics.selectionAsync();
    setShowBottomSheet(true);
    requestAnimationFrame(() => {
      Animated.timing(bottomSheetAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false, // Must be false for translateY on some android builds
      }).start();
    });
  };

  const closeBottomSheet = () => {
    Animated.timing(bottomSheetAnim, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setShowBottomSheet(false));
  };

  const handleSimulateRain = async (zoneOverride?: any) => {
    const targetZone = zoneOverride || selectedZone;
    if (!targetZone) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const amount = targetZone.risk === 'high' ? 450 : targetZone.risk === 'medium' ? 250 : 100;
    const rainfall = targetZone.risk === 'high' ? 120 : targetZone.risk === 'medium' ? 65 : 15;

    closeBottomSheet();
    setTimeout(() => {
      router.push(`/alert?zone=${targetZone.name}&amount=${amount}&rainfall=${rainfall}` as any);
    }, 350); // let bottom sheet close smoothly before navigation
  };

  const handleZoneHistory = () => {
    if (selectedZone) {
      console.log('Navigate to zone details for', selectedZone.name);
    }
  };

  const handleWeatherReport = () => {
    console.log('Navigate to weather report');
  };

  if (!user || !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Subtitle>Please sign in to view the map</Subtitle>
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
      {/* Warning banner for user's zone if high risk */}
      {isUserZoneHighRisk && (
        <View style={styles.warningBanner}>
          <AlertTriangle size={16} color="#F59E0B" />
          <Text style={styles.warningText}>
            Heavy rain predicted in {userZone?.name} at 2pm — You are covered
          </Text>
        </View>
      )}

      {/* Map Interactive Canvas */}
      <View style={styles.mapWrapFixed}>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          bounces={false} 
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={styles.realMap}
        >
          <ScrollView bounces={false}>
            {/* Massive Dark Map Base Layer - Procedural Abstract Map */}
            <View style={{ width: 800, height: 800, backgroundColor: '#09090B', position: 'relative' }}>
              <Svg width="800" height="800" style={StyleSheet.absoluteFill}>
                <Defs>
                  <RadialGradient id="highRisk" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                    <Stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
                    <Stop offset="70%" stopColor="#EF4444" stopOpacity="0.1" />
                    <Stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                  </RadialGradient>
                  <RadialGradient id="mediumRisk" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                    <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                    <Stop offset="70%" stopColor="#F59E0B" stopOpacity="0.1" />
                    <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                  </RadialGradient>
                  <RadialGradient id="safeRisk" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                    <Stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                    <Stop offset="70%" stopColor="#10B981" stopOpacity="0.1" />
                    <Stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </RadialGradient>
                </Defs>

                {/* Abstract road lines to simulate map feel */}
                <Rect x="0" y="0" width="800" height="800" fill="#1C1C1E" />
                {[...Array(20)].map((_, i) => (
                  <Rect key={`h${i}`} x="0" y={i * 60} width="800" height="1" fill="#2A2A2D" />
                ))}
                {[...Array(20)].map((_, i) => (
                  <Rect key={`v${i}`} x={i * 60} y="0" width="1" height="800" fill="#2A2A2D" />
                ))}

                {currentCityZones.map((zone) => {
                  const gradientId = zone.risk === 'high' ? 'url(#highRisk)' : zone.risk === 'medium' ? 'url(#mediumRisk)' : 'url(#safeRisk)';
                  const colors = RISK_COLORS[zone.risk];
                  const isUserLocation = zone.id === user?.zone;

                  return (
                    <G key={`svg-${zone.id}`}>
                      {/* Gradient Ambient Glow Base */}
                      <Circle cx={zone.x} cy={zone.y} r={zone.radius * 1.5} fill={gradientId} />
                      
                      {/* Interactive Solid Core Ring */}
                      <Circle 
                        cx={zone.x} cy={zone.y} 
                        r={zone.radius * 0.4} 
                        fill={colors.outer}
                        stroke={colors.core}
                        strokeWidth={2}
                      />
                      
                      {/* Zone Label Text inside Circle */}
                      <SvgText
                        x={zone.x}
                        y={zone.y + 5}
                        fill="#FFFFFF"
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {zone.name}
                      </SvgText>

                      {isUserLocation && (
                        <Circle
                          cx={zone.x + zone.radius * 0.3}
                          cy={zone.y - zone.radius * 0.3}
                          r={6}
                          fill="#F97316"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                      )}
                    </G>
                  );
                })}
              </Svg>

              {/* RN Animated Overlay for exactly pulsing high risk zones */}
              {currentCityZones.map((zone) => {
                const isHighRisk = zone.risk === 'high';
                if (!isHighRisk) return null;
                return (
                  <Animated.View 
                    key={`pulse-${zone.id}`}
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left: zone.x - zone.radius * 0.4,
                      top: zone.y - zone.radius * 0.4,
                      width: zone.radius * 0.8,
                      height: zone.radius * 0.8,
                      borderRadius: zone.radius * 0.4,
                      backgroundColor: 'rgba(239, 68, 68, 0.4)',
                      opacity: pulseOpac,
                      transform: [{ scale: pulseScale }]
                    }} 
                  />
                )
              })}

              {/* Native Absolute Tap Targets to prevent SVG thread lock */}
              {currentCityZones.map((zone) => (
                <TouchableOpacity
                  key={`tap-${zone.id}`}
                  style={{
                    position: 'absolute',
                    left: zone.x - zone.radius * 0.8,
                    top: zone.y - zone.radius * 0.8,
                    width: zone.radius * 1.6,
                    height: zone.radius * 1.6,
                    borderRadius: zone.radius * 0.8,
                    zIndex: 10, // Must be above everything
                  }}
                  onPress={() => handleZonePress(zone)}
                  activeOpacity={0.5}
                />
              ))}
            </View>
          </ScrollView>
        </ScrollView>
        <View style={styles.mapGradientBottom} />
      </View>

      {/* Stats Overlay */}
      <View style={styles.statsOverlay}>
        <Card style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Shield size={20} color="#F97316" />
            <Title size="small">Your Protection</Title>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' }}>{stats?.totalProtected || 0}</Text>
              <Text style={{ fontSize: 14, color: '#A1A1AA' }}>Total Protected</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' }}>{stats?.weeklyPremium || 0}</Text>
              <Text style={{ fontSize: 14, color: '#A1A1AA' }}>Weekly Premium</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Legend Map Bottom Floating */}
      <View style={styles.legend}>
        <View style={styles.legendWrapper}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>High</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Safe</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Card style={styles.actionCard}>
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.simulateButton, (!selectedZone || isClaimProcessing) && { opacity: 0.5 }]}
              onPress={() => handleSimulateRain()}
              disabled={!selectedZone || isClaimProcessing}
            >
              {isClaimProcessing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <AlertTriangle size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Simulate Rain</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.historyButton]}
              onPress={handleZoneHistory}
              disabled={!selectedZone}
            >
              <TrendingUp size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Zone History</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      {/* Bottom Sheet */}
      {showBottomSheet && selectedZone && (
        <View style={styles.bottomSheetOverlay}>
          <Animated.View 
            style={[
              styles.bottomSheet,
              {
                transform: [{ translateY: bottomSheetAnim }]
              }
            ]}
          >
            <View style={styles.bottomSheetHeader}>
              <View style={styles.bottomSheetHandle} />
              <TouchableOpacity onPress={closeBottomSheet} style={styles.closeButton}>
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.bottomSheetContent}>
              <View style={styles.zoneHeader}>
                <Title size="medium">{selectedZone.name}</Title>
                <View style={[
                  styles.riskBadge,
                  selectedZone.risk === 'high' && styles.highRiskBadge,
                  selectedZone.risk === 'medium' && styles.mediumRiskBadge,
                  selectedZone.risk === 'safe' && styles.lowRiskBadge,
                ]}>
                  <Text style={[
                    styles.riskText,
                    selectedZone.risk === 'high' && styles.highRiskText,
                    selectedZone.risk === 'medium' && styles.mediumRiskText,
                    selectedZone.risk === 'safe' && styles.lowRiskText,
                  ]}>{selectedZone.risk.toUpperCase()}</Text>
                </View>
              </View>
              
              <Text style={styles.workersText}>
                {selectedZone.workers} workers covered in this zone
              </Text>
              
              <Text style={styles.conditionsText}>
                Current conditions: {selectedZone.risk === 'high' ? 'Heavy rain expected' : 
                                  selectedZone.risk === 'medium' ? 'Moderate rain possible' : 
                                  'Clear weather expected'}
              </Text>
              
              {selectedZone.id === user?.zone && (
                <View style={styles.yourZoneBadge}>
                  <Text style={styles.yourZoneText}>Your zone</Text>
                </View>
              )}
              
              <Button
                onPress={handleSimulateRain}
                size="large"
                style={styles.simulateRainButton}
              >
                Simulate Rain in {selectedZone.name}
              </Button>
            </View>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13', // Enforce dark
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#0F0F13',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.3)',
  },
  checkmarkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B',
  },
  warningText: {
    fontSize: 14,
    color: '#FCD34D',
    fontWeight: '600',
  },
  mapWrapFixed: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  realMap: {
    ...StyleSheet.absoluteFillObject,
  },
  heatBadge: {
    backgroundColor: 'rgba(28,28,30,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heatText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F97316',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  mapGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(15, 15, 19, 0.4)',
  },
  statsOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  statsCard: {
    padding: 16,
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    borderWidth: 1,
    borderColor: '#333336',
    borderRadius: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  legend: {
    position: 'absolute',
    bottom: 120, // Above floating tabbar
    alignSelf: 'center',
    zIndex: 2,
  },
  legendWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#333336',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '600',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  actionCard: {
    padding: 16,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderWidth: 1,
    borderColor: '#333336',
    borderRadius: 16,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  simulateButton: {
    backgroundColor: '#F97316',
  },
  historyButton: {
    backgroundColor: '#3B82F6',
  },
  weatherButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  bottomSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 110, // Raised extremely high so CTAs are fully clear of the tab-bar constraint
    borderTopWidth: 1,
    borderColor: '#333336',
  },
  bottomSheetHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 16,
  },
  bottomSheetContent: {
    paddingHorizontal: 24,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  highRiskBadge: {
    backgroundColor: '#FEE2E2',
  },
  mediumRiskBadge: {
    backgroundColor: '#FEF3C7',
  },
  lowRiskBadge: {
    backgroundColor: '#D1FAE5',
  },
  riskText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'System',
  },
  highRiskText: {
    color: '#EF4444',
  },
  mediumRiskText: {
    color: '#F59E0B',
  },
  lowRiskText: {
    color: '#10B981',
  },
  workersText: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 8,
    fontFamily: 'System',
  },
  conditionsText: {
    fontSize: 14,
    color: '#A1A1AA',
    marginBottom: 16,
    fontFamily: 'System',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#A1A1AA',
    marginBottom: 16,
    fontFamily: 'System',
  },
  yourZoneBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F97316',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  yourZoneText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  simulateRainButton: {
    marginBottom: 20,
  },
});
