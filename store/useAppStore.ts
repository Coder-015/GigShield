import { authService } from '@/services/authService';
import * as SupabaseService from '@/services/supabaseService';
import { weatherService } from '@/services/weatherService';
import { Claim, Plan, Stats, User, WeatherAlert } from '@/types';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useUserStore } from '@/store/userStore';

const zustandStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // silently fail — app still works with in-memory state
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // silently fail
    }
  },
};

// Mock data for immediate display (will be replaced by real data)
const mockStats: Stats = {
  riskScore: 65,
  weeklyPremium: 49,
  totalProtected: 50000,
  activeClaims: 0,
  completedClaims: 3,
  claimsThisMonth: 0,
  avgPayoutTime: '2 hours',
  premiumPaid: 147,
  netBenefit: 453,
  streak: 5,
};

const mockWeatherAlert: WeatherAlert = {
  intensity: 6.5,
  threshold: 2.0,
  time: '2024-03-20T14:00:00Z',
  payoutAmount: 350,
};

interface AppStore {
  // User state
  user: User | null;
  isLoggedIn: boolean;
  isFirstTime: boolean;
  
  // Loading states
  isLoading: boolean;
  isClaimProcessing: boolean;
  error: string | null;
  
  // Data
  claims: Claim[];
  currentClaim: Claim | null;
  weatherAlert: WeatherAlert | null;
  selectedPlan: Plan | null;
  stats: Stats | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Claim actions
  setClaims: (claims: Claim[]) => void;
  setCurrentClaim: (claim: Claim | null) => void;
  addClaim: (claim: Claim) => void;
  setClaimProcessing: (isProcessing: boolean) => void;
  
  // Weather actions
  setWeatherAlert: (alert: WeatherAlert | null) => void;
  loadWeatherData: (zoneId: string) => Promise<void>;
  
  // Plan actions
  setSelectedPlan: (selectedPlan: Plan | null) => void;
  
  // Stats actions
  setStats: (stats: Stats | null) => void;
  
  // Auth actions
  login: (user: User) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  
  // Supabase actions
  signUp: (userData: any) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithPhone: (phone: string) => Promise<{ success: boolean; error?: string }>;
  createClaim: (claimData: any) => Promise<{ success: boolean; error?: string }>;
  loadUserClaims: () => Promise<void>;
  loadUserStats: () => Promise<void>;
  
  // Onboarding actions
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  
  // Reset action
  resetStore: () => void;
}

const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoggedIn: false,
      isFirstTime: true,
      isLoading: false,
      isClaimProcessing: false,
      error: null,
      claims: [],
      currentClaim: null,
      weatherAlert: mockWeatherAlert,
      selectedPlan: null,
      stats: mockStats,
      
      // Actions
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Claim actions
      setClaims: (claims) => set({ claims }),
      setCurrentClaim: (claim) => set({ currentClaim: claim }),
      addClaim: (claim) => set((state) => ({ claims: [claim, ...state.claims] })),
      setClaimProcessing: (isProcessing) => set({ isClaimProcessing: isProcessing }),
      
      // Weather actions
      setWeatherAlert: (alert) => set({ weatherAlert: alert }),
      loadWeatherData: async (zoneId: string) => {
        try {
          const weatherAlert = await weatherService.createWeatherAlert(zoneId);
          set({ weatherAlert });
        } catch (error) {
          console.error('Error loading weather data:', error);
        }
      },
      
      // Plan actions
      setSelectedPlan: (selectedPlan) => set({ selectedPlan }),
      
      // Stats actions
      setStats: (stats) => set({ stats }),
      
      // Auth actions
      login: (user) => set({ 
        user, 
        isLoggedIn: true,
        error: null 
      }),
      logout: async () => {
        set({ 
          user: null, 
          isLoggedIn: false,
          currentClaim: null,
          error: null 
        });
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
      },
      initializeAuth: async () => {
        try {
          set({ isLoading: true });
          const { user, isAuthenticated } = await authService.initializeAuth();
          
          if (user && isAuthenticated) {
            set({ 
              user, 
              isLoggedIn: true, 
              isFirstTime: false,
              isLoading: false 
            });
          } else {
            set({ 
              user: null, 
              isLoggedIn: true, // Allow app usage without auth for demo
              isFirstTime: true,
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ 
            isLoading: false,
            error: 'Failed to initialize authentication'
          });
        }
      },
      
      // Supabase actions
      signUp: async (userData: any) => {
        try {
          set({ isLoading: true, error: null });
          
          const { success, error, data } = await authService.signup(userData);
          
          if (success && data) {
            set({ 
              user: data.user, 
              isLoggedIn: true, 
              isFirstTime: false,
              isLoading: false 
            });
            return { success: true };
          }
          
          set({ error: error || 'Signup failed', isLoading: false });
          return { success: false, error: error || 'Signup failed' };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Signup failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
      
      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Mock login for UI demo
          setTimeout(() => {
            set({ isLoggedIn: true, isLoading: false });
          }, 500);
          
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
      
      signInWithPhone: async (phone: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // For development, just return success
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Phone sign-in failed';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
      
      createClaim: async (claimData: any) => {
        try {
          set({ isClaimProcessing: true, error: null });
          
          // Pull user from the real auth store
          const user = useUserStore.getState().user || get().user;
          if (!user) {
            set({ error: 'User not authenticated' });
            return { success: false, error: 'User not authenticated' };
          }
          
          try {
            const claim = await SupabaseService.createClaim({
              user_id: user.id,
              disruption_type: claimData.type,
              zone: claimData.zone,
              amount: claimData.amount,
              hours_affected: 4,
            });
            
            set((state) => ({ 
              claims: [claim as any, ...state.claims],
              isClaimProcessing: false 
            }));
            
            return { success: true };
          } catch(err: any) {
            set({ error: err.message, isClaimProcessing: false });
            return { success: false, error: err.message };
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Claim creation failed';
          set({ error: errorMessage, isClaimProcessing: false });
          return { success: false, error: errorMessage };
        }
      },
      
      loadUserClaims: async () => {
        try {
          // Pull user ID from the real auth store (useUserStore)
          const userId = useUserStore.getState().user?.id || get().user?.id;
          if (!userId) return;
          
          const claims = await SupabaseService.getUserClaims(userId);
          set({ claims: (claims as any) || [] });
        } catch (error) {
          console.error('Error loading user claims:', error);
        }
      },

      loadUserStats: async () => {
        try {
          const userId = useUserStore.getState().user?.id || get().user?.id;
          if (!userId) return;
          
          const statsData = await SupabaseService.getUserStats(userId);
          if (statsData) {
            set((state) => ({
              stats: {
                ...(state.stats || mockStats),
                completedClaims: parseInt(statsData.completed_claims) || 0,
                activeClaims: parseInt(statsData.processing_claims) || 0,
                netBenefit: parseInt(statsData.total_payout) || 0,
                totalClaims: parseInt(statsData.total_claims) || 0,
              } as any
            }));
          }
        } catch (error) {
          console.error('Error loading user stats:', error);
        }
      },
      
      // Onboarding actions
      completeOnboarding: () => set({ isFirstTime: false }),
      resetOnboarding: () => set({ isFirstTime: true }),
      
      // Reset action
      resetStore: () => {
        set({
          user: null,
          isLoggedIn: false,
          isFirstTime: true,
          isLoading: false,
          isClaimProcessing: false,
          error: null,
          claims: [],
          currentClaim: null,
          weatherAlert: mockWeatherAlert,
          selectedPlan: null,
          stats: mockStats,
        });
      },
    }),
    {
      name: 'gigshield-store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        isFirstTime: state.isFirstTime,
        claims: state.claims,
        selectedPlan: state.selectedPlan,
      }),
    }
  )
);

// Selectors for easier access
export const useUser = () => useAppStore((state) => state.user);
export const useIsLoggedIn = () => useAppStore((state) => state.isLoggedIn);
export const useIsFirstTime = () => useAppStore((state) => state.isFirstTime);
export const useClaims = () => useAppStore((state) => state.claims);
export const useCurrentClaim = () => useAppStore((state) => state.currentClaim);
export const useWeatherAlert = () => useAppStore((state) => state.weatherAlert);
export const useStats = () => useAppStore((state) => state.stats);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);

export default useAppStore;
