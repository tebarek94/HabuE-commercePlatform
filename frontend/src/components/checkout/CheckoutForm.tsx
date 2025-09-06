import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutFormData } from '@/schemas';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CreditCard, Truck, Wallet } from 'lucide-react';

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  loading?: boolean;
  className?: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSubmit,
  loading = false,
  className,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      payment_method: 'credit_card',
    },
  });

  const paymentMethod = watch('payment_method');

  return (
    <Card className={cn('max-w-2xl mx-auto', className)}>
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Checkout
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Complete your order by providing the required information.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  errors.firstName && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="Enter your first name"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  errors.lastName && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="Enter your last name"
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  errors.email && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="Enter your email address"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  errors.phone && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="Enter your phone number"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Shipping Address *
            </label>
            <textarea
              id="shipping_address"
              rows={3}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                errors.shipping_address && 'border-red-500 focus:ring-red-500'
              )}
              placeholder="Enter your complete shipping address..."
              {...register('shipping_address')}
            />
            {errors.shipping_address && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.shipping_address.message}
              </p>
            )}
          </div>

          {/* Billing Address */}
          <div>
            <label htmlFor="billing_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Billing Address
            </label>
            <textarea
              id="billing_address"
              rows={3}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                errors.billing_address && 'border-red-500 focus:ring-red-500'
              )}
              placeholder="Enter your billing address (optional)..."
              {...register('billing_address')}
            />
            {errors.billing_address && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.billing_address.message}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Payment Method *
            </label>
            <div className="space-y-3">
              {[
                { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
                { value: 'debit_card', label: 'Debit Card', icon: CreditCard },
                { value: 'paypal', label: 'PayPal', icon: Wallet },
                { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: Truck },
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <label
                    key={method.value}
                    className={cn(
                      'flex items-center p-4 border rounded-lg cursor-pointer transition-colors',
                      paymentMethod === method.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    )}
                  >
                    <input
                      type="radio"
                      value={method.value}
                      className="sr-only"
                      {...register('payment_method')}
                    />
                    <Icon className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {method.label}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.payment_method && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.payment_method.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order Notes
            </label>
            <textarea
              id="notes"
              rows={2}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                errors.notes && 'border-red-500 focus:ring-red-500'
              )}
              placeholder="Any special instructions or notes for your order..."
              {...register('notes')}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Processing Order...' : 'Place Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;
