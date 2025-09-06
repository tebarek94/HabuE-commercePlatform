import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { OrderFilters, PaginationQuery, AuthenticatedRequest } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class OrderController {
  // Get all orders (Admin) or user's orders (Client)
  static async getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: OrderFilters = {
        status: req.query.status as string,
        payment_status: req.query.payment_status as string,
        user_id: req.query.user_id ? parseInt(req.query.user_id as string) : undefined,
        date_from: req.query.date_from as string,
        date_to: req.query.date_to as string,
      };

      const pagination: PaginationQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sort: req.query.sort as string,
        order: req.query.order as 'asc' | 'desc',
      };

      let result;
      if (req.user?.role === 'admin') {
        result = await OrderService.getAllOrders(filters, pagination);
      } else {
        // For clients, only show their own orders
        result = await OrderService.getUserOrders(req.user!.userId, pagination);
      }

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: result.orders,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get order by ID
  static async getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        throw new CustomError('Invalid order ID', 400);
      }

      const order = await OrderService.getOrderById(orderId);
      
      if (!order) {
        throw new CustomError('Order not found', 404);
      }

      // Check if user can access this order
      if (req.user?.role === 'client' && order.user_id !== req.user.userId) {
        throw new CustomError('Access denied', 403);
      }

      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update order status (Admin only)
  static async updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        throw new CustomError('Invalid order ID', 400);
      }

      const { status } = req.body;
      
      if (!status) {
        throw new CustomError('Status is required', 400);
      }

      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new CustomError('Invalid status', 400);
      }

      const order = await OrderService.updateOrderStatus(orderId, { status });

      logger.info(`Order status updated: ID ${orderId}, status: ${status}`);

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update payment status (Admin only)
  static async updatePaymentStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        throw new CustomError('Invalid order ID', 400);
      }

      const { payment_status } = req.body;
      
      if (!payment_status) {
        throw new CustomError('Payment status is required', 400);
      }

      const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!validStatuses.includes(payment_status)) {
        throw new CustomError('Invalid payment status', 400);
      }

      const order = await OrderService.updatePaymentStatus(orderId, payment_status);

      logger.info(`Payment status updated: ID ${orderId}, status: ${payment_status}`);

      res.status(200).json({
        success: true,
        message: 'Payment status updated successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get order statistics (Admin only)
  static async getOrderStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await OrderService.getOrderStats();

      res.status(200).json({
        success: true,
        message: 'Order statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new order
  static async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { shipping_address, billing_address, payment_method, notes, items } = req.body;

      // Validate required fields
      if (!shipping_address || !items || !Array.isArray(items) || items.length === 0) {
        throw new CustomError('Shipping address and items are required', 400);
      }

      // Validate items
      for (const item of items) {
        if (!item.product_id || !item.quantity || !item.price) {
          throw new CustomError('Each item must have product_id, quantity, and price', 400);
        }
        if (item.quantity <= 0) {
          throw new CustomError('Item quantity must be greater than 0', 400);
        }
      }

      const orderData = {
        shipping_address,
        billing_address,
        payment_method,
        notes,
        items,
      };

      const order = await OrderService.createOrder(userId, orderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}
