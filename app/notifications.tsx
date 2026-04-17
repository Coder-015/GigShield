import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Switch, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Bell, CloudRain, Thermometer, Wind, AlertTriangle, MessageSquare } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';

const PREFS_KEY = 'gigshield_notif_prefs';

export default function NotificationsScreen() {
  const [prefs, setPrefs] = useState({
    rainAlert: true,
    heatAlert: true,
    windAlert: false,
    claimPaid: true,
    claimProcessing: true,
    weeklyReport: true,
    marketing: false,
    sms: true,
    push: true,
  });

  const toggle = (key: keyof typeof prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    void SecureStore.setItemAsync(PREFS_KEY, JSON.stringify(next));
  };

  const saveAll = () => {
    void SecureStore.setItemAsync(PREFS_KEY, JSON.stringify(prefs));
    Alert.alert('✅ Saved', 'Notification preferences updated successfully.');
    router.back();
  };

  const ToggleRow = ({
    icon: Icon, label, sub, value, onChange, iconColor = '#F97316',
  }: any) => (
    <View style={s.row}>
      <View style={[s.iconBox, { backgroundColor: iconColor + '20' }]}>
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

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        <Text style={s.sectionLabel}>ALERT CHANNELS</Text>
        <View style={s.card}>
          <ToggleRow icon={Bell} label="Push Notifications"
            sub="Real-time alerts on device" value={prefs.push}
            onChange={() => toggle('push')} iconColor="#F97316" />
          <ToggleRow icon={MessageSquare} label="SMS Alerts"
            sub="Text messages on triggers" value={prefs.sms}
            onChange={() => toggle('sms')} iconColor="#0D9488" />
        </View>

        <Text style={s.sectionLabel}>WEATHER TRIGGERS</Text>
        <View style={s.card}>
          <ToggleRow icon={CloudRain} label="Heavy Rain Alert"
            sub="When rainfall ≥ 40mm/hr" value={prefs.rainAlert}
            onChange={() => toggle('rainAlert')} iconColor="#3B82F6" />
          <ToggleRow icon={Thermometer} label="Extreme Heat Alert"
            sub="When temperature ≥ 43°C" value={prefs.heatAlert}
            onChange={() => toggle('heatAlert')} iconColor="#EF4444" />
          <ToggleRow icon={Wind} label="High Wind Alert"
            sub="When wind speed ≥ 60km/h" value={prefs.windAlert}
            onChange={() => toggle('windAlert')} iconColor="#8B5CF6" />
        </View>

        <Text style={s.sectionLabel}>CLAIM UPDATES</Text>
        <View style={s.card}>
          <ToggleRow icon={AlertTriangle} label="Claim Processing"
            sub="When your claim starts processing" value={prefs.claimProcessing}
            onChange={() => toggle('claimProcessing')} iconColor="#F59E0B" />
          <ToggleRow icon={Bell} label="Payout Credited"
            sub="When money hits your UPI wallet" value={prefs.claimPaid}
            onChange={() => toggle('claimPaid')} iconColor="#10B981" />
        </View>

        <Text style={s.sectionLabel}>REPORTS</Text>
        <View style={s.card}>
          <ToggleRow icon={Bell} label="Weekly Summary"
            sub="Risk report every Monday" value={prefs.weeklyReport}
            onChange={() => toggle('weeklyReport')} iconColor="#6B7280" />
          <ToggleRow icon={Bell} label="Promotions"
            sub="Offers and new features" value={prefs.marketing}
            onChange={() => toggle('marketing')} iconColor="#6B7280" />
        </View>

        <TouchableOpacity style={s.saveBtn} onPress={saveAll} activeOpacity={0.85}>
          <Text style={s.saveBtnTxt}>Save Preferences</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
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
  sectionLabel: {
    color: '#A1A1AA', fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
    marginTop: 24, marginBottom: 8, marginLeft: 4,
  },
  card: { backgroundColor: '#1C1C1E', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2E' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowLabel: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  rowSub: { color: '#A1A1AA', fontSize: 12, marginTop: 1 },
  saveBtn: {
    backgroundColor: '#F97316', borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', marginTop: 28,
    shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  saveBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
