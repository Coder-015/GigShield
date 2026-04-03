
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
    await Storage.setItem('gigshield_user', JSON.stringify(MOCK_USER));
    console.log('Mock user saved to storage');
  } catch (error) {
    console.error('Failed to save mock user:', error);
  }
};

export const getStoredUser = async () => {
  try {
    const stored = await Storage.getItem('gigshield_user');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get stored user:', error);
    return null;
  }
};

export const clearStoredUser = async (): Promise<void> => {
  try {
    await Storage.removeItem('gigshield_user');
    console.log('Stored user cleared');
  } catch (error) {
    console.error('Failed to clear stored user:', error);
  }
};
