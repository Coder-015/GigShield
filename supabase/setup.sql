-- Create tables for GigShield app

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  city TEXT NOT NULL,
  zone TEXT NOT NULL,
  platform TEXT NOT NULL,
  weekly_earnings TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'Basic',
  upi_id TEXT NOT NULL,
  member_since TEXT NOT NULL,
  initials TEXT NOT NULL,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  zone TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processing', 'pending', 'completed', 'rejected')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  weekly_premium INTEGER NOT NULL,
  features TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_user_id ON subscription_plans(user_id);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Claims policies
CREATE POLICY "Users can view own claims" ON claims
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own claims" ON claims
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Subscription plans policies
CREATE POLICY "Users can view own subscription" ON subscription_plans
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own subscription" ON subscription_plans
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional)
INSERT INTO users (name, phone, email, city, zone, platform, weekly_earnings, plan, upi_id, member_since, initials)
VALUES 
  ('John Doe', '+919876543210', 'john@example.com', 'Mumbai', 'Bandra', 'Swiggy', '₹5,000-₹7,500', 'Basic', '+919876543210@ybl', '2024-01-15', 'JD')
ON CONFLICT (phone) DO NOTHING;

-- Basic subscription plan
INSERT INTO subscription_plans (user_id, plan_name, weekly_premium, features)
SELECT 
  id,
  'Basic',
  49,
  ARRAY['Rain protection', 'Instant payouts', '24/7 support']
FROM users 
WHERE phone = '+919876543210'
ON CONFLICT DO NOTHING;

-- SQL Analytics Views
CREATE OR REPLACE VIEW user_claim_stats AS
SELECT 
  user_id, 
  COUNT(id) as total_claims, 
  SUM(amount) as total_payout, 
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_claims,
  COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_claims
FROM claims 
GROUP BY user_id;
