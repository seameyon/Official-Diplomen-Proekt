import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types';
import { authApi } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),

      login: async (email, password) => {
        const { user, token } = await authApi.login({ email, password });
        set({ user, token, isAuthenticated: true });
      },

      register: async (email, password, username) => {
        const { user, token } = await authApi.register({ email, password, username });
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage');
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const { user } = await authApi.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          
          const status = error?.response?.status;
          if (status === 429 || status === 503 || !error?.response) {
            console.warn('Temporary error during auth check, keeping session');
            set({ isLoading: false });
            return;
          }
          
          
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          localStorage.removeItem('auth-storage');
        }
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
