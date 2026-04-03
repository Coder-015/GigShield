import { Button } from '@/components/DesignSystem';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PayoutSuccess() {
  const params = useLocalSearchParams();
  const amount = parseInt(params.amount as string) || 292;
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [confettiAnim] = useState(new Animated.Value(0));
  const [showContent, setShowContent] = useState(false);
  
  // SVG animation refs
  const circleAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  // Confetti particles
  const [confetti] = useState(() => 
    [...Array(20)].map((_, i) => ({
      id: i,
      x: Math.random() * screenWidth,
      y: -20,
      color: ['#10B981', '#F97316', '#3B82F6', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 1000,
      duration: 3000 + Math.random() * 2000,
    }))
  );

  useEffect(() => {
    console.log('Payout success params:', { amount });

    // Start SVG circle animation
    Animated.timing(circleAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Start checkmark animation after circle completes
    setTimeout(() => {
      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }, 800);

    // Show content after animations
    setTimeout(() => {
      setShowContent(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 1200);

    // Start confetti animation
    Animated.timing(confettiAnim, {
      toValue: 1,
      duration: 4000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animated SVG circle (draws itself)
  const circleRadius = 40;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleStrokeDashoffset = circleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circleCircumference, 0],
  }) as any;

  // Animated checkmark path
  const checkPathLength = 60; // Approximate path length
  const checkStrokeDashoffset = checkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [checkPathLength, 0],
  }) as any;

  const handleViewClaims = () => {
    router.push('/(tabs)/claims');
  };

  const handleBackHome = () => {
    router.replace('/(tabs)' as any);
  };

  // Render confetti particle
  const renderConfetti = (particle: typeof confetti[0]) => {
    const translateYAnim = new Animated.Value(-20);
    const rotateAnim = new Animated.Value(0);
    
    useEffect(() => {
      const animateParticle = () => {
        translateYAnim.setValue(-20);
        rotateAnim.setValue(0);
        
        Animated.parallel([
          Animated.timing(translateYAnim, {
            toValue: screenHeight + 20,
            duration: particle.duration,
            delay: particle.delay,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 360,
            duration: particle.duration,
            delay: particle.delay,
            useNativeDriver: true,
          }),
        ]).start();
      };
      
      animateParticle();
    }, []);

    return (
      <Animated.View
        key={particle.id}
        style={[
          styles.confettiParticle,
          {
            left: particle.x,
            backgroundColor: particle.color,
            transform: [
              { translateY: translateYAnim },
              { rotate: rotateAnim.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              }) }
            ],
          }
        ]}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Confetti Animation */}
      <View style={styles.confettiContainer}>
        {confetti.map(renderConfetti)}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Animated SVG Checkmark */}
        <View style={styles.checkmarkContainer}>
          <Svg width={120} height={120}>
            {/* Circle */}
            <Circle
              cx={60}
              cy={60}
              r={circleRadius}
              stroke="#10B981"
              strokeWidth="4"
              fill="none"
              strokeDasharray={circleCircumference}
              strokeDashoffset={circleStrokeDashoffset}
            />
            {/* Checkmark */}
            <Path
              d="M 35 60 L 50 75 L 85 40"
              stroke="#10B981"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={checkPathLength}
              strokeDashoffset={checkStrokeDashoffset}
            />
          </Svg>
        </View>

        {/* Success Message */}
        {showContent && (
          <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
            <Text style={styles.successTitle}>₹{amount} Credited!</Text>
            <Text style={styles.successSubtitle}>
              Transferred to your UPI account
            </Text>
            <Text style={styles.upiDetails}>
              rahul.k@upi — 20 Mar 2024, 2:18 PM
            </Text>
            
            {/* Time Badge */}
            <View style={styles.timeBadge}>
              <Text style={styles.timeBadgeText}>Processed in 4 minutes</Text>
            </View>
          </Animated.View>
        )}

        {/* Summary Card */}
        {showContent && (
          <Animated.View style={[styles.summaryContainer, { opacity: fadeAnim }]}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Monthly Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Claims this month</Text>
                <Text style={styles.summaryValue}>3</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total protected</Text>
                <Text style={styles.summaryValue}>₹876</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Premium paid</Text>
                <Text style={styles.summaryValue}>₹196</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabelTotal}>Net benefit</Text>
                <Text style={styles.summaryValueTotal}>₹680</Text>
              </View>
            </View>

            {/* Loyalty Badge */}
            <View style={styles.loyaltyBadge}>
              <Text style={styles.loyaltyText}>4-week streak! Rs. 5 off next week</Text>
            </View>
          </Animated.View>
        )}

            {/* Action Buttons */}
            <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
              <Button
                onPress={handleViewClaims}
                size="large"
                style={styles.viewClaimsButton}
              >
                View Processed Claims
              </Button>
              
              <TouchableOpacity onPress={handleBackHome} style={styles.textLinkButton}>
                <Text style={styles.textLink}>Return to dashboard</Text>
              </TouchableOpacity>
            </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confettiParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'System',
  },
  upiDetails: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
  },
  timeBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeBadgeText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '600',
    fontFamily: 'System',
  },
  summaryContainer: {
    marginBottom: 32,
  },
  summaryCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(28, 28, 30, 0.65)',
    borderWidth: 1,
    borderColor: '#333336',
    borderRadius: 16,
  },
  summaryTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#A1A1AA',
    fontFamily: 'System',
  },
  summaryValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: 'System',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#333336',
    marginVertical: 8,
  },
  summaryLabelTotal: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'System',
  },
  summaryValueTotal: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  loyaltyBadge: {
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  loyaltyText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'System',
  },
  buttonContainer: {
    gap: 12,
  },
  viewClaimsButton: {
    marginBottom: 16,
    backgroundColor: '#10B981',
  },
  textLinkButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  textLink: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
  },
});
