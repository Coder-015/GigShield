import * as SecureStore from 'expo-secure-store';

export const MOCK_USER = {
  id: 'mock-user-001',
  name: 'Rahul Kumar',
  phone: '9876543210',
  city: 'Mumbai',
  zone: 'Dharavi',
  platform: 'Zomato',
  weeklyEarnings: '3500',
  plan: 'standard',
  memberSince: 'March 2024',
  email: 'rahul.kumar@example.com',
  initials: 'RK',
  streak: 4,
  upiId: 'rahul.k@upi',
};

export const saveMockUserToStorage = async (): Promise<void> => {
  try {
    await SecureStore.setItemAsync('gigshield_user', JSON.stringify(MOCK_USER));
  } catch (error) {
    console.error('Failed to save mock user:', error);
  }
};

export const getStoredUser = async () => {
  try {
    const stored = await SecureStore.getItemAsync('gigshield_user');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get stored user:', error);
    return null;
  }
};

export const clearStoredUser = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync('gigshield_user');
  } catch (error) {
    console.error('Failed to clear stored user:', error);
  }
};
