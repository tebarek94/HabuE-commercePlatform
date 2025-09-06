import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { useCart, useCartActions } from '@/store/cartStore';
import { useAuthActions } from '@/store/authStore';
import { CheckoutFormData } from '@/schemas';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { formatCurrency } from '@/lib/utils';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice } = useCart();
  const { clearCart } = useCartActions();
  const { createOrder } = useAuthActions();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const shippingCost = totalPrice >= 50 ? 0 : 9.99;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shippingCost + tax;

  const handleCheckout = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    
    try {
      // Create order with checkout data
      const orderData = {
        ...data,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: 0 // Will be fetched from product data
        }))
      };
      
      await createOrder(orderData);
      
      // Clear cart and show success
      clearCart();
      setOrderComplete(true);
      
      // Redirect to orders page after 3 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
      
    } catch (error) {
      // Error handled by store
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Add some items to your cart before checking out.
          </p>
          <Button variant="primary" onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Order Placed Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Thank you for your order. You will receive a confirmation email shortly.
          </p>
          <div className="space-y-3">
            <Button variant="primary" onClick={() => navigate('/orders')}>
              View Orders
            </Button>
            <Button variant="outline" onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
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
          <Button
            variant="ghost"
            onClick={() => navigate('/cart')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your order by providing the required information below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm
              onSubmit={handleCheckout}
              loading={isProcessing}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Order Summary
                </h3>
              </CardHeader>
              
              <CardContent>
                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-lg">🌸</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          Product #{item.product_id}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(0)} {/* Price will be fetched from product data */}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="text-gray-900 dark:text-gray-100">
                      {formatCurrency(tax)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900 dark:text-gray-100">Total</span>
                      <span className="text-primary-600 dark:text-primary-400">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Free Shipping Notice */}
                {totalPrice >= 50 && (
                  <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      🎉 You qualify for free shipping!
                    </p>
                  </div>
                )}

                {/* Security Features */}
                <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    <span>Secure payment processing</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Truck className="h-4 w-4 text-green-500" />
                    <span>Fast delivery</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>30-day return policy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
