import useAppStore from '@/store/useAppStore';
import { UserStore } from '@/store/userStore';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Your income, protected',
    subtitle: 'Get instant payouts when rain disrupts your delivery work',
    bgColor: ['#F97316', '#FB923C'] as const,
    icon: '🌧️',
  },
  {
    id: 2,
    title: 'Zero forms. Instant payout',
    subtitle: 'AI-powered detection means no paperwork and money in minutes',
    bgColor: ['#0D9488', '#14B8A6'] as const,
    icon: '✅',
  },
  {
    id: 3,
    title: 'Rs. 49/week. Cancel anytime',
    subtitle: 'Affordable protection that fits your delivery schedule',
    bgColor: ['#3B82F6', '#60A5FA'] as const,
    icon: '🛡️',
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { completeOnboarding } = useAppStore();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      // Animate fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(currentIndex + 1);
        // Animate fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    UserStore.setUser({
      id: 'demo-001',
      name: 'Rahul Kumar',
      phone: '9876543210',
      email: 'rahul@demo.com',
      city: 'Mumbai',
      zone: 'Dharavi',
      platform: 'Zomato',
      weekly_earnings: 'Rs.3000-4000',
      plan: 'standard',
      created_at: new Date().toISOString(),
    });
    router.replace('/(tabs)' as any);
  };

  const handleGetStarted = () => {
    router.replace('/signup');
  };

  const handleDotPress = (index: number) => {
    if (index !== currentIndex) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(index);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const renderSlide = (slide: typeof slides[0]) => (
    <Animated.View style={[styles.slide, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={slide.bgColor}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{slide.icon}</Text>
        </View>
      </LinearGradient>
      
      <View style={styles.content}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip — use demo mode</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.slideContainer}>
        {renderSlide(slides[currentIndex])}
      </View>
      
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
            onPress={() => handleDotPress(index)}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'System',
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 120,
    color: '#FFFFFF',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 28,
    fontFamily: 'System',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: '#F97316',
    width: 24,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  nextButton: {
    backgroundColor: '#F97316',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'System',
  },
});
