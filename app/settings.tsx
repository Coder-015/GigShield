import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Switch, Alert, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft, Bell, Moon, Globe, Shield, Trash2,
  Lock, HelpCircle, ChevronRight, Info
} from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const { toggleDemoMode, isDemoMode, clear } = useUserStore();
  const [darkMode] = useState(true);
  const [locationPerm, setLocationPerm] = useState(true);
  const [biometric, setBiometric] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            clear();
            router.replace('/login' as any);
          }
        }
      ]
    );
  };

  const Section = ({ title }: { title: string }) => (
    <Text style={s.sectionTitle}>{title}</Text>
  );

  const ToggleRow = ({ icon: Icon, label, sub, value, onChange, iconColor = '#F97316' }: any) => (
    <View style={s.row}>
      <View style={[s.iconBox, { backgroundColor: iconColor + '22' }]}>
        <Icon size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={s.rowLabel}>{label}</Text>
        {sub && <Text style={s.rowSub}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#333', true: '#F97316' }}
        thumbColor="#FFF"
      />
    </View>
  );

  const NavRow = ({ icon: Icon, label, sub, onPress, color = '#F97316', danger = false }: any) => (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.iconBox, { backgroundColor: (danger ? '#EF4444' : color) + '22' }]}>
        <Icon size={18} color={danger ? '#EF4444' : color} />
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={[s.rowLabel, danger && { color: '#EF4444' }]}>{label}</Text>
        {sub && <Text style={s.rowSub}>{sub}</Text>}
      </View>
      <ChevronRight size={16} color="#555" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        <Section title="Appearance" />
        <View style={s.card}>
          <ToggleRow
            icon={Moon} label="Dark Mode" sub="Always on for best experience"
            value={darkMode} onChange={() => {
              Alert.alert('Battery Warning 🔋', "Switching to light mode will drain your battery significantly. We strongly recommend keeping Dark Mode on for optimal performance.");
            }} iconColor="#6366F1"
          />
          <ToggleRow
            icon={Globe} label="English" sub="App language"
            value={true} onChange={() => {}} iconColor="#0D9488"
          />
        </View>

        <Section title="Security" />
        <View style={s.card}>
          <ToggleRow
            icon={Lock} label="Biometric Login" sub="Face ID / Fingerprint"
            value={biometric} onChange={setBiometric} iconColor="#10B981"
          />
          <ToggleRow
            icon={Shield} label="Location Access" sub="Required for zone-based risk"
            value={locationPerm} onChange={setLocationPerm} iconColor="#F97316"
          />
        </View>

        <Section title="Developer" />
        <View style={s.card}>
          <ToggleRow
            icon={Info} label="Demo Mode" sub="Simulate backend flows without real DB"
            value={isDemoMode} onChange={toggleDemoMode} iconColor="#F59E0B"
          />
          <NavRow
            icon={HelpCircle} label="App Version" sub="GigShield v1.0.0 · ML Engine v1.2"
            onPress={() => {}} color="#6B7280"
          />
        </View>

        <Section title="Legal" />
        <View style={s.card}>
          <NavRow
            icon={Shield} label="Privacy Policy"
            onPress={() => Linking.openURL('https://gigshield.app/privacy')}
            color="#6B7280"
          />
          <NavRow
            icon={Shield} label="Terms of Service"
            onPress={() => Linking.openURL('https://gigshield.app/terms')}
            color="#6B7280"
          />
        </View>

        <Section title="Danger Zone" />
        <View style={s.card}>
          <NavRow
            icon={Trash2} label="Delete Account" sub="Permanently remove all your data"
            onPress={handleDeleteAccount} danger
          />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
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
  sectionTitle: { color: '#A1A1AA', fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginTop: 24, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2E' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  rowSub: { color: '#A1A1AA', fontSize: 12, marginTop: 1 },
});
