import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AdminOrderController {
  // Get all orders (Admin view - can see all orders)
  static async getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: any = {};
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }
      if (req.query.payment_status) {
        filters.payment_status = req.query.payment_status as string;
      }
      if (req.query.date_from) {
        filters.date_from = req.query.date_from as string;
      }
      if (req.query.date_to) {
        filters.date_to = req.query.date_to as string;
      }

      const orders = await OrderService.getAllOrders(filters);

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get order by ID (Admin view - can see all orders)
  static async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = parseInt(req.params.id!);
      
      if (isNaN(orderId)) {
        throw new CustomError('Invalid order ID', 400);
      }

      const order = await OrderService.getOrderById(orderId);
      
      if (!order) {
        throw new CustomError('Order not found', 404);
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
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = parseInt(req.params.id!);
      const { status } = req.body;
      
      if (isNaN(orderId)) {
        throw new CustomError('Invalid order ID', 400);
      }

      if (!status) {
        throw new CustomError('Status is required', 400);
      }

      await OrderService.updateOrderStatus(orderId, status);

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Update order payment status (Admin only)
  static async updatePaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = parseInt(req.params.id!);
      const { payment_status } = req.body;
      
      if (isNaN(orderId)) {
        throw new CustomError('Invalid order ID', 400);
      }

      if (!payment_status) {
        throw new CustomError('Payment status is required', 400);
      }

      await OrderService.updatePaymentStatus(orderId, payment_status);

      res.status(200).json({
        success: true,
        message: 'Payment status updated successfully',
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

  // Get order status history (Admin only)
  static async getOrderHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = parseInt(req.params.id!);
      
      if (isNaN(orderId)) {
        throw new CustomError('Invalid order ID', 400);
      }

      const history = await OrderService.getOrderStatusHistory(orderId);

      res.status(200).json({
        success: true,
        message: 'Order status history retrieved successfully',
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get order analytics (Admin only)
  static async getOrderAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { start_date, end_date, group_by } = req.query;
      const analytics = await OrderService.getOrderAnalytics(
        start_date as string,
        end_date as string,
        (group_by as 'day' | 'week' | 'month') || 'day'
      );

      res.status(200).json({
        success: true,
        message: 'Order analytics retrieved successfully',
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}
