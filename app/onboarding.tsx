import useAppStore from '@/store/useAppStore';
import { useUserStore } from '@/store/userStore';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

const { width: W, height: H } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Income Protected.',
    subtitle: 'Get instant payouts when heavy rain or heat waves disrupt your delivery work.',
    accent: '#F97316',
    bgColors: ['#0F0F13', '#1A0E08'] as const,
    renderGraphic: (parallaxVal: any) => (
      <View style={s.graphicBox}>
        <Animated.View style={{ transform: [{ translateY: parallaxVal.interpolate({ inputRange: [-W, 0, W], outputRange: [-100, 0, 100] }) }]}}>
          <Svg width={180} height={180} viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="45" fill="none" stroke="#F97316" strokeWidth="2" strokeDasharray="4 8" />
            <Path d="M40 70 L50 60 L65 80" stroke="#F97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M30 40 Q50 10 70 40 Q90 40 80 60 Q70 80 50 70 Q30 80 20 60 Q10 40 30 40 Z" fill="#F97316" fillOpacity="0.2" stroke="#F97316" strokeWidth="3" />
          </Svg>
        </Animated.View>
        <Animated.View style={[s.floatingPill, { backgroundColor: '#F9731622', borderColor: '#F9731655', transform: [{ translateY: parallaxVal.interpolate({ inputRange: [-W, 0, W], outputRange: [150, 0, -150] }) }] }]}>
          <Text style={[s.pillTxt, { color: '#F97316' }]}>Parametric Weather tracking</Text>
        </Animated.View>
      </View>
    )
  },
  {
    id: '2',
    title: 'Zero Forms.',
    subtitle: 'Our AI Risk Engine monitors the weather live and processes payouts automatically.',
    accent: '#10B981',
    bgColors: ['#0F0F13', '#051A12'] as const,
    renderGraphic: (parallaxVal: any) => (
      <View style={s.graphicBox}>
        <Animated.View style={{ transform: [{ scale: parallaxVal.interpolate({ inputRange: [-W, 0, W], outputRange: [0.5, 1, 0.5] }) }, { rotate: parallaxVal.interpolate({ inputRange: [-W, 0, W], outputRange: ['-45deg', '0deg', '45deg'] }) }]}}>
          <Svg width={180} height={180} viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="aiGrad" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                <Stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="50" cy="50" r="50" fill="url(#aiGrad)" />
            <Path d="M50 20 L50 80 M20 50 L80 50" stroke="#10B981" strokeWidth="8" strokeLinecap="round" />
            <Circle cx="50" cy="50" r="15" fill="#0F0F13" stroke="#10B981" strokeWidth="4" />
            <Circle cx="50" cy="50" r="6" fill="#10B981" />
          </Svg>
        </Animated.View>
        <Animated.View style={[s.floatingPill, { top: '75%', backgroundColor: '#10B98122', borderColor: '#10B98155', transform: [{ translateX: parallaxVal.interpolate({ inputRange: [-W, 0, W], outputRange: [-150, 0, 150] }) }] }]}>
          <Text style={[s.pillTxt, { color: '#10B981' }]}>Automated Fraud Detection</Text>
        </Animated.View>
      </View>
    )
  },
  {
    id: '3',
    title: 'Your Money.',
    subtitle: 'Transferred directly to your UPI ID within minutes of a confirmed disruption.',
    accent: '#3B82F6',
    bgColors: ['#0F0F13', '#061124'] as const,
    renderGraphic: (parallaxVal: any) => (
      <View style={s.graphicBox}>
        <Animated.View style={{ transform: [{ translateX: parallaxVal.interpolate({ inputRange: [-W, 0, W], outputRange: [100, 0, -100] }) }]}}>
          <Svg width={200} height={120} viewBox="0 0 200 120">
            <Rect x="20" y="20" width="160" height="80" rx="16" fill="#0F0F13" stroke="#3B82F6" strokeWidth="4" />
            <Circle cx="50" cy="60" r="14" fill="#3B82F6" fillOpacity="0.3" stroke="#3B82F6" strokeWidth="2" />
            <Path d="M80 50 L150 50 M80 70 L120 70" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" />
          </Svg>
        </Animated.View>
        <Animated.View style={{ position: 'absolute', transform: [{ translateY: parallaxVal.interpolate({ inputRange: [-W, 0, W], outputRange: [200, 0, -200] }) }]}}>
          <Svg width={80} height={80} viewBox="0 0 100 100">
            <Circle cx="50" cy="50" r="40" fill="#3B82F6" />
            <Path d="M35 50 L45 60 L65 40" stroke="#FFF" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Animated.View>
      </View>
    )
  },
];

export default function ParallaxOnboarding() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const { setUser } = useUserStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  const onViewRef = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
      Haptics.selectionAsync();
    }
  }).current;

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUser({
      user: {
        id: 'demo-001',
        name: 'Rahul Kumar',
        phone: '9876543210',
        email: 'rahul@demo.com',
        city: 'Mumbai',
        zone: 'Dharavi',
        platform: 'Zomato',
        weekly_earnings: '3500',
        plan: 'standard',
        created_at: new Date().toISOString(),
      },
      isAuthenticated: true
    });
    router.replace('/(tabs)' as any);
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      router.replace('/signup');
    }
  };

  // Interpolate Background Colors depending on Scroll
  const bgColor = scrollX.interpolate({
    inputRange: SLIDES.map((_, i) => i * W),
    outputRange: SLIDES.map(s => s.bgColors[1]),
  });

  return (
    <Animated.View style={[s.container, { backgroundColor: bgColor }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.header}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={s.skipTxt}>Skip Demo</Text>
          </TouchableOpacity>
        </View>

        <Animated.FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
          onViewableItemsChanged={onViewRef}
          viewabilityConfig={viewConfig}
          scrollEventThrottle={16}
          renderItem={({ item, index }) => {
            const inputRange = [(index - 1) * W, index * W, (index + 1) * W];
            
            // Text Parallax Animations
            const txtTx = scrollX.interpolate({ inputRange, outputRange: [W * 0.8, 0, -W * 0.8] });
            const pTx = scrollX.interpolate({ inputRange, outputRange: [W * 1.5, 0, -W * 1.5] });
            const opacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0] });
            
            // Graphic Parallax calculation
            const parallaxVal = Animated.subtract(scrollX, index * W);

            return (
              <View style={[s.slide, { width: W }]}>
                {item.renderGraphic(parallaxVal)}
                
                <View style={s.textCont}>
                  <Animated.Text style={[s.title, { opacity, transform: [{ translateX: txtTx }] }]}>
                    {item.title}
                  </Animated.Text>
                  <Animated.Text style={[s.subtitle, { opacity, transform: [{ translateX: pTx }] }]}>
                    {item.subtitle}
                  </Animated.Text>
                </View>
              </View>
            );
          }}
        />

        {/* Footer */}
        <View style={s.footer}>
          <View style={s.dots}>
            {SLIDES.map((_, i) => {
              const wd = scrollX.interpolate({
                inputRange: [(i - 1) * W, i * W, (i + 1) * W],
                outputRange: [8, 32, 8],
                extrapolate: 'clamp',
              });
              const o = scrollX.interpolate({
                inputRange: [(i - 1) * W, i * W, (i + 1) * W],
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return <Animated.View key={i} style={[s.dot, { width: wd, opacity: o, backgroundColor: SLIDES[i].accent }]} />;
            })}
          </View>
          
          <TouchableOpacity style={s.ctaContainer} onPress={handleNext} activeOpacity={0.8}>
            <Animated.View style={[s.cta, { backgroundColor: SLIDES[currentIndex].accent }]}>
              <Text style={s.ctaTxt}>{currentIndex === SLIDES.length - 1 ? 'Start Building' : 'Next'}</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F13' },
  header: { alignItems: 'flex-end', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 10, zIndex: 10 },
  skipTxt: { color: '#A1A1AA', fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  graphicBox: { width: W, height: W, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  floatingPill: { position: 'absolute', top: '15%', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  pillTxt: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  textCont: { paddingHorizontal: 32, alignItems: 'center' },
  title: { color: '#FFF', fontSize: 44, fontWeight: '900', textAlign: 'center', marginBottom: 16, letterSpacing: -1 },
  subtitle: { color: '#A1A1AA', fontSize: 17, textAlign: 'center', lineHeight: 28 },
  footer: { paddingHorizontal: 32, paddingBottom: 40 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32, gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  ctaContainer: { width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12 },
  cta: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, borderRadius: 20 },
  ctaTxt: { color: '#FFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
});
