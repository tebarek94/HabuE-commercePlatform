import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/schemas';
import { useAuthActions } from '@/store/authStore';
import { redirectAfterAuth } from '@/utils/redirect';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthActions();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Remove terms field before sending to API
      const { terms, confirmPassword, ...userData } = data;
      const user = await registerUser(userData);
      // Redirect based on user role
      redirectAfterAuth(user, navigate);
    } catch (error) {
      // Error is handled by the store and displayed via toast
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Sign in here
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Join FlowerShop
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create an account to start shopping for beautiful flowers
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    autoComplete="given-name"
                    className={cn(
                      'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                      errors.first_name && 'border-red-500 focus:ring-red-500'
                    )}
                    placeholder="Enter your first name"
                    {...register('first_name')}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    type="text"
                    autoComplete="family-name"
                    className={cn(
                      'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                      errors.last_name && 'border-red-500 focus:ring-red-500'
                    )}
                    placeholder="Enter your last name"
                    {...register('last_name')}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
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
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className={cn(
                    'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    errors.password && 'border-red-500 focus:ring-red-500'
                  )}
                  placeholder="Create a strong password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  className={cn(
                    'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    errors.confirm_password && 'border-red-500 focus:ring-red-500'
                  )}
                  placeholder="Confirm your password"
                  {...register('confirm_password')}
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  {...register('terms')}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.terms.message}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
