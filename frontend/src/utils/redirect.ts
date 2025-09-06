import { User } from '@/types';

/**
 * Get the appropriate redirect path based on user role
 * @param user - The authenticated user object
 * @returns The redirect path for the user
 */
export const getRedirectPath = (user: User): string => {
  if (!user) {
    return '/';
  }

  switch (user.role) {
    case 'admin':
      return '/admin/dashboard';
    case 'client':
      return '/client/dashboard';
    default:
      return '/';
  }
};

/**
 * Get the appropriate redirect path based on user role (string)
 * @param role - The user's role as a string
 * @returns The redirect path for the user
 */
export const getRedirectPathByRole = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'client':
      return '/client/dashboard';
    default:
      return '/';
  }
};

/**
 * Check if a user should be redirected to admin or client dashboard
 * @param user - The authenticated user object
 * @returns Object with redirect information
 */
export const getDashboardRedirect = (user: User) => {
  const path = getRedirectPath(user);
  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'client';
  
  return {
    path,
    isAdmin,
    isClient,
    shouldRedirect: isAdmin || isClient
  };
};