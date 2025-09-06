import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/store/cartStore';
import { useAuth } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface CartIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

const CartIcon: React.FC<CartIconProps> = ({ 
  className, 
  size = 'md', 
  showBadge = true 
}) => {
  const { totalItems, guestTotalItems, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  
  // Use guest cart items if user is not authenticated
  const displayTotalItems = totalItems > 0 ? totalItems : guestTotalItems;
  
  // Determine redirect destination based on authentication status
  const redirectTo = isAuthenticated ? '/dashboard' : '/login';

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const badgeSizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-xs',
    lg: 'h-6 w-6 text-sm'
  };

  return (
    <Link
      to={redirectTo}
      className={cn(
        'relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-all duration-200 hover:scale-105 group',
        className
      )}
    >
      <ShoppingCart 
        className={cn(
          sizeClasses[size],
          'transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400',
          isLoading && 'animate-pulse'
        )} 
      />
      {showBadge && displayTotalItems > 0 && (
        <span className={cn(
          'absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg transition-all duration-300 ease-in-out',
          badgeSizeClasses[size],
          'animate-cart-pulse hover:animate-bounce'
        )}>
          {displayTotalItems > 99 ? '99+' : displayTotalItems}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
