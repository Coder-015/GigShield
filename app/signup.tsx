import { createUser } from '@/services/supabaseService';
import UserStore from '@/store/userStore';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad'];
const PLATFORMS = ['Zomato', 'Swiggy', 'Both'];
const EARNINGS = ['Rs.2000-3000', 'Rs.3000-4000', 'Rs.4000-5000', 'Rs.5000+'];

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [platform, setPlatform] = useState('Zomato');
  const [earnings, setEarnings] = useState('Rs.3000-4000');
  const [loading, setLoading] = useState(false);
  const [cityModal, setCityModal] = useState(false);
  const [platformModal, setPlatformModal] = useState(false);
  const [earningsModal, setEarningsModal] = useState(false);

  function validate() {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      Alert.alert('Error', 'Enter a valid 10-digit phone number');
      return false;
    }
    return true;
  }

  async function handleContinue() {
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await createUser({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city,
        platform,
        weekly_earnings: earnings,
      });
      UserStore.setUser(user);
      // Small delay to ensure store is set before navigation
      await new Promise(r => setTimeout(r, 100));
      router.replace('/(tabs)' as any);
    } catch (e: any) {
      console.error('Signup error:', e);
      Alert.alert(
        'Connection Error',
        'Could not connect to server. Using demo mode.',
        [{
          text: 'Continue in Demo Mode',
          onPress: () => {
            UserStore.setUser({
              id: 'demo-' + Date.now(),
              name: name.trim() || 'Demo User',
              phone: phone.trim(),
              email: email.trim(),
              city,
              zone: 'Dharavi',
              platform,
              weekly_earnings: earnings,
              plan: 'standard',
              created_at: new Date().toISOString(),
            });
            router.replace('/(tabs)' as any);
          }
        }]
      );
    } finally {
      setLoading(false);
    }
  }

  const DropdownModal = ({
    visible, onClose, title, options, selected, onSelect,
  }: {
    visible: boolean; onClose: () => void; title: string;
    options: string[]; selected: string; onSelect: (v: string) => void;
  }) => (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={styles.modalItem}
              onPress={() => { onSelect(opt); onClose(); }}
            >
              <Text style={[
                styles.modalItemText,
                opt === selected && styles.modalItemSelected,
              ]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Join thousands of delivery partners protected by GigShield
        </Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="10-digit mobile number"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          maxLength={10}
        />

        <Text style={styles.label}>Email (Optional)</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>City</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setCityModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{city}</Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Platform</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setPlatformModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{platform}</Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Weekly Earnings</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setEarningsModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{earnings}</Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginOrange}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <DropdownModal
        visible={cityModal}
        onClose={() => setCityModal(false)}
        title="Select City"
        options={CITIES}
        selected={city}
        onSelect={setCity}
      />
      <DropdownModal
        visible={platformModal}
        onClose={() => setPlatformModal(false)}
        title="Select Platform"
        options={PLATFORMS}
        selected={platform}
        onSelect={setPlatform}
      />
      <DropdownModal
        visible={earningsModal}
        onClose={() => setEarningsModal(false)}
        title="Weekly Earnings"
        options={EARNINGS}
        selected={earnings}
        onSelect={setEarnings}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF7' },
  content: { padding: 24, paddingBottom: 48, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 32, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: { fontSize: 16, color: '#1C1C1E' },
  arrow: { fontSize: 12, color: '#6B7280' },
  button: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginText: { fontSize: 14, color: '#6B7280' },
  loginOrange: { color: '#F97316', fontWeight: '600' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    padding: 16,
    paddingBottom: 8,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalItemText: { fontSize: 16, color: '#1C1C1E' },
  modalItemSelected: { color: '#F97316', fontWeight: '700' },
});
