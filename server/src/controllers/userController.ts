import { Request, Response, NextFunction } from 'express';
import { UserService, UpdateUserRequest } from '../services/userService';
import { CreateUserRequest, PaginationQuery, AuthenticatedRequest } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class UserController {
  // Get all users (Admin only)
  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination: PaginationQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sort: req.query.sort as string,
        order: req.query.order as 'asc' | 'desc',
      };

      const result = await UserService.getAllUsers(pagination);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID (Admin only)
  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        throw new CustomError('Invalid user ID', 400);
      }

      const user = await UserService.getUserById(userId);
      
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new user (Admin only)
  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      const user = await UserService.createUser(userData);

      logger.info(`New user created: ${user.email}`);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update user (Admin only)
  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        throw new CustomError('Invalid user ID', 400);
      }

      const updateData: UpdateUserRequest = req.body;
      const user = await UserService.updateUser(userId, updateData);

      logger.info(`User updated: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete user (Admin only)
  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        throw new CustomError('Invalid user ID', 400);
      }

      await UserService.deleteUser(userId);

      logger.info(`User deleted: ID ${userId}`);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user statistics (Admin only)
  static async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await UserService.getUserStats();

      res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
