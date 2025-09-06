import { User } from '@/types';

/**
 * Check if the current user has admin role
 * @param user - The user object
 * @returns True if user is admin, false otherwise
 */
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

/**
 * Check if the current user has client role
 * @param user - The user object
 * @returns True if user is client, false otherwise
 */
export const isClient = (user: User | null): boolean => {
  return user?.role === 'client';
};

/**
 * Check if the current user is authenticated
 * @param user - The user object
 * @returns True if user is authenticated, false otherwise
 */
export const isAuthenticated = (user: User | null): boolean => {
  // More permissive: if is_active is undefined/null, assume true
  return user !== null && (user.is_active === true || user.is_active === undefined);
};

/**
 * Get user display name
 * @param user - The user object
 * @returns Full name or email if name is not available
 */
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return 'Guest';
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  
  return user.email;
};

/**
 * Check if user can access admin features
 * @param user - The user object
 * @returns True if user can access admin features
 */
export const canAccessAdmin = (user: User | null): boolean => {
  return isAuthenticated(user) && isAdmin(user);
};

/**
 * Check if user can perform admin actions
 * @param user - The user object
 * @returns True if user can perform admin actions
 */
export const canPerformAdminActions = (user: User | null): boolean => {
  if (!user) return false;
  
  // Check if user is admin and active
  const isAdminUser = user.role === 'admin';
  // More permissive: if is_active is undefined/null, assume true for admin users
  const isActiveUser = user.is_active === true || (user.is_active === undefined && isAdminUser);
  
  return isAdminUser && isActiveUser;
};

/**
 * Get role-based navigation items
 * @param user - The user object
 * @returns Array of navigation items based on user role
 */
export const getRoleBasedNavItems = (user: User | null) => {
  const baseItems = [
    { name: 'Home', href: '/', icon: 'home' },
    { name: 'Products', href: '/products', icon: 'package' },
  ];

  if (isClient(user)) {
    return [
      ...baseItems,
      { name: 'Cart', href: '/cart', icon: 'shopping-cart' },
      { name: 'Orders', href: '/orders', icon: 'shopping-bag' },
      { name: 'Profile', href: '/profile', icon: 'user' },
    ];
  }

  if (isAdmin(user)) {
    return [
      ...baseItems,
      { name: 'Dashboard', href: '/admin/dashboard', icon: 'bar-chart' },
      { name: 'Products', href: '/admin/products', icon: 'package' },
      { name: 'Orders', href: '/admin/orders', icon: 'shopping-bag' },
      { name: 'Categories', href: '/admin/categories', icon: 'folder' },
      { name: 'Customers', href: '/admin/customers', icon: 'users' },
      { name: 'Analytics', href: '/admin/analytics', icon: 'trending-up' },
    ];
  }

  return baseItems;
};

/**
 * Check if a route requires admin access
 * @param pathname - The current pathname
 * @returns True if route requires admin access
 */
export const requiresAdminAccess = (pathname: string): boolean => {
  return pathname.startsWith('/admin');
};

/**
 * Check if user can access a specific route
 * @param user - The user object
 * @param pathname - The current pathname
 * @returns True if user can access the route
 */
export const canAccessRoute = (user: User | null, pathname: string): boolean => {
  if (requiresAdminAccess(pathname)) {
    return canAccessAdmin(user);
  }
  
  return isAuthenticated(user);
};
