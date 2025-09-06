/**
 * Utility functions for authentication token management
 */

/**
 * Get the authentication token from localStorage
 * This matches the same storage key used by Zustand persist
 */
export const getAuthToken = (): string | null => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
  } catch (error) {
    console.error('Error parsing auth storage:', error);
  }
  return null;
};

/**
 * Get the user data from localStorage
 * This matches the same storage key used by Zustand persist
 */
export const getAuthUser = (): any | null => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.user || null;
    }
  } catch (error) {
    console.error('Error parsing auth storage:', error);
  }
  return null;
};

/**
 * Check if user is authenticated
 */
export const isUserAuthenticated = (): boolean => {
  const token = getAuthToken();
  const user = getAuthUser();
  return !!(token && user);
};

/**
 * Check if user has admin role
 */
export const isUserAdmin = (): boolean => {
  const user = getAuthUser();
  return user?.role === 'admin';
};
