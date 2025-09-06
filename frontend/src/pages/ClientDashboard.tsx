import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useCart } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';

const ClientDashboard: React.FC = () => {
  const { totalItems, totalPrice } = useCart();
  const { user } = useAuthStore();

  const stats = [
    {
      name: 'Cart Items',
      value: totalItems,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      name: 'Cart Total',
      value: formatCurrency(totalPrice),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
  ];

  const quickActions = [
    {
      name: 'Browse Products',
      description: 'Explore our collection of beautiful flowers',
      href: '/products',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      name: 'View Cart',
      description: 'Review items in your shopping cart',
      href: '/cart',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      name: 'My Orders',
      description: 'Track your recent orders',
      href: '/orders',
      icon: ShoppingBag,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-primary-100">
          Discover beautiful flowers and create stunning arrangements for any occasion.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.name} to={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${action.bgColor}`}>
                      <action.icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {action.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Activity
        </h2>
        <Card>
          <CardHeader>
            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
              Your Shopping Journey
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Cart Updated
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You have {totalItems} items in your cart
                  </p>
                </div>
              </div>
              
              {totalItems === 0 && (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Start Shopping
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Browse our beautiful collection of flowers
                  </p>
                  <Link
                    to="/products"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Browse Products
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
