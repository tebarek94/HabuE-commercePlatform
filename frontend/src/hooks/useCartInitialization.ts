import { useEffect } from 'react';
import { useCartActions } from '@/store/cartStore';
import { useAuth } from '@/store/authStore';

/**
 * Hook to initialize cart data when the app starts
 * This ensures cart data is loaded when user is authenticated or guest cart is loaded
 */
export const useCartInitialization = () => {
  const { loadCart, loadGuestCart } = useCartActions();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('useCartInitialization: isAuthenticated =', isAuthenticated);
    if (isAuthenticated) {
      // Load authenticated user's cart
      console.log('useCartInitialization: Loading authenticated user cart');
      loadCart();
    } else {
      // Load guest cart from localStorage
      console.log('useCartInitialization: Loading guest cart');
      loadGuestCart();
    }
  }, [isAuthenticated, loadCart, loadGuestCart]);

  // Also load appropriate cart on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      loadGuestCart();
    }
  }, [loadCart, loadGuestCart, isAuthenticated]);
};
