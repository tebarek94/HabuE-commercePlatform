import { pool } from '../config/database';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

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
  created_at: Date;
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
  created_at: Date;
  type: 'order' | 'product' | 'customer' | 'system';
}

export class DashboardService {
  // Get dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const connection = await pool.getConnection();

      // Get current month stats
      const [currentStats] = await connection.execute(`
        SELECT 
          COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
          COUNT(DISTINCT o.id) as total_orders,
          (SELECT COUNT(*) FROM products WHERE is_active = 1) as total_products,
          (SELECT COUNT(*) FROM users WHERE is_active = 1 AND role = 'client') as total_customers,
          COALESCE(AVG(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE NULL END), 0) as avg_order_value
        FROM orders o
        WHERE o.created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
      `);

      // Get previous month stats for comparison
      const [previousStats] = await connection.execute(`
        SELECT 
          COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
          COUNT(DISTINCT o.id) as total_orders,
          (SELECT COUNT(*) FROM products WHERE is_active = 1) as total_products,
          (SELECT COUNT(*) FROM users WHERE is_active = 1 AND role = 'client') as total_customers
        FROM orders o
        WHERE o.created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
          AND o.created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
      `);

      // Get conversion and repeat customer rates
      const [conversionStats] = await connection.execute(`
        SELECT 
          COUNT(DISTINCT CASE WHEN o.user_id IS NOT NULL THEN u.id END) as customers_with_orders,
          COUNT(DISTINCT u.id) as total_customers,
          COUNT(DISTINCT CASE WHEN order_count > 1 THEN u.id END) as repeat_customers
        FROM users u
        LEFT JOIN (
          SELECT user_id, COUNT(*) as order_count
          FROM orders
          GROUP BY user_id
        ) o ON u.id = o.user_id
        WHERE u.role = 'client' AND u.is_active = 1
      `);

      connection.release();

      const current = (currentStats as any[])[0];
      const previous = (previousStats as any[])[0];
      const conversion = (conversionStats as any[])[0];

      // Calculate percentage changes
      const revenueChange = previous.total_revenue > 0 
        ? ((current.total_revenue - previous.total_revenue) / previous.total_revenue) * 100 
        : 0;
      
      const ordersChange = previous.total_orders > 0 
        ? ((current.total_orders - previous.total_orders) / previous.total_orders) * 100 
        : 0;
      
      const productsChange = previous.total_products > 0 
        ? ((current.total_products - previous.total_products) / previous.total_products) * 100 
        : 0;
      
      const customersChange = previous.total_customers > 0 
        ? ((current.total_customers - previous.total_customers) / previous.total_customers) * 100 
        : 0;

      const conversionRate = conversion.total_customers > 0 
        ? (conversion.customers_with_orders / conversion.total_customers) * 100 
        : 0;

      const repeatCustomerRate = conversion.customers_with_orders > 0 
        ? (conversion.repeat_customers / conversion.customers_with_orders) * 100 
        : 0;

      return {
        totalRevenue: current.total_revenue || 0,
        totalOrders: current.total_orders || 0,
        totalProducts: current.total_products || 0,
        totalCustomers: current.total_customers || 0,
        revenueChange: Math.round(revenueChange * 100) / 100,
        ordersChange: Math.round(ordersChange * 100) / 100,
        productsChange: Math.round(productsChange * 100) / 100,
        customersChange: Math.round(customersChange * 100) / 100,
        averageOrderValue: current.avg_order_value || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        repeatCustomerRate: Math.round(repeatCustomerRate * 100) / 100,
      };
    } catch (error) {
      logger.error('Get dashboard stats error:', error);
      throw new CustomError('Failed to get dashboard statistics', 500);
    }
  }

  // Get recent orders
  static async getRecentOrders(limit = 5): Promise<RecentOrder[]> {
    try {
      const connection = await pool.getConnection();
      const [orders] = await connection.execute(`
        SELECT 
          o.id,
          o.order_number,
          CONCAT(u.first_name, ' ', u.last_name) as customer_name,
          o.total_amount as total,
          o.status,
          o.created_at
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT ?
      `, [limit]);

      connection.release();
      return orders as RecentOrder[];
    } catch (error) {
      logger.error('Get recent orders error:', error);
      throw new CustomError('Failed to get recent orders', 500);
    }
  }

  // Get top products
  static async getTopProducts(limit = 5): Promise<TopProduct[]> {
    try {
      const connection = await pool.getConnection();
      const [products] = await connection.execute(`
        SELECT 
          p.id,
          p.name,
          c.name as category_name,
          p.stock_quantity,
          COALESCE(oi.sales_count, 0) as sales_count,
          COALESCE(oi.revenue, 0) as revenue
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN (
          SELECT 
            oi.product_id,
            SUM(oi.quantity) as sales_count,
            SUM(oi.quantity * oi.price) as revenue
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          WHERE o.payment_status = 'paid'
            AND o.created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
          GROUP BY oi.product_id
        ) oi ON p.id = oi.product_id
        WHERE p.is_active = 1
        ORDER BY sales_count DESC, revenue DESC
        LIMIT ?
      `, [limit]);

      connection.release();
      return products as TopProduct[];
    } catch (error) {
      logger.error('Get top products error:', error);
      throw new CustomError('Failed to get top products', 500);
    }
  }

  // Get category performance
  static async getCategoryPerformance(): Promise<CategoryPerformance[]> {
    try {
      const connection = await pool.getConnection();
      const [categories] = await connection.execute(`
        SELECT 
          c.id as category_id,
          c.name as category_name,
          COALESCE(oi.revenue, 0) as revenue,
          ROUND(
            CASE 
              WHEN total_revenue.total > 0 
              THEN (COALESCE(oi.revenue, 0) / total_revenue.total) * 100 
              ELSE 0 
            END, 2
          ) as sales_percentage
        FROM categories c
        LEFT JOIN (
          SELECT 
            p.category_id,
            SUM(oi.quantity * oi.price) as revenue
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          JOIN products p ON oi.product_id = p.id
          WHERE o.payment_status = 'paid'
            AND o.created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
          GROUP BY p.category_id
        ) oi ON c.id = oi.category_id
        CROSS JOIN (
          SELECT SUM(oi.quantity * oi.price) as total
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          WHERE o.payment_status = 'paid'
            AND o.created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
        ) total_revenue
        WHERE c.is_active = 1
        ORDER BY revenue DESC
      `);

      connection.release();
      return categories as CategoryPerformance[];
    } catch (error) {
      logger.error('Get category performance error:', error);
      throw new CustomError('Failed to get category performance', 500);
    }
  }

  // Get recent activity
  static async getRecentActivity(limit = 10): Promise<RecentActivity[]> {
    try {
      const connection = await pool.getConnection();
      
      // Get recent orders
      const [recentOrders] = await connection.execute(`
        SELECT 
          o.id,
          CONCAT('New order placed: ', o.order_number) as action,
          CONCAT(u.first_name, ' ', u.last_name) as user_name,
          o.created_at,
          'order' as type
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT ?
      `, [Math.floor(limit / 2)]);

      // Get recent product updates
      const [recentProducts] = await connection.execute(`
        SELECT 
          p.id,
          CONCAT('Product updated: ', p.name) as action,
          'Admin' as user_name,
          p.updated_at as created_at,
          'product' as type
        FROM products p
        WHERE p.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY p.updated_at DESC
        LIMIT ?
      `, [Math.floor(limit / 2)]);

      connection.release();

      // Combine and sort activities
      const activities = [
        ...(recentOrders as RecentActivity[]),
        ...(recentProducts as RecentActivity[])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, limit);

      return activities;
    } catch (error) {
      logger.error('Get recent activity error:', error);
      throw new CustomError('Failed to get recent activity', 500);
    }
  }

  // Get analytics data for charts
  static async getAnalyticsData(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    try {
      const connection = await pool.getConnection();
      
      let dateFormat: string;
      let interval: string;
      
      switch (period) {
        case 'day':
          dateFormat = '%Y-%m-%d %H:00:00';
          interval = 'HOUR';
          break;
        case 'week':
          dateFormat = '%Y-%m-%d';
          interval = 'DAY';
          break;
        case 'month':
          dateFormat = '%Y-%m-%d';
          interval = 'DAY';
          break;
        case 'year':
          dateFormat = '%Y-%m';
          interval = 'MONTH';
          break;
        default:
          dateFormat = '%Y-%m-%d';
          interval = 'DAY';
      }

      const [revenueData] = await connection.execute(`
        SELECT 
          DATE_FORMAT(o.created_at, ?) as period,
          SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END) as revenue,
          COUNT(o.id) as orders
        FROM orders o
        WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 1 ${interval})
        GROUP BY DATE_FORMAT(o.created_at, ?)
        ORDER BY period ASC
      `, [dateFormat, dateFormat]);

      connection.release();
      return revenueData;
    } catch (error) {
      logger.error('Get analytics data error:', error);
      throw new CustomError('Failed to get analytics data', 500);
    }
  }

  // Get all orders for admin with filters
  static async getAllOrders(filters: {
    page?: number;
    limit?: number;
    status?: string;
    payment_status?: string;
    date_from?: string;
    date_to?: string;
  }) {
    try {
      const connection = await pool.getConnection();
      
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      let whereConditions = [];
      let queryParams: any[] = [];

      if (filters.status) {
        whereConditions.push('o.status = ?');
        queryParams.push(filters.status);
      }

      if (filters.payment_status) {
        whereConditions.push('o.payment_status = ?');
        queryParams.push(filters.payment_status);
      }

      if (filters.date_from) {
        whereConditions.push('o.created_at >= ?');
        queryParams.push(filters.date_from);
      }

      if (filters.date_to) {
        whereConditions.push('o.created_at <= ?');
        queryParams.push(filters.date_to);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get orders with pagination
      const [orders] = await connection.execute(`
        SELECT 
          o.id,
          o.order_number,
          CONCAT(u.first_name, ' ', u.last_name) as customer_name,
          u.email as customer_email,
          o.total_amount,
          o.status,
          o.payment_status,
          o.payment_method,
          o.shipping_address,
          o.created_at,
          o.updated_at
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ${whereClause}
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
      `, [...queryParams, limit, offset]);

      // Get total count
      const [countResult] = await connection.execute(`
        SELECT COUNT(*) as total
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ${whereClause}
      `, queryParams);

      connection.release();

      const total = (countResult as any[])[0].total;
      const totalPages = Math.ceil(total / limit);

      return {
        orders: orders as any[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('Get all orders error:', error);
      throw new CustomError('Failed to get orders', 500);
    }
  }
}
