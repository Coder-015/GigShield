import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { X, CloudRain, CheckCircle } from 'lucide-react-native';
import useAppStore from '@/store/useAppStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AlertScreen() {
  const params = useLocalSearchParams();
  const zone = params.zone as string || 'Dharavi';
  const amount = parseInt(params.amount as string) || 292;
  const rainfall = parseInt(params.rainfall as string) || 52;

  const [slideAnim] = useState(new Animated.Value(screenHeight));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [rainDrops] = useState(() => 
    [...Array(6)].map((_, i) => ({
      id: i,
      x: Math.random() * screenWidth,
      delay: i * 200,
      duration: 2000 + Math.random() * 1000,
    }))
  );

  const { createClaim } = useAppStore();

  useEffect(() => {
    console.log('Alert screen params:', { zone, amount, rainfall });

    // Fade in background
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Slide up card from bottom
    Animated.timing(slideAnim, {
      toValue: screenHeight * 0.3,
      duration: 500,
      useNativeDriver: false,
    }).start();

    const runProcess = async () => {
      // Pulse animation for cloud icon and Processing text
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();

      // Wait 1.5s for initial processing visual
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Attempt creation synchronously so we await database logic
      const result = await createClaim({
        type: 'Rain Disruption',
        date: new Date().toISOString().split('T')[0],
        zone: zone,
        amount: amount,
        description: `${rainfall}mm/hr rainfall detected in ${zone}`,
      });

      // Show checkmark to indicate it finished
      setShowCheckmark(true);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Auto navigate to claim tracking with the correctly minted DB claim
      const latestClaim = useAppStore.getState().claims[0];
      router.replace(`/claim-tracking?id=${latestClaim?.id || 'demo'}&amount=${amount}` as any);
      
      pulse.stop();
    };

    runProcess();
  }, [zone, amount, rainfall]);

  const handleTrackClaim = () => {
    router.push(`/claim-tracking?claimId=GS-20240320-004&amount=${amount}`);
  };

  // Animated rain drops
  const renderRainDrop = (drop: { id: number; x: number; delay: number; duration: number }) => {
    const translateYAnim = new Animated.Value(-20);
    
    useEffect(() => {
      const animateDrop = () => {
        translateYAnim.setValue(-20);
        Animated.timing(translateYAnim, {
          toValue: screenHeight,
          duration: drop.duration,
          delay: drop.delay,
          useNativeDriver: true,
        }).start(() => {
          // Loop the animation
          setTimeout(animateDrop, 100);
        });
      };
      
      animateDrop();
    }, []);

    return (
      <Animated.View
        key={drop.id}
        style={[
          styles.rainDrop,
          {
            left: drop.x,
            transform: [{ translateY: translateYAnim }],
          }
        ]}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dark Background Overlay */}
      <Animated.View style={[styles.background, { opacity: fadeAnim }]}>
        {/* Animated Rain Drops */}
        {rainDrops.map(renderRainDrop)}
      </Animated.View>

      {/* Alert Card - Slides up from bottom */}
      <Animated.View 
        style={[
          styles.alertCard,
          {
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Animated Cloud Icon */}
        <View style={styles.iconContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <CloudRain size={80} color="#3B82F6" />
          </Animated.View>
        </View>

        {/* Header Exit */}
        <SafeAreaView style={styles.headerAbsolute}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)' as any)} style={styles.exitButton}>
            <X color="#A1A1AA" size={24} />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Alert Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Heavy Rain Detected</Text>
          <View style={styles.eventContext}>
            <Text style={styles.contextText}>Location: <Text style={styles.contextValue}>{zone}</Text></Text>
            <Text style={styles.contextText}>Intensity: <Text style={styles.contextValue}>High ({rainfall}mm/hr)</Text></Text>
            <Text style={styles.contextText}>Estimated Loss: <Text style={styles.contextValue}>₹{amount}</Text></Text>
          </View>
          
          <View style={{ height: 60, justifyContent: 'center' }}>
            {showCheckmark ? (
              <Animated.View
                style={[
                  styles.checkmarkContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1],
                        }),
                      },
                    ],
                  }
                ]}
              >
                <CheckCircle size={24} color="#10B981" />
                <Text style={styles.checkmarkText}>Claim auto-initiated</Text>
              </Animated.View>
            ) : (
              <Animated.View style={[styles.processingContainer, { opacity: pulseAnim }]}>
                <View style={[styles.processingDot, { backgroundColor: '#F97316' }]} />
                <Text style={styles.processingText}>Processing Claim...</Text>
              </Animated.View>
            )}
          </View>
        </View>

        {/* Track Claim Button */}
        <TouchableOpacity style={styles.trackButton} onPress={handleTrackClaim}>
          <Text style={styles.trackButtonText}>Track Claim Now</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  rainDrop: {
    position: 'absolute',
    width: 4,
    height: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.6)',
    borderRadius: 2,
    top: -20,
  },
  alertCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  content: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
  },
  headerAbsolute: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 50,
  },
  exitButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  eventContext: {
    backgroundColor: '#0F0F13',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333336',
  },
  contextText: {
    color: '#A1A1AA',
    fontSize: 16,
    marginBottom: 8,
  },
  contextValue: {
    color: '#FFF',
    fontWeight: '700',
  },
  checkmarkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
    fontFamily: 'System',
  },
  payoutContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  payoutAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
    fontFamily: 'System',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  processingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  processingText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'System',
  },
  noActionText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'System',
  },
  trackButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
});
