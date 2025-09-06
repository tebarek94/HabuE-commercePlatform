import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook to initialize authentication state when the app starts
 * This ensures the auth state is properly restored from localStorage
 */
export const useAuthInitialization = () => {
  const { token, user, isAuthenticated, isLoading, setLoading } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (!initialized.current) {
      initialized.current = true;
      
      // Force loading to false on app startup
      setLoading(false);
      
      console.log('Auth initialization:', {
        token: token ? 'exists' : 'none',
        user: user ? `${user.first_name} ${user.last_name}` : 'none',
        isAuthenticated,
        isLoading
      });
    }
  }, [setLoading, token, user, isAuthenticated, isLoading]);

  useEffect(() => {
    // Check if we have a valid token and user data
    if (token && user && isAuthenticated) {
      console.log('Auth state restored:', { user: user.email, isAuthenticated });
    } else if (token && !user && !isLoading) {
      // Only clear auth state if we're not in a loading state and have a token but no user
      // This prevents clearing auth state during the authentication process
      console.warn('Token exists but no user data, clearing auth state');
      useAuthStore.getState().logout();
    }
  }, [token, user, isAuthenticated, isLoading]);
};
