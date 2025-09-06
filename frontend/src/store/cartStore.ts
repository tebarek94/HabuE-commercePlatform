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
}

interface CartActions {
  addToCart: (product: Product, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  setLoading: (loading: boolean) => void;
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

      // Actions
      addToCart: async (product: Product, quantity: number) => {
        set({ isLoading: true });
        try {
          await cartApi.addToCart(product.id, quantity);
          await get().loadCart();
          toast.success(`${product.name} added to cart!`);
        } catch (error: any) {
          set({ isLoading: false });
          // Don't show error toast for 401 errors (handled by interceptor)
          if (error.response?.status !== 401) {
            const message = error instanceof Error ? error.message : 'Failed to add to cart';
            toast.error(message);
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
          }
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
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
}));

export const useCartActions = () => useCartStore((state) => ({
  addToCart: state.addToCart,
  updateCartItem: state.updateCartItem,
  removeFromCart: state.removeFromCart,
  clearCart: state.clearCart,
  loadCart: state.loadCart,
}));
