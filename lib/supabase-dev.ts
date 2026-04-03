import { createClient } from '@supabase/supabase-js';

// Development fallback - replace with actual Supabase credentials
const supabaseUrl = 'https://demo.supabase.co';
const supabaseAnonKey = 'demo-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
