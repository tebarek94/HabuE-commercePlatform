import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart, useCartActions } from '@/store/cartStore';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { formatCurrency } from '@/lib/utils';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, isLoading } = useCart();
  const { loadCart, clearCart } = useCartActions();

  // Load cart when component mounts
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" onClick={() => navigate('/products')}>
                Continue Shopping
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}

            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
              >
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartSummary
              onCheckout={handleCheckout}
              className="sticky top-8"
              showClearButton={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
