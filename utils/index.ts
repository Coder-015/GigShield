import { Alert } from 'react-native';

// Format currency to Indian Rupees
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format date to readable format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format time to readable format
export const formatTime = (timeString: string): string => {
  const time = new Date(`2000-01-01T${timeString}`);
  return time.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate time ago
export const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// Generate user initials
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

// Validate Indian phone number
export const validateIndianPhone = (phone: string): boolean => {
  const phoneRegex = /^\+91[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Show error alert
export const showErrorAlert = (message: string, title: string = 'Error') => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

// Show success alert
export const showSuccessAlert = (message: string, title: string = 'Success') => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

// Show confirmation alert
export const showConfirmAlert = (
  message: string,
  onConfirm: () => void,
  title: string = 'Confirm'
) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: onConfirm },
    ]
  );
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => func(...args), wait) as unknown as NodeJS.Timeout;
  };
};

// Deep copy object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Check if object is empty
export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get risk color based on score
export const getRiskColor = (score: number): string => {
  if (score >= 80) return '#EF4444'; // red
  if (score >= 40) return '#F59E0B'; // amber
  return '#10B981'; // green
};

// Get risk level based on score
export const getRiskLevel = (score: number): string => {
  if (score >= 80) return 'High Risk';
  if (score >= 40) return 'Medium Risk';
  return 'Low Risk';
};

// Calculate risk score based on weather and zone
export const calculateRiskScore = (
  weatherIntensity: number,
  zoneRisk: 'high' | 'medium' | 'safe'
): number => {
  let baseScore = 30; // Base score

  // Add weather intensity factor
  if (weatherIntensity > 50) baseScore += 40;
  else if (weatherIntensity > 30) baseScore += 25;
  else if (weatherIntensity > 20) baseScore += 15;
  else baseScore += 5;

  // Add zone risk factor
  if (zoneRisk === 'high') baseScore += 30;
  else if (zoneRisk === 'medium') baseScore += 15;
  else baseScore += 5;

  return Math.min(baseScore, 100);
};

// Store and retrieve from localStorage
export const storage = {
  set: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};
