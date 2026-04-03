export const user = {
  name: 'Rahul Kumar',
  initials: 'RK',
  phone: '+91 98765 43210',
  city: 'Mumbai',
  zone: 'Dharavi',
  platform: 'Both',
  weeklyEarnings: 'Rs.3000-4000',
  plan: 'Standard',
  memberSince: 'March 2024',
  streak: 4,
  upiId: 'rahul.k@upi',
};

export const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 25,
    coverage: 500,
    description: 'Coverage up to Rs.500/day',
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 49,
    coverage: 700,
    description: 'Coverage up to Rs.700/day',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    coverage: 1000,
    description: 'Coverage up to Rs.1000/day',
    popular: false,
  },
];

export const cities = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad'];

export const platforms = ['Zomato', 'Swiggy', 'Both'];

export const weeklyEarnings = [
  'Rs.2000-3000',
  'Rs.3000-4000',
  'Rs.4000-5000',
  'Rs.5000+',
];

export const zones = [
  { id: 'dharavi', name: 'Dharavi', risk: 'high', color: '#EF4444' },
  { id: 'kurla', name: 'Kurla', risk: 'medium', color: '#F97316' },
  { id: 'andheri', name: 'Andheri', risk: 'medium', color: '#F97316' },
  { id: 'bandra', name: 'Bandra', risk: 'safe', color: '#10B981' },
  { id: 'worli', name: 'Worli', risk: 'safe', color: '#10B981' },
  { id: 'colaba', name: 'Colaba', risk: 'safe', color: '#10B981' },
];

export const claims = [
  {
    id: 'GS-20240320-004',
    type: 'Heavy Rain',
    date: '20 Mar 2024',
    amount: 292,
    status: 'processing',
    zone: 'Dharavi',
    time: '2:14 PM',
    description: '52mm/hr rainfall detected',
  },
  {
    id: 'GS-20240318-003',
    type: 'Heavy Rain',
    date: '18 Mar 2024',
    amount: 234,
    status: 'completed',
    zone: 'Kurla',
    time: '11:30 AM',
    description: '45mm/hr rainfall detected',
  },
  {
    id: 'GS-20240312-002',
    type: 'Bandh/Strike',
    date: '12 Mar 2024',
    amount: 438,
    status: 'completed',
    zone: 'Andheri',
    time: '9:00 AM',
    description: 'City-wide strike declared',
  },
];

export const claimSteps = [
  {
    id: 1,
    title: 'Disruption detected',
    time: '2:14 PM',
    status: 'done',
    subtitle: '52mm/hr rainfall in Dharavi zone',
  },
  {
    id: 2,
    title: 'Trigger validated',
    time: '2:14 PM',
    status: 'done',
    subtitle: 'Parametric threshold exceeded',
  },
  {
    id: 3,
    title: 'Fraud check passed',
    time: '2:15 PM',
    status: 'done',
    subtitle: 'GPS and activity verified',
  },
  {
    id: 4,
    title: 'Payout processing',
    time: '2:15 PM',
    status: 'active',
    subtitle: 'Transferring to UPI account...',
  },
  {
    id: 5,
    title: 'Credited to UPI',
    time: '--:--',
    status: 'pending',
    subtitle: 'rahul.k@upi',
  },
];

export const stats = {
  riskScore: 68,
  riskLevel: 'Medium Risk',
  protectedThisMonth: 876,
  activeClaims: 1,
  streak: 4,
  weeklyPremium: 49,
  coverageTill: 'Sun, 23 Mar',
  incomeAtRisk: 292,
  totalProtected: 1168,
  claimsThisMonth: 3,
  premiumPaid: 196,
  netBenefit: 680,
  avgPayoutTime: '4 min',
};

export const weatherAlert = {
  type: 'Heavy Rain',
  intensity: 52,
  threshold: 40,
  time: '2:00 PM',
  zone: 'Dharavi',
  payoutAmount: 292,
};

export const payoutBreakdown = {
  weeklyBaseline: 3500,
  dailyRate: 583,
  hourlyRate: 73,
  hoursDisrupted: 4,
  totalPayout: 292,
};
