import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/store/cartStore';
import { cn } from '@/lib/utils';

interface CartIconProps {
  className?: string;
}

const CartIcon: React.FC<CartIconProps> = ({ className }) => {
  const { totalItems } = useCart();

  return (
    <Link
      to="/cart"
      className={cn(
        'relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors',
        className
      )}
    >
      <ShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
