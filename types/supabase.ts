// Supabase database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          city: string;
          zone: string;
          platform: string;
          weekly_earnings: string;
          plan: string;
          upi_id: string;
          member_since: string;
          initials: string;
          streak: number;
          created_at: string;
          updated_at: string;
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      }
      claims: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          date: string;
          zone: string;
          amount: number;
          status: 'processing' | 'pending' | 'completed' | 'rejected';
          description: string;
          created_at: string;
          updated_at: string;
        }
        Insert: Omit<Database['public']['Tables']['claims']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['claims']['Insert']>;
      }
      subscription_plans: {
        Row: {
          id: string;
          user_id: string;
          plan_name: string;
          weekly_premium: number;
          features: string[];
          created_at: string;
          updated_at: string;
        }
        Insert: Omit<Database['public']['Tables']['subscription_plans']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscription_plans']['Insert']>;
      }
    }
    Views: {
      [_ in never]: never;
    }
    Functions: {
      [_ in never]: never;
    }
    Enums: {
      [_ in never]: never;
    }
    CompositeTypes: {
      [_ in never]: never;
    }
  }
}
