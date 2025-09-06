import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class DashboardController {
  // Get dashboard statistics
  static async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await DashboardService.getDashboardStats();

      res.status(200).json({
        success: true,
        message: 'Dashboard statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get recent orders
  static async getRecentOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      if (isNaN(limit) || limit < 1 || limit > 50) {
        throw new CustomError('Invalid limit parameter', 400);
      }

      const orders = await DashboardService.getRecentOrders(limit);

      res.status(200).json({
        success: true,
        message: 'Recent orders retrieved successfully',
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get top products
  static async getTopProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      if (isNaN(limit) || limit < 1 || limit > 50) {
        throw new CustomError('Invalid limit parameter', 400);
      }

      const products = await DashboardService.getTopProducts(limit);

      res.status(200).json({
        success: true,
        message: 'Top products retrieved successfully',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get category performance
  static async getCategoryPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await DashboardService.getCategoryPerformance();

      res.status(200).json({
        success: true,
        message: 'Category performance retrieved successfully',
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get recent activity
  static async getRecentActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      if (isNaN(limit) || limit < 1 || limit > 50) {
        throw new CustomError('Invalid limit parameter', 400);
      }

      const activity = await DashboardService.getRecentActivity(limit);

      res.status(200).json({
        success: true,
        message: 'Recent activity retrieved successfully',
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get analytics data
  static async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = req.query.period as 'day' | 'week' | 'month' | 'year' || 'month';
      
      if (!['day', 'week', 'month', 'year'].includes(period)) {
        throw new CustomError('Invalid period parameter', 400);
      }

      const analyticsData = await DashboardService.getAnalyticsData(period);

      res.status(200).json({
        success: true,
        message: 'Analytics data retrieved successfully',
        data: analyticsData,
      });
    } catch (error) {
      next(error);
    }
  }
}
