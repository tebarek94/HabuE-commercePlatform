import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '@/types';
import { useCartActions } from '@/store/cartStore';
import { useAuth } from '@/store/authStore';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AddToCartButtonProps {
  product: Product;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showQuantity?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  variant = 'default',
  size = 'md',
  className,
  showQuantity = false,
}) => {
  const { addToCart } = useCartActions();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (product.stock_quantity <= 0) {
      return;
    }

    if (!isAuthenticated) {
      // Store the intended action in localStorage for after login
      localStorage.setItem('pendingCartAction', JSON.stringify({
        productId: product.id,
        quantity: quantity,
        timestamp: Date.now()
      }));
      
      // Show notification and redirect to login
      toast.error('Please login to add items to your cart');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      await addToCart(product, quantity);
      setQuantity(1); // Reset quantity after adding
    } catch (error) {
      // Error is handled by the store
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock_quantity) {
      setQuantity(newQuantity);
    }
  };

  const isOutOfStock = product.stock_quantity <= 0;

  if (showQuantity) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || isLoading}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="px-3 py-1 text-sm font-medium min-w-[3rem] text-center">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= product.stock_quantity || isLoading}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isLoading}
          loading={isLoading}
          variant={variant}
          size={size}
          className="flex-1"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isOutOfStock || isLoading}
      loading={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
    </Button>
  );
};

export default AddToCartButton;
