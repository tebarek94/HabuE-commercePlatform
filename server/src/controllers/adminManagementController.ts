import { Request, Response, NextFunction } from 'express';
import { AdminManagementService } from '../services/adminManagementService';
import { CreateUserRequest, AuthenticatedRequest } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AdminManagementController {
  // Get all admin users
  static async getAllAdmins(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admins = await AdminManagementService.getAllAdmins();

      res.status(200).json({
        success: true,
        message: 'Admin users retrieved successfully',
        data: admins,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new admin user
  static async createAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      const admin = await AdminManagementService.createAdmin(userData);

      logger.info(`New admin created: ${admin.email} by user ${(req as AuthenticatedRequest).user?.userId}`);

      res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update admin user
  static async updateAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;

      if (isNaN(userId)) {
        throw new CustomError('Invalid user ID', 400);
      }

      const updatedAdmin = await AdminManagementService.updateAdmin(userId, updateData);

      logger.info(`Admin user ${userId} updated by user ${(req as AuthenticatedRequest).user?.userId}`);

      res.status(200).json({
        success: true,
        message: 'Admin user updated successfully',
        data: updatedAdmin,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete admin user
  static async deleteAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        throw new CustomError('Invalid user ID', 400);
      }

      // Prevent self-deletion
      const currentUserId = (req as AuthenticatedRequest).user?.userId;
      if (userId === currentUserId) {
        throw new CustomError('Cannot delete your own account', 400);
      }

      await AdminManagementService.deleteAdmin(userId);

      logger.info(`Admin user ${userId} deleted by user ${currentUserId}`);

      res.status(200).json({
        success: true,
        message: 'Admin user deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
