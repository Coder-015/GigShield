// User related types
export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  city: string;
  zone: string;
  platform: string;
  weeklyEarnings: string;
  plan: string;
  upiId: string;
  memberSince: string;
  initials: string;
  streak?: number;
}

// Plan related types
export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

// Claim related types
export interface Claim {
  id: string;
  type: string;
  date: string;
  zone: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimStep {
  id: number;
  title: string;
  time: string;
  status: 'done' | 'active' | 'pending';
  subtitle: string;
}

// Zone related types
export interface Zone {
  id: string;
  name: string;
  risk: 'high' | 'medium' | 'safe';
  color: string;
}

// Weather related types
export interface WeatherAlert {
  intensity: number;
  threshold: number;
  time: string;
  payoutAmount: number;
}

// Stats related types
export interface Stats {
  riskScore: number;
  claimsThisMonth: number;
  avgPayoutTime: string;
  totalProtected: number;
  premiumPaid: number;
  netBenefit: number;
  weeklyPremium: number;
  streak: number;
  activeClaims?: number;
  completedClaims?: number;
}

// API related types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Form related types
export interface SignupForm {
  fullName: string;
  phone: string;
  city: string;
  platform: string;
  weeklyEarnings: string;
}

export interface LoginCredentials {
  phone: string;
  otp?: string;
}

// App state related types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  claims: Claim[];
  currentClaim: Claim | null;
  weatherAlert: WeatherAlert | null;
  selectedPlan: Plan | null;
}

// Navigation related types
export type RootStackParamList = {
  onboarding: undefined;
  signup: undefined;
  'plan-selection': undefined;
  '(tabs)': undefined;
  alert: undefined;
  'claim-tracking': undefined;
  'payout-success': undefined;
};

export type TabParamList = {
  index: undefined;
  map: undefined;
  claims: undefined;
  profile: undefined;
};
