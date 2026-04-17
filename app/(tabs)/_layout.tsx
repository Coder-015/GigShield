import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

function TabBarIcon({ icon: Icon, color, size = 24 }: { icon: any; color: string; size?: number }) {
  return <Icon size={size} color={color} />;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? insets.bottom || 24 : 24,
            left: 20,
            right: 20,
            elevation: 8,
            backgroundColor: '#1C1C1E', // Dark floating card
            borderRadius: 24,
            height: 70,
            paddingBottom: 12,
            paddingTop: 12,
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
          },
          tabBarActiveTintColor: '#F97316',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: -4,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? 'map' : 'map-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="claims"
          options={{
            title: 'Claims',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? 'document-text' : 'document-text-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? 'person' : 'person-outline'} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
});
