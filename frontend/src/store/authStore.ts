import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthResponse } from '@/types';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<User>;
  register: (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => void;
  updateProfile: (userData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  createOrder: (orderData: any) => Promise<void>;
  refreshAuthToken: () => Promise<void>;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        const loadingToast = toast.loading('Logging in...');
        try {
          const response = await authApi.login(email, password) as AuthResponse;
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.dismiss(loadingToast);
          toast.success('Login successful!');
          return response.user; // Return user data for redirect logic
        } catch (error: any) {
          set({ isLoading: false });
          toast.dismiss(loadingToast);
          let message = 'Login failed. Please try again.';

          if (error.response?.data?.message) {
            message = error.response.data.message;
          } else if (error.response?.status === 401) {
            message = 'Invalid email or password. Please check your credentials.';
          } else if (error.response?.status === 429) {
            message = 'Too many login attempts. Please wait a moment and try again.';
          } else if (error.response?.status >= 500) {
            message = 'Server error. Please try again later.';
          } else if (error.message) {
            message = error.message;
          }

          toast.error(message);
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        const loadingToast = toast.loading('Creating your account...');
        try {
          console.log('Attempting registration with data:', userData);
          const response = await authApi.register(userData) as AuthResponse;
          console.log('Registration successful:', response);
          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.dismiss(loadingToast);
          toast.success('Registration successful! Welcome!');
          return response.user; // Return user data for redirect logic
        } catch (error: any) {
          set({ isLoading: false });
          toast.dismiss(loadingToast);
          console.error('Registration error:', error);
          let message = 'Registration failed. Please try again.';
          
          if (error.response?.data?.message) {
            message = error.response.data.message;
          } else if (error.response?.status === 400) {
            message = 'Please check your information and try again.';
          } else if (error.response?.status === 409) {
            message = 'An account with this email already exists. Please use a different email or try logging in.';
          } else if (error.response?.status === 422) {
            message = 'Please fill in all required fields correctly.';
          } else if (error.response?.status >= 500) {
            message = 'Server error. Please try again later.';
          } else if (error.message) {
            message = error.message;
          }
          
          toast.error(message);
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        // Clear Zustand persist storage
        localStorage.removeItem('auth-storage');
        toast.success('Logged out successfully');
      },

      updateProfile: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authApi.updateProfile(userData) as { user: User };
          set({
            user: response.user,
            isLoading: false,
          });
          toast.success('Profile updated successfully!');
        } catch (error: any) {
          set({ isLoading: false });
          let message = 'Profile update failed. Please try again.';
          
          if (error.response?.data?.message) {
            message = error.response.data.message;
          } else if (error.response?.status === 400) {
            message = 'Please check your information and try again.';
          } else if (error.response?.status === 401) {
            message = 'Please log in again to update your profile.';
          } else if (error.response?.status >= 500) {
            message = 'Server error. Please try again later.';
          } else if (error.message) {
            message = error.message;
          }
          
          toast.error(message);
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true });
        try {
          await authApi.changePassword(currentPassword, newPassword);
          set({ isLoading: false });
          toast.success('Password changed successfully!');
        } catch (error: any) {
          set({ isLoading: false });
          let message = 'Password change failed. Please try again.';
          
          if (error.response?.data?.message) {
            message = error.response.data.message;
          } else if (error.response?.status === 400) {
            message = 'Current password is incorrect. Please try again.';
          } else if (error.response?.status === 401) {
            message = 'Please log in again to change your password.';
          } else if (error.response?.status >= 500) {
            message = 'Server error. Please try again later.';
          } else if (error.message) {
            message = error.message;
          }
          
          toast.error(message);
          throw error;
        }
      },

      createOrder: async (_orderData: any) => {
        set({ isLoading: true });
        try {
          // TODO: Implement order creation API call
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
          set({ isLoading: false });
          toast.success('Order created successfully!');
        } catch (error) {
          set({ isLoading: false });
          const message = error instanceof Error ? error.message : 'Order creation failed';
          toast.error(message);
          throw error;
        }
      },

      refreshAuthToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          const response = await authApi.refreshToken(refreshToken) as { token: string; refreshToken: string };
          set({
            token: response.token,
            refreshToken: response.refreshToken,
          });
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
}));

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  updateProfile: state.updateProfile,
  changePassword: state.changePassword,
  createOrder: state.createOrder,
  setUser: state.setUser,
  setLoading: state.setLoading,
}));
