import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';
import { cartApi } from '@/lib/api';
import { calculateCartTotal } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  totalItems: number;
  totalPrice: number;
  guestItems: any[];
  guestTotalItems: number;
  guestTotalPrice: number;
}

interface CartActions {
  addToCart: (product: Product, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  addToGuestCart: (product: Product, quantity: number) => void;
  updateGuestCartItem: (productId: number, quantity: number) => void;
  removeFromGuestCart: (productId: number) => void;
  clearGuestCart: () => void;
  loadGuestCart: () => void;
  syncGuestCartToAuth: () => Promise<void>;
}

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isLoading: false,
      totalItems: 0,
      totalPrice: 0,
      guestItems: [],
      guestTotalItems: 0,
      guestTotalPrice: 0,

      // Actions
      addToCart: async (product: Product, quantity: number) => {
        set({ isLoading: true });
        try {
          await cartApi.addToCart(product.id, quantity);
          await get().loadCart();
          toast.success(`${product.name} added to cart!`, {
            duration: 3000,
            icon: '🛒',
          });
        } catch (error: any) {
          set({ isLoading: false });
          // Don't show error toast for 401 errors (handled by interceptor)
          if (error.response?.status !== 401) {
            const message = error instanceof Error ? error.message : 'Failed to add to cart';
            toast.error(message, {
              duration: 4000,
              icon: '❌',
            });
          }
          throw error;
        }
      },

      updateCartItem: async (itemId: number, quantity: number) => {
        set({ isLoading: true });
        try {
          await cartApi.updateCartItem(itemId, quantity);
          await get().loadCart();
          toast.success('Cart updated!');
        } catch (error: any) {
          set({ isLoading: false });
          if (error.response?.status !== 401) {
            const message = error instanceof Error ? error.message : 'Failed to update cart';
            toast.error(message);
          }
          throw error;
        }
      },

      removeFromCart: async (itemId: number) => {
        set({ isLoading: true });
        try {
          await cartApi.removeFromCart(itemId);
          await get().loadCart();
          toast.success('Item removed from cart!');
        } catch (error: any) {
          set({ isLoading: false });
          if (error.response?.status !== 401) {
            const message = error instanceof Error ? error.message : 'Failed to remove from cart';
            toast.error(message);
          }
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          await cartApi.clearCart();
          set({
            items: [],
            totalItems: 0,
            totalPrice: 0,
            isLoading: false,
          });
          toast.success('Cart cleared!');
        } catch (error: any) {
          set({ isLoading: false });
          if (error.response?.status !== 401) {
            const message = error instanceof Error ? error.message : 'Failed to clear cart';
            toast.error(message);
          }
          throw error;
        }
      },

      loadCart: async () => {
        set({ isLoading: true });
        try {
          const items: CartItem[] = await cartApi.getCart();
          const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = calculateCartTotal(
            items.map(item => ({
              price: item.product?.price || 0,
              quantity: item.quantity,
            }))
          );
          
          set({
            items,
            totalItems,
            totalPrice,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          // Only log error if it's not a 401 (unauthorized) error
          // 401 errors are handled by the API interceptor
          if (error.response?.status !== 401) {
            console.error('Failed to load cart:', error);
            // Reset cart state on error
            set({
              items: [],
              totalItems: 0,
              totalPrice: 0,
              isLoading: false,
            });
          }
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Guest Cart Actions
      addToGuestCart: (product: Product, quantity: number) => {
        const existingCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingItemIndex = existingCart.findIndex((item: any) => item.productId === product.id);
        
        if (existingItemIndex >= 0) {
          existingCart[existingItemIndex].quantity += quantity;
        } else {
          existingCart.push({
            productId: product.id,
            product: product,
            quantity: quantity,
            addedAt: new Date().toISOString()
          });
        }
        
        localStorage.setItem('guestCart', JSON.stringify(existingCart));
        get().loadGuestCart();
      },

      updateGuestCartItem: (productId: number, quantity: number) => {
        const existingCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const itemIndex = existingCart.findIndex((item: any) => item.productId === productId);
        
        if (itemIndex >= 0) {
          if (quantity <= 0) {
            existingCart.splice(itemIndex, 1);
          } else {
            existingCart[itemIndex].quantity = quantity;
          }
          localStorage.setItem('guestCart', JSON.stringify(existingCart));
          get().loadGuestCart();
        }
      },

      removeFromGuestCart: (productId: number) => {
        const existingCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const filteredCart = existingCart.filter((item: any) => item.productId !== productId);
        localStorage.setItem('guestCart', JSON.stringify(filteredCart));
        get().loadGuestCart();
      },

      clearGuestCart: () => {
        localStorage.removeItem('guestCart');
        set({
          guestItems: [],
          guestTotalItems: 0,
          guestTotalPrice: 0,
        });
      },

      loadGuestCart: () => {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const guestTotalItems = guestCart.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const guestTotalPrice = calculateCartTotal(
          guestCart.map((item: any) => ({
            price: item.product?.price || 0,
            quantity: item.quantity,
          }))
        );
        
        set({
          guestItems: guestCart,
          guestTotalItems,
          guestTotalPrice,
        });
      },

      syncGuestCartToAuth: async () => {
        const { guestItems } = get();
        if (guestItems.length === 0) return;

        set({ isLoading: true });
        try {
          // Add each guest item to the authenticated cart
          for (const item of guestItems) {
            await cartApi.addToCart(item.product.id, item.quantity);
          }

          // Clear guest cart after successful sync
          set({
            guestItems: [],
            guestTotalItems: 0,
            guestTotalPrice: 0,
            isLoading: false,
          });

          // Reload the authenticated cart
          await get().loadCart();

          toast.success('Cart synced successfully!');
        } catch (error: any) {
          set({ isLoading: false });
          const message = error instanceof Error ? error.message : 'Failed to sync cart';
          toast.error(message);
          throw error;
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
        guestItems: state.guestItems,
        guestTotalItems: state.guestTotalItems,
        guestTotalPrice: state.guestTotalPrice,
      }),
    }
  )
);

// Selectors
export const useCart = () => useCartStore((state) => ({
  items: state.items,
  totalItems: state.totalItems,
  totalPrice: state.totalPrice,
  isLoading: state.isLoading,
  guestItems: state.guestItems,
  guestTotalItems: state.guestTotalItems,
  guestTotalPrice: state.guestTotalPrice,
}));

export const useCartActions = () => useCartStore((state) => ({
  addToCart: state.addToCart,
  updateCartItem: state.updateCartItem,
  removeFromCart: state.removeFromCart,
  clearCart: state.clearCart,
  loadCart: state.loadCart,
  addToGuestCart: state.addToGuestCart,
  updateGuestCartItem: state.updateGuestCartItem,
  removeFromGuestCart: state.removeFromGuestCart,
  clearGuestCart: state.clearGuestCart,
  loadGuestCart: state.loadGuestCart,
  syncGuestCartToAuth: state.syncGuestCartToAuth,
}));
