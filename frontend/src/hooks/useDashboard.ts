import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  customersChange: number;
  averageOrderValue: number;
  conversionRate: number;
  repeatCustomerRate: number;
}

export interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface TopProduct {
  id: number;
  name: string;
  category_name: string;
  stock_quantity: number;
  sales_count: number;
  revenue: number;
}

export interface CategoryPerformance {
  category_id: number;
  category_name: string;
  sales_percentage: number;
  revenue: number;
}

export interface RecentActivity {
  id: number;
  action: string;
  user_name: string;
  created_at: string;
  type: 'order' | 'product' | 'customer' | 'system';
}

interface UseDashboardReturn {
  stats: DashboardStats | null;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  categoryPerformance: CategoryPerformance[];
  recentActivity: RecentActivity[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [
        statsData,
        ordersData,
        productsData,
        categoriesData,
        activityData
      ] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getRecentOrders(5),
        adminApi.getTopProducts(5),
        adminApi.getCategoryPerformance(),
        adminApi.getRecentActivity(10)
      ]);

      setStats(statsData);
      setRecentOrders(ordersData || []);
      setTopProducts(productsData || []);
      setCategoryPerformance(categoriesData || []);
      setRecentActivity(activityData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      setStats(null);
      setRecentOrders([]);
      setTopProducts([]);
      setCategoryPerformance([]);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    recentOrders,
    topProducts,
    categoryPerformance,
    recentActivity,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};
