import { create } from 'zustand';
import { UserProfile } from '@/services/supabaseService';
import { Session } from '@supabase/supabase-js';

interface UserState {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  setUser: (data: { user: UserProfile | null; session?: Session | null; isAuthenticated?: boolean }) => void;
  setSession: (session: Session | null) => void;
  toggleDemoMode: () => void;
  clear: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isDemoMode: false,
  setUser: (data) => set((state) => ({
    user: data.user,
    session: data.session !== undefined ? data.session : state.session,
    isAuthenticated: data.isAuthenticated !== undefined ? data.isAuthenticated : !!data.user,
  })),
  setSession: (session) => set({ session, isAuthenticated: !!session }),
  toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
  clear: () => set({ user: null, session: null, isAuthenticated: false, isDemoMode: false }),
}));

// Backwards compatibility layer for legacy code still using UserStore directly
export const UserStore = {
  setUser(user: UserProfile) {
    useUserStore.getState().setUser({ user, isAuthenticated: true });
  },
  getUser(): UserProfile | null {
    return useUserStore.getState().user;
  },
  getUserId(): string | null {
    return useUserStore.getState().user?.id || null;
  },
  clear() {
    useUserStore.getState().clear();
  },
  isLoggedIn(): boolean {
    return useUserStore.getState().isAuthenticated;
  },
};

export default UserStore;
