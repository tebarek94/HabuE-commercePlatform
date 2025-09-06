import { pool } from '../config/database';
import { Order, OrderWithItems, OrderItemWithProduct, UpdateOrderStatusRequest, OrderFilters, PaginationQuery, PaginationInfo } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class OrderService {
  // Get all orders with pagination and filters (Admin)
  static async getAllOrders(
    filters: OrderFilters = {},
    pagination: PaginationQuery = {}
  ): Promise<{ orders: OrderWithItems[]; pagination: PaginationInfo }> {
    try {
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const offset = (page - 1) * limit;
      const sort = pagination.sort || 'created_at';
      const order = pagination.order || 'desc';

      // Build WHERE clause
      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (filters.status) {
        whereConditions.push('o.status = ?');
        queryParams.push(filters.status);
      }

      if (filters.payment_status) {
        whereConditions.push('o.payment_status = ?');
        queryParams.push(filters.payment_status);
      }

      if (filters.user_id) {
        whereConditions.push('o.user_id = ?');
        queryParams.push(filters.user_id);
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

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM orders o 
        ${whereClause}
      `;
      const [countResult] = await pool.execute(countQuery, queryParams);
      const total = (countResult as any[])[0].total;

      // Get orders with user information
      const ordersQuery = `
        SELECT 
          o.*,
          CONCAT(u.first_name, ' ', u.last_name) as customer_name,
          u.email as customer_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ${whereClause}
        ORDER BY o.${sort} ${order.toUpperCase()}
        LIMIT ? OFFSET ?
      `;
      const [orders] = await pool.execute(ordersQuery, [...queryParams, limit, offset]);

      // Get order items for each order
      const ordersWithItems: OrderWithItems[] = [];
      for (const order of orders as Order[]) {
        const [orderItems] = await pool.execute(`
          SELECT 
            oi.*,
            p.name as product_name,
            p.image_url as product_image
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `, [order.id]);

        ordersWithItems.push({
          ...order,
          items: orderItems as OrderItemWithProduct[],
        });
      }

      const totalPages = Math.ceil(total / limit);

      return {
        orders: ordersWithItems,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('Get all orders error:', error);
      throw new CustomError('Failed to get orders', 500);
    }
  }

  // Get orders for a specific user
  static async getUserOrders(
    userId: number,
    pagination: PaginationQuery = {}
  ): Promise<{ orders: OrderWithItems[]; pagination: PaginationInfo }> {
    return this.getAllOrders({ user_id: userId }, pagination);
  }

  // Get order by ID
  static async getOrderById(orderId: number): Promise<OrderWithItems | null> {
    try {
      const connection = await pool.getConnection();

      // Get order with user information
      const [orders] = await connection.execute(`
        SELECT 
          o.*,
          CONCAT(u.first_name, ' ', u.last_name) as customer_name,
          u.email as customer_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
      `, [orderId]);

      if ((orders as Order[]).length === 0) {
        connection.release();
        return null;
      }

      const order = (orders as Order[])[0];

      // Get order items
      const [orderItems] = await connection.execute(`
        SELECT 
          oi.*,
          p.name as product_name,
          p.image_url as product_image
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [orderId]);

      connection.release();

      return {
        ...order,
        items: orderItems as OrderItemWithProduct[],
      };
    } catch (error) {
      logger.error('Get order by ID error:', error);
      throw new CustomError('Failed to get order', 500);
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: number, statusData: UpdateOrderStatusRequest): Promise<Order> {
    try {
      const connection = await pool.getConnection();

      // Check if order exists
      const [existingOrders] = await connection.execute(
        'SELECT id FROM orders WHERE id = ?',
        [orderId]
      );

      if ((existingOrders as any[]).length === 0) {
        connection.release();
        throw new CustomError('Order not found', 404);
      }

      // Update order status
      await connection.execute(
        'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [statusData.status, orderId]
      );

      // Get updated order
      const [updatedOrders] = await connection.execute(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      );

      connection.release();

      const updatedOrder = (updatedOrders as Order[])[0];
      logger.info(`Order status updated: ID ${orderId}, status: ${statusData.status}`);

      return updatedOrder;
    } catch (error) {
      logger.error('Update order status error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update order status', 500);
    }
  }

  // Update payment status
  static async updatePaymentStatus(orderId: number, paymentStatus: string): Promise<Order> {
    try {
      const connection = await pool.getConnection();

      // Check if order exists
      const [existingOrders] = await connection.execute(
        'SELECT id FROM orders WHERE id = ?',
        [orderId]
      );

      if ((existingOrders as any[]).length === 0) {
        connection.release();
        throw new CustomError('Order not found', 404);
      }

      // Update payment status
      await connection.execute(
        'UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [paymentStatus, orderId]
      );

      // Get updated order
      const [updatedOrders] = await connection.execute(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      );

      connection.release();

      const updatedOrder = (updatedOrders as Order[])[0];
      logger.info(`Order payment status updated: ID ${orderId}, status: ${paymentStatus}`);

      return updatedOrder;
    } catch (error) {
      logger.error('Update payment status error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update payment status', 500);
    }
  }


  // Create new order
  static async createOrder(
    userId: number,
    orderData: {
      shipping_address: string;
      billing_address?: string;
      payment_method?: string;
      notes?: string;
      items: Array<{
        product_id: number;
        quantity: number;
        price: number;
      }>;
    }
  ): Promise<OrderWithItems> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Calculate total amount
      const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (
          user_id, order_number, total_amount, status, shipping_address, 
          billing_address, payment_method, payment_status, notes
        ) VALUES (?, ?, ?, 'pending', ?, ?, ?, 'pending', ?)`,
        [
          userId,
          orderNumber,
          totalAmount,
          orderData.shipping_address,
          orderData.billing_address || null,
          orderData.payment_method || null,
          orderData.notes || null,
        ]
      );

      const orderId = (orderResult as any).insertId;

      // Create order items
      for (const item of orderData.items) {
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price]
        );

        // Update product stock
        await connection.execute(
          `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`,
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();

      // Return the created order with items
      const createdOrder = await this.getOrderById(orderId);
      if (!createdOrder) {
        throw new CustomError('Failed to retrieve created order', 500);
      }

      logger.info(`Order created: ${orderNumber} for user ${userId}`);
      return createdOrder;

    } catch (error) {
      await connection.rollback();
      logger.error('Create order error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create order', 500);
    } finally {
      connection.release();
    }
  }

  // Get order statistics (Admin only)
  static async getOrderStats(): Promise<any> {
    try {
      const connection = await pool.getConnection();

      // Get total orders
      const [totalOrdersResult] = await connection.execute('SELECT COUNT(*) as total FROM orders');
      const totalOrders = (totalOrdersResult as any[])[0].total;

      // Get orders by status
      const [statusStats] = await connection.execute(`
        SELECT status, COUNT(*) as count
        FROM orders
        GROUP BY status
      `);

      // Get orders by payment status
      const [paymentStats] = await connection.execute(`
        SELECT payment_status, COUNT(*) as count
        FROM orders
        GROUP BY payment_status
      `);

      // Get total revenue
      const [revenueResult] = await connection.execute(`
        SELECT SUM(total_amount) as total_revenue
        FROM orders
        WHERE payment_status = 'paid'
      `);
      const totalRevenue = (revenueResult as any[])[0].total_revenue || 0;

      // Get recent orders count (last 30 days)
      const [recentOrdersResult] = await connection.execute(`
        SELECT COUNT(*) as count
        FROM orders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);
      const recentOrders = (recentOrdersResult as any[])[0].count;

      // Get monthly revenue trend (last 12 months)
      const [monthlyRevenue] = await connection.execute(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          SUM(total_amount) as revenue,
          COUNT(*) as order_count
        FROM orders
        WHERE payment_status = 'paid'
          AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
      `);

      // Get top customers by order value
      const [topCustomers] = await connection.execute(`
        SELECT 
          u.id,
          CONCAT(u.first_name, ' ', u.last_name) as customer_name,
          u.email,
          COUNT(o.id) as order_count,
          SUM(o.total_amount) as total_spent
        FROM users u
        JOIN orders o ON u.id = o.user_id
        WHERE o.payment_status = 'paid'
        GROUP BY u.id, u.first_name, u.last_name, u.email
        ORDER BY total_spent DESC
        LIMIT 10
      `);

      // Get order status timeline for recent orders
      const [statusTimeline] = await connection.execute(`
        SELECT 
          DATE(created_at) as date,
          status,
          COUNT(*) as count
        FROM orders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at), status
        ORDER BY date DESC, status
      `);

      connection.release();

      return {
        totalOrders,
        totalRevenue,
        recentOrders,
        statusBreakdown: statusStats,
        paymentStatusBreakdown: paymentStats,
        monthlyRevenue,
        topCustomers,
        statusTimeline,
      };
    } catch (error) {
      logger.error('Get order stats error:', error);
      throw new CustomError('Failed to get order statistics', 500);
    }
  }

  // Get order analytics with date range
  static async getOrderAnalytics(
    startDate?: string,
    endDate?: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<any> {
    try {
      const connection = await pool.getConnection();

      let dateFormat: string;
      let intervalClause = '';
      
      switch (groupBy) {
        case 'day':
          dateFormat = '%Y-%m-%d';
          intervalClause = startDate ? `AND created_at >= '${startDate}'` : '';
          if (endDate) intervalClause += ` AND created_at <= '${endDate}'`;
          break;
        case 'week':
          dateFormat = '%Y-%u';
          intervalClause = startDate ? `AND created_at >= '${startDate}'` : '';
          if (endDate) intervalClause += ` AND created_at <= '${endDate}'`;
          break;
        case 'month':
          dateFormat = '%Y-%m';
          intervalClause = startDate ? `AND created_at >= '${startDate}'` : '';
          if (endDate) intervalClause += ` AND created_at <= '${endDate}'`;
          break;
        default:
          dateFormat = '%Y-%m-%d';
      }

      // Get order trends
      const [orderTrends] = await connection.execute(`
        SELECT 
          DATE_FORMAT(created_at, '${dateFormat}') as period,
          COUNT(*) as order_count,
          SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as revenue,
          AVG(total_amount) as avg_order_value
        FROM orders
        WHERE 1=1 ${intervalClause}
        GROUP BY DATE_FORMAT(created_at, '${dateFormat}')
        ORDER BY period
      `);

      // Get product performance
      const [productPerformance] = await connection.execute(`
        SELECT 
          p.id,
          p.name,
          p.category_id,
          c.name as category_name,
          SUM(oi.quantity) as total_quantity_sold,
          SUM(oi.quantity * oi.price) as total_revenue,
          COUNT(DISTINCT oi.order_id) as order_count
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o ON oi.order_id = o.id
        JOIN categories c ON p.category_id = c.id
        WHERE o.payment_status = 'paid' ${intervalClause}
        GROUP BY p.id, p.name, p.category_id, c.name
        ORDER BY total_revenue DESC
        LIMIT 20
      `);

      // Get customer analytics
      const [customerAnalytics] = await connection.execute(`
        SELECT 
          COUNT(DISTINCT user_id) as total_customers,
          COUNT(DISTINCT CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN user_id END) as new_customers_30d,
          AVG(total_amount) as avg_order_value,
          MAX(total_amount) as max_order_value,
          MIN(total_amount) as min_order_value
        FROM orders
        WHERE payment_status = 'paid' ${intervalClause}
      `);

      connection.release();

      return {
        orderTrends,
        productPerformance,
        customerAnalytics,
      };
    } catch (error) {
      logger.error('Get order analytics error:', error);
      throw new CustomError('Failed to get order analytics', 500);
    }
  }

  // Get order status history for tracking
  static async getOrderStatusHistory(orderId: number): Promise<any[]> {
    try {
      const connection = await pool.getConnection();

      // For now, we'll create a simple status history based on order updates
      // In a real application, you might want to create a separate order_status_history table
      const [history] = await connection.execute(`
        SELECT 
          'created' as status,
          created_at as timestamp,
          'Order created' as description
        FROM orders
        WHERE id = ?
        
        UNION ALL
        
        SELECT 
          'updated' as status,
          updated_at as timestamp,
          CONCAT('Order updated - Status: ', status, ', Payment: ', payment_status) as description
        FROM orders
        WHERE id = ? AND updated_at > created_at
        
        ORDER BY timestamp DESC
      `, [orderId, orderId]);

      connection.release();

      return history as any[];
    } catch (error) {
      logger.error('Get order status history error:', error);
      throw new CustomError('Failed to get order status history', 500);
    }
  }
}
