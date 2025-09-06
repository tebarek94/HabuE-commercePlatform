import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/types';
import { useCartActions } from '@/store/cartStore';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CartItemProps {
  item: CartItem;
  className?: string;
}

const CartItemComponent: React.FC<CartItemProps> = ({ item, className }) => {
  const { updateCartItem, removeFromCart } = useCartActions();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(item.id);
    } else {
      await updateCartItem(item.id, newQuantity);
    }
  };

  const handleRemove = async () => {
    await removeFromCart(item.id);
  };

  if (!item.product) {
    return null;
  }

  const { product } = item;
  const itemTotal = product.price * item.quantity;

  return (
    <div className={cn('flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg', className)}>
      {/* Product Image */}
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-xs">No Image</div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatCurrency(product.price)} each
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Stock: {product.stock_quantity}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="px-3 py-1 text-sm font-medium min-w-[3rem] text-center border border-gray-300 dark:border-gray-600 rounded">
          {item.quantity}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={item.quantity >= product.stock_quantity}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Item Total */}
      <div className="text-right">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {formatCurrency(itemTotal)}
        </p>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CartItemComponent;
