import React from 'react';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { useDashboard } from '@/hooks/useDashboard';
import Alert from '@/components/ui/Alert';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, trend = 'neutral' }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            {change !== undefined && (
              <div className={cn('flex items-center mt-1', getTrendColor())}>
                {getTrendIcon()}
                <span className="text-sm ml-1">{Math.abs(change)}%</span>
                <span className="text-xs ml-1">vs last month</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

interface TopProduct {
  id: number;
  name: string;
  category_name: string;
  stock_quantity: number;
  sales_count: number;
  revenue: number;
}

const AdminDashboard: React.FC = () => {
  const { stats, recentOrders, topProducts, loading, error, refetch } = useDashboard();

  const getStatusColor = (status: RecentOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard data...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with your flower shop today.
          </p>
        </div>
        <Alert variant="error" onClose={() => refetch()}>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your flower shop today.
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            change={stats.revenueChange}
            icon={DollarSign}
            trend={stats.revenueChange >= 0 ? "up" : "down"}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            change={stats.ordersChange}
            icon={ShoppingCart}
            trend={stats.ordersChange >= 0 ? "up" : "down"}
          />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            change={stats.productsChange}
            icon={Package}
            trend={stats.productsChange >= 0 ? "up" : "down"}
          />
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers.toLocaleString()}
            change={stats.customersChange}
            icon={Users}
            trend={stats.customersChange >= 0 ? "up" : "down"}
          />
        </div>
      )}

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recent Orders
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {order.order_number}
                      </p>
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        getStatusColor(order.status)
                      )}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.customer_name} • {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(order.total)}
                    </p>
                    <button className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                      <Eye className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Top Products
              </h3>
              <button className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.category_name} • Stock: {product.stock_quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {product.sales_count} sales
                    </p>
                    <button className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                      <Eye className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Quick Actions
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors">
              <Package className="h-6 w-6 text-primary-600 dark:text-primary-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Add New Product</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create a new flower product</p>
            </button>
            
            <button className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Process Orders</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Review pending orders</p>
            </button>
            
            <button className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="font-medium text-gray-900 dark:text-gray-100">Manage Customers</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">View customer accounts</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
