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

  // Get order statistics
  static async getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
  }> {
    try {
      const connection = await pool.getConnection();

      const [stats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as total_revenue
        FROM orders
      `);

      connection.release();

      const result = (stats as any[])[0];
      return {
        totalOrders: result.total_orders,
        pendingOrders: result.pending_orders,
        completedOrders: result.completed_orders,
        cancelledOrders: result.cancelled_orders,
        totalRevenue: result.total_revenue,
      };
    } catch (error) {
      logger.error('Get order stats error:', error);
      throw new CustomError('Failed to get order statistics', 500);
    }
  }
}
