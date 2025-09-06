import { Request, Response, NextFunction } from 'express';
import { CategoryService, CreateCategoryRequest, UpdateCategoryRequest } from '../services/categoryService';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class CategoryController {
  // Get all categories
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

  // Get category by ID
  static async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = parseInt(req.params.id);
      
      if (isNaN(categoryId)) {
        throw new CustomError('Invalid category ID', 400);
      }

      const category = await CategoryService.getCategoryById(categoryId);
      
      if (!category) {
        throw new CustomError('Category not found', 404);
      }

      res.status(200).json({
        success: true,
        message: 'Category retrieved successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new category
  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryData: CreateCategoryRequest = req.body;
      const category = await CategoryService.createCategory(categoryData);

      logger.info(`New category created: ${category.name}`);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update category
  static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = parseInt(req.params.id);
      
      if (isNaN(categoryId)) {
        throw new CustomError('Invalid category ID', 400);
      }

      const updateData: UpdateCategoryRequest = req.body;
      const category = await CategoryService.updateCategory(categoryId, updateData);

      logger.info(`Category updated: ${category.name}`);

      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete category
  static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = parseInt(req.params.id);
      
      if (isNaN(categoryId)) {
        throw new CustomError('Invalid category ID', 400);
      }

      await CategoryService.deleteCategory(categoryId);

      logger.info(`Category deleted: ID ${categoryId}`);

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
