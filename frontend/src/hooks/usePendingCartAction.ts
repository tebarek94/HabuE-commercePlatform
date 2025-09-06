import { useEffect } from 'react';
import { useCartActions } from '@/store/cartStore';
import { useProducts } from '@/hooks/useProducts';
import toast from 'react-hot-toast';

interface PendingCartAction {
  productId: number;
  quantity: number;
  timestamp: number;
}

export const usePendingCartAction = () => {
  const { addToCart } = useCartActions();
  const { products } = useProducts();

  useEffect(() => {
    const handlePendingCartAction = async () => {
      const pendingActionStr = localStorage.getItem('pendingCartAction');
      if (!pendingActionStr) return;

      try {
        const pendingAction: PendingCartAction = JSON.parse(pendingActionStr);
        
        // Check if the action is not too old (within 1 hour)
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - pendingAction.timestamp > oneHour) {
          localStorage.removeItem('pendingCartAction');
          return;
        }

        // Find the product
        const product = products.find(p => p.id === pendingAction.productId);
        if (!product) {
          localStorage.removeItem('pendingCartAction');
          toast.error('Product no longer available');
          return;
        }

        // Add to cart
        await addToCart(product, pendingAction.quantity);
        
        // Clear the pending action
        localStorage.removeItem('pendingCartAction');
        
        // Show success message
        toast.success(`Added ${product.name} to your cart!`);
        
      } catch (error) {
        console.error('Error handling pending cart action:', error);
        localStorage.removeItem('pendingCartAction');
      }
    };

    // Only run if we have products loaded
    if (products.length > 0) {
      handlePendingCartAction();
    }
  }, [products, addToCart]);
};
