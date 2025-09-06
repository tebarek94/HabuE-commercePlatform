import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AdminDashboardController {
  // Get admin dashboard statistics
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

  // Get recent orders for dashboard
  static async getRecentOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
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

  // Get top products for dashboard
  static async getTopProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
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

  // Get category performance for dashboard
  static async getCategoryPerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const performance = await DashboardService.getCategoryPerformance();

      res.status(200).json({
        success: true,
        message: 'Category performance retrieved successfully',
        data: performance,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get recent activity for dashboard
  static async getRecentActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
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

  // Get sales analytics
  static async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = (req.query.period as 'day' | 'week' | 'month' | 'year') || 'month';
      const analytics = await DashboardService.getAnalyticsData(period);

      res.status(200).json({
        success: true,
        message: 'Analytics data retrieved successfully',
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}
