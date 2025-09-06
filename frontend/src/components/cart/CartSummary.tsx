import React from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useCart, useCartActions } from '@/store/cartStore';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CartSummaryProps {
  onCheckout?: () => void;
  className?: string;
  showClearButton?: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  onCheckout,
  className,
  showClearButton = true,
}) => {
  const { items, totalItems, totalPrice, isLoading } = useCart();
  const { clearCart } = useCartActions();

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  if (items.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add some products to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Cart Summary
          </h3>
          {showClearButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCart}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items Count */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Items ({totalItems})
          </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Shipping</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {totalPrice >= 2500 ? 'Free' : formatCurrency(150)}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tax</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {formatCurrency(totalPrice * 0.08)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>

        {/* Total */}
        <div className="flex justify-between text-lg font-semibold">
          <span className="text-gray-900 dark:text-gray-100">Total</span>
          <span className="text-gray-900 dark:text-gray-100">
            {formatCurrency(totalPrice + (totalPrice >= 2500 ? 0 : 150) + (totalPrice * 0.08))}
          </span>
        </div>

        {/* Checkout Button */}
        {onCheckout && (
          <Button
            onClick={onCheckout}
            disabled={isLoading}
            loading={isLoading}
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Proceed to Checkout
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CartSummary;
