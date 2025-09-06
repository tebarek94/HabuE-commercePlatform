import { User } from '@/types';

/**
 * Get the appropriate redirect path based on user role
 * @param user - The user object
 * @returns The redirect path
 */
export const getRedirectPath = (user: User | null): string => {
  if (!user) {
    return '/login';
  }

  switch (user.role) {
    case 'admin':
      return '/admin/dashboard';
    case 'client':
    default:
      return '/dashboard';
  }
};

/**
 * Redirect user after authentication based on their role
 * @param user - The user object
 * @param navigate - React Router navigate function
 */
export const redirectAfterAuth = (user: User | null, navigate: (path: string) => void): void => {
  const redirectPath = getRedirectPath(user);
  navigate(redirectPath);
};
