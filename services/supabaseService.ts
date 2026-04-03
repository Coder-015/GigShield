import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  zone: string;
  platform: string;
  weekly_earnings: string;
  plan: string;
  created_at: string;
  memberSince?: string; // Optional field
}

export interface Claim {
  id: string;
  user_id: string;
  claim_number: string;
  disruption_type: string;
  zone: string;
  amount: number;
  hours_affected: number;
  status: 'processing' | 'completed' | 'rejected';
  triggered_at: string;
  paid_at: string | null;
}

const ZONE_MAP: Record<string, string> = {
  Mumbai: 'Dharavi',
  Delhi: 'Lajpat Nagar',
  Bengaluru: 'Koramangala',
  Chennai: 'Anna Nagar',
  Hyderabad: 'Hitech City',
};

// Create new user in Supabase
export async function createUser(data: {
  name: string;
  phone: string;
  email: string;
  city: string;
  platform: string;
  weekly_earnings: string;
}): Promise<UserProfile> {
  // Check if phone already exists
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('phone', data.phone)
    .single();

  if (existing) {
    // User exists — just return them (acts as login)
    return existing as UserProfile;
  }

  // Create new user
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      city: data.city,
      zone: ZONE_MAP[data.city] || 'Central Zone',
      platform: data.platform,
      weekly_earnings: data.weekly_earnings,
      plan: 'standard',
    })
    .select()
    .single();

  if (error) throw error;

  // Create default subscription
  await supabase.from('subscriptions').insert({
    user_id: newUser.id,
    plan: 'standard',
    weekly_premium: 49.00,
    status: 'active',
  });

  return newUser as UserProfile;
}

// Get user by phone
export async function getUserByPhone(phone: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

// Get user by ID
export async function getUserById(id: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

// Get claims for user
export async function getUserClaims(userId: string): Promise<Claim[]> {
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('user_id', userId)
    .order('triggered_at', { ascending: false });

  if (error || !data) return getMockClaims();
  if (data.length === 0) return getMockClaims();
  return data as Claim[];
}

// Create a new claim (called when rain trigger fires)
export async function createClaim(data: {
  user_id: string;
  disruption_type: string;
  zone: string;
  amount: number;
  hours_affected: number;
}): Promise<Claim> {
  const claimNumber = 'GS-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(Math.random() * 900 + 100);
  
  const { data: claim, error } = await supabase
    .from('claims')
    .insert({
      user_id: data.user_id,
      claim_number: claimNumber,
      disruption_type: data.disruption_type,
      zone: data.zone,
      amount: data.amount,
      hours_affected: data.hours_affected,
      status: 'processing',
    })
    .select()
    .single();

  if (error) throw error;
  return claim as Claim;
}

// Update claim status to completed
export async function completeClaim(claimId: string): Promise<void> {
  await supabase
    .from('claims')
    .update({ status: 'completed', paid_at: new Date().toISOString() })
    .eq('id', claimId);
}

// Get user claim stats from SQL View
export async function getUserStats(userId: string): Promise<any> {
  const { data, error } = await supabase
    .from('user_claim_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data;
}

// Mock claims for when no real claims exist yet
function getMockClaims(): Claim[] {
  return [
    {
      id: 'mock-1',
      user_id: 'mock',
      claim_number: 'GS-20240318-002',
      disruption_type: 'Heavy Rain',
      zone: 'Dharavi',
      amount: 234,
      hours_affected: 3.2,
      status: 'completed',
      triggered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      paid_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'mock-2',
      user_id: 'mock',
      claim_number: 'GS-20240312-001',
      disruption_type: 'Bandh/Strike',
      zone: 'Lajpat Nagar',
      amount: 438,
      hours_affected: 6.0,
      status: 'completed',
      triggered_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      paid_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}
