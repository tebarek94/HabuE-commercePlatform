import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { CreateOrderRequest } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class ClientOrderController {
  // Get user's orders (Client only)
  static async getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user!.id;
      const result = await OrderService.getAllOrders({ user_id: userId });

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: result.orders,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get order by ID (Client only - can only see their own orders)
  static async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = parseInt(req.params.id!);
      const userId = (req as any).user!.id;
      
      if (isNaN(orderId)) {
        throw new CustomError('Invalid order ID', 400);
      }

      const order = await OrderService.getOrderById(orderId);
      
      if (!order) {
        throw new CustomError('Order not found', 404);
      }

      // Ensure user can only see their own orders
      if (order.user_id !== userId) {
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

  // Create new order (Client only)
  static async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user!.id;
      const orderData = {
        ...req.body,
        items: req.body.items || [],
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

  // Cancel order (Client only - can only cancel their own orders)
  static async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = parseInt(req.params.id!);
      const userId = (req as any).user!.id;
      
      if (isNaN(orderId)) {
        throw new CustomError('Invalid order ID', 400);
      }

      // Check if order exists and belongs to user
      const order = await OrderService.getOrderById(orderId);
      
      if (!order) {
        throw new CustomError('Order not found', 404);
      }

      if (order.user_id !== userId) {
        throw new CustomError('Access denied', 403);
      }

      // Only allow cancellation of pending orders
      if (order.status !== 'pending') {
        throw new CustomError('Only pending orders can be cancelled', 400);
      }

      await OrderService.updateOrderStatus(orderId, { status: 'cancelled' });

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
