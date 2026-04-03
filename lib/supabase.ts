import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ovxkojfmgudllvqavumc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eGtvamZtZ3VkbGx2cWF2dW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxOTY3MjQsImV4cCI6MjA5MDc3MjcyNH0.ZYGyAZq6_SuokaG5EJGWMmkvk0M89OTnPFlu1XM6WIE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,    // KEY FIX: disable session persistence
    detectSessionInUrl: false, // stops AsyncStorage usage
    storage: undefined,        // no storage = no AsyncStorage crash
  },
});

export default supabase;
