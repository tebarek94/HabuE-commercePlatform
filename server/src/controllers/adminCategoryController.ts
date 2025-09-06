import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService';
import { CreateCategoryRequest, UpdateCategoryRequest } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AdminCategoryController {
  // Get all categories (Admin view)
  static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await CategoryService.getCategories();

      res.status(200).json({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new category (Admin only)
  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryData: CreateCategoryRequest = req.body;
      const category = await CategoryService.createCategory(categoryData);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update category (Admin only)
  static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = parseInt(req.params.id!);
      
      if (isNaN(categoryId)) {
        throw new CustomError('Invalid category ID', 400);
      }

      const updateData: UpdateCategoryRequest = req.body;
      const category = await CategoryService.updateCategory(categoryId, updateData);

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete category (Admin only)
  static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = parseInt(req.params.id!);
      
      if (isNaN(categoryId)) {
        throw new CustomError('Invalid category ID', 400);
      }

      await CategoryService.deleteCategory(categoryId);

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
