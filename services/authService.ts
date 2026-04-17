import { ApiResponse, LoginCredentials, User } from '@/types';
import Storage from '@/utils/storage';
import { supabase } from '@/lib/supabase';
import * as SupabaseSvc from '@/services/supabaseService';

const AUTH_TOKEN_KEY = '@gigshield_auth_token';
const USER_DATA_KEY = '@gigshield_user_data';

class AuthService {
  // Store auth session in Storage
  async storeAuthSession(user: User): Promise<void> {
    try {
      await Storage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ 
        token: 'mock_token', 
        userId: user.id,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      }));
      await Storage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing auth session:', error);
    }
  }

  // Retrieve auth session from Storage
  async getStoredAuthSession(): Promise<{ user: User | null; token: string | null }> {
    try {
      const tokenData = await Storage.getItem(AUTH_TOKEN_KEY);
      const userData = await Storage.getItem(USER_DATA_KEY);
      
      if (!tokenData || !userData) {
        return { user: null, token: null };
      }

      const { token, expiresAt } = JSON.parse(tokenData);
      
      // Check if token is expired
      if (Date.now() > expiresAt) {
        await this.clearAuthSession();
        return { user: null, token: null };
      }

      const user = JSON.parse(userData);
      return { user, token };
    } catch (error) {
      console.error('Error retrieving auth session:', error);
      return { user: null, token: null };
    }
  }

  // Clear auth session from Storage
  async clearAuthSession(): Promise<void> {
    try {
      await Storage.removeItem(AUTH_TOKEN_KEY);
      await Storage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Error clearing auth session:', error);
    }
  }

  // Send OTP to phone number
  async sendOtp(phone: string): Promise<ApiResponse<{ otpSent: boolean }>> {
    try {
      // For demo, always return success
      return { success: true, data: { otpSent: true } };
    } catch (error) {
      return { success: false, error: 'Failed to send OTP' };
    }
  }

  // Verify OTP and login
  async verifyOtp(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // For demo, validate OTP format and return mock user
      if (!this.validateOtp(credentials.otp || '')) {
        return { success: false, error: 'Invalid OTP format' };
      }

      // Get user from Supabase or create mock user
      const user = await SupabaseSvc.getUserByPhone(credentials.phone);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Store session
      await this.storeAuthSession(user as any);

      return { 
        success: true, 
        data: { 
          user: user as any, 
          token: 'mock_token_' + Date.now() 
        } 
      };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }

  // Register new user
  async signup(userData: {
    fullName: string;
    phone: string;
    city: string;
    platform: string;
    weeklyEarnings: string;
    email?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      // Validate phone number
      if (!this.validatePhone(userData.phone)) {
        return { success: false, error: 'Invalid phone number format' };
      }

      // Create user in Supabase
      const user = await SupabaseSvc.createUser({
        name: userData.fullName,
        phone: userData.phone,
        email: userData.email || '',
        city: userData.city,
        platform: userData.platform,
        weekly_earnings: userData.weeklyEarnings,
      });

      if (!user) {
        return { success: false, error: 'Signup failed' };
      }

      // Create default subscription
      await supabase.from('subscriptions').insert({
        user_id: user.id, plan: 'standard', weekly_premium: 49.00, status: 'active',
      });

      // Store session
      await this.storeAuthSession(user as any);

      return { 
        success: true, 
        data: { 
          user: user as any, 
          token: 'mock_token_' + Date.now() 
        } 
      };
    } catch (error) {
      return { success: false, error: 'Signup failed' };
    }
  }

  // Logout user
  async logout(): Promise<ApiResponse<null>> {
    try {
      await supabase.auth.signOut();
      await this.clearAuthSession();
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  }

  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const { user } = await this.getStoredAuthSession();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: 'Failed to get profile' };
    }
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const { user: currentUser } = await this.getStoredAuthSession();
      if (!currentUser) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data: user, error } = await supabase
        .from('users').update(userData).eq('id', currentUser.id).select().single();
      if (error || !user) {
        return { success: false, error: 'Update failed' };
      }

      // Update stored user data
      await this.storeAuthSession(user);

      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: 'Update failed' };
    }
  }

  // Refresh authentication token
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const { user } = await this.getStoredAuthSession();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const newToken = 'mock_token_' + Date.now();
      
      // Update token in storage
      await Storage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ 
        token: newToken, 
        userId: user.id,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      }));

      return { success: true, data: { token: newToken } };
    } catch (error) {
      return { success: false, error: 'Token refresh failed' };
    }
  }

  // Validate phone number (India format)
  validatePhone(phone: string): boolean {
    // Indian phone number regex: +91 followed by 10 digits, or 10 digits starting with 6-9
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  // Validate OTP
  validateOtp(otp: string): boolean {
    // OTP should be 6 digits
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
  }

  // Initialize auth state on app start
  async initializeAuth(): Promise<{ user: User | null; isAuthenticated: boolean }> {
    try {
      const { user, token } = await this.getStoredAuthSession();
      
      if (user && token) {
        // Optionally verify token with Supabase
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          return { user, isAuthenticated: true };
        }
      }
      
      // Clear invalid session
      await this.clearAuthSession();
      return { user: null, isAuthenticated: false };
    } catch (error) {
      console.error('Auth initialization error:', error);
      await this.clearAuthSession();
      return { user: null, isAuthenticated: false };
    }
  }
}

export const authService = new AuthService();
export default authService;
