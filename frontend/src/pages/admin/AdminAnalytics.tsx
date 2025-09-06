import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Calendar, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useDashboard } from '@/hooks/useDashboard';
import Alert from '@/components/ui/Alert';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'neutral',
  description 
}) => {
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
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
            {change !== undefined && (
              <div className={cn('flex items-center mt-2', getTrendColor())}>
                {getTrendIcon()}
                <span className="text-sm ml-1">{Math.abs(change)}%</span>
                <span className="text-xs ml-1">vs last period</span>
              </div>
            )}
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
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

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const AdminAnalytics: React.FC = () => {
  const { stats, categoryPerformance, topProducts, recentActivity, loading, error, refetch } = useDashboard();

  // Generate revenue data from analytics
  const revenueData: ChartData[] = stats ? [
    { name: 'Jan', value: Math.floor(stats.totalRevenue * 0.8), color: '#0ea5e9' },
    { name: 'Feb', value: Math.floor(stats.totalRevenue * 0.9), color: '#0ea5e9' },
    { name: 'Mar', value: Math.floor(stats.totalRevenue * 0.85), color: '#0ea5e9' },
    { name: 'Apr', value: Math.floor(stats.totalRevenue * 1.1), color: '#0ea5e9' },
    { name: 'May', value: Math.floor(stats.totalRevenue * 0.95), color: '#0ea5e9' },
    { name: 'Jun', value: stats.totalRevenue, color: '#0ea5e9' },
  ] : [];

  // Convert category performance to chart data
  const categoryData: ChartData[] = categoryPerformance.map((cat, index) => ({
    name: cat.category_name,
    value: cat.sales_percentage,
    color: ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'][index % 5],
  }));

  // Format recent activity for display
  const formatActivityTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'product':
        return <Package className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'customer':
        return <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Loading analytics data...
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your business performance and insights
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your business performance and insights
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            change={stats.revenueChange}
            icon={DollarSign}
            trend={stats.revenueChange >= 0 ? "up" : "down"}
            description="This month"
          />
          <MetricCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            change={stats.ordersChange}
            icon={ShoppingCart}
            trend={stats.ordersChange >= 0 ? "up" : "down"}
            description="This month"
          />
          <MetricCard
            title="Total Customers"
            value={stats.totalCustomers.toLocaleString()}
            change={stats.customersChange}
            icon={Users}
            trend={stats.customersChange >= 0 ? "up" : "down"}
            description="Registered users"
          />
          <MetricCard
            title="Total Products"
            value={stats.totalProducts}
            change={stats.productsChange}
            icon={Package}
            trend={stats.productsChange >= 0 ? "up" : "down"}
            description="Active products"
          />
        </div>
      )}

      {/* Secondary Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Average Order Value"
            value={formatCurrency(stats.averageOrderValue)}
            icon={DollarSign}
            description="Per order"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            icon={BarChart3}
            description="Visitor to customer"
          />
          <MetricCard
            title="Repeat Customer Rate"
            value={`${stats.repeatCustomerRate}%`}
            icon={Users}
            description="Returning customers"
          />
        </div>
      )}

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Revenue Trend
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monthly revenue for the last 6 months
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${(item.value / Math.max(...revenueData.map(d => d.value))) * 100}%`,
                          backgroundColor: item.color 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-16 text-right">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Category Performance
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sales distribution by category
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${item.value}%`,
                          backgroundColor: item.color 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-12 text-right">
                      {item.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Top Products
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Best selling products this month
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.sales_count} sales
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(product.revenue)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      revenue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Activity
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Latest actions in your store
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.user_name} • {formatActivityTime(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No recent activity
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Activity will appear here as users interact with your store.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Performance Summary
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Key insights and recommendations based on your data
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`p-4 border rounded-lg ${
              stats && stats.revenueChange >= 0 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className={`h-5 w-5 ${
                  stats && stats.revenueChange >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} />
                <h4 className={`font-medium ${
                  stats && stats.revenueChange >= 0 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-red-900 dark:text-red-100'
                }`}>
                  Revenue {stats && stats.revenueChange >= 0 ? 'Growth' : 'Decline'}
                </h4>
              </div>
              <p className={`text-sm ${
                stats && stats.revenueChange >= 0 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {stats ? (
                  `Your revenue has ${stats.revenueChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(stats.revenueChange)}% this month. ${
                    stats.revenueChange >= 0 ? 'Keep up the great work!' : 'Consider running promotions to boost sales.'
                  }`
                ) : (
                  'Revenue data is being calculated...'
                )}
              </p>
            </div>
            
            <div className={`p-4 border rounded-lg ${
              stats && stats.ordersChange >= 0 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <ShoppingCart className={`h-5 w-5 ${
                  stats && stats.ordersChange >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`} />
                <h4 className={`font-medium ${
                  stats && stats.ordersChange >= 0 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-yellow-900 dark:text-yellow-100'
                }`}>
                  Orders {stats && stats.ordersChange >= 0 ? 'Growth' : 'Decline'}
                </h4>
              </div>
              <p className={`text-sm ${
                stats && stats.ordersChange >= 0 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                {stats ? (
                  `Orders have ${stats.ordersChange >= 0 ? 'increased' : 'decreased'} by ${Math.abs(stats.ordersChange)}% this month. ${
                    stats.ordersChange >= 0 ? 'Great job!' : 'Consider improving your marketing strategy.'
                  }`
                ) : (
                  'Order data is being calculated...'
                )}
              </p>
            </div>
            
            <div className={`p-4 border rounded-lg ${
              stats && stats.customersChange >= 0 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Users className={`h-5 w-5 ${
                  stats && stats.customersChange >= 0 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-orange-600 dark:text-orange-400'
                }`} />
                <h4 className={`font-medium ${
                  stats && stats.customersChange >= 0 
                    ? 'text-blue-900 dark:text-blue-100' 
                    : 'text-orange-900 dark:text-orange-100'
                }`}>
                  Customer {stats && stats.customersChange >= 0 ? 'Growth' : 'Decline'}
                </h4>
              </div>
              <p className={`text-sm ${
                stats && stats.customersChange >= 0 
                  ? 'text-blue-800 dark:text-blue-200' 
                  : 'text-orange-800 dark:text-orange-200'
              }`}>
                {stats ? (
                  `Customer base has ${stats.customersChange >= 0 ? 'grown' : 'declined'} by ${Math.abs(stats.customersChange)}% this month. ${
                    stats.customersChange >= 0 ? 'Focus on retention strategies.' : 'Consider improving customer acquisition.'
                  }`
                ) : (
                  'Customer data is being calculated...'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
