import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { ProductFilters, PaginationQuery } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class ClientProductController {
  // Get all active products (Client view - only shows active products)
  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: ProductFilters = {
        is_active: true, // Only show active products to clients
      };
      
      if (req.query.category_id) {
        filters.category_id = parseInt(req.query.category_id as string);
      }
      if (req.query.min_price) {
        filters.min_price = parseFloat(req.query.min_price as string);
      }
      if (req.query.max_price) {
        filters.max_price = parseFloat(req.query.max_price as string);
      }
      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      const pagination: PaginationQuery = {};
      
      if (req.query.page) {
        pagination.page = parseInt(req.query.page as string);
      }
      if (req.query.limit) {
        pagination.limit = parseInt(req.query.limit as string);
      }
      if (req.query.sort) {
        pagination.sort = req.query.sort as string;
      }
      if (req.query.order) {
        pagination.order = req.query.order as 'asc' | 'desc';
      }

      const result = await ProductService.getProducts(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get product by ID (Client view - only shows active products)
  static async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = parseInt(req.params.id!);
      
      if (isNaN(productId)) {
        throw new CustomError('Invalid product ID', 400);
      }

      const product = await ProductService.getProductById(productId);
      
      if (!product) {
        throw new CustomError('Product not found', 404);
      }

      // Only show active products to clients
      if (!product.is_active) {
        throw new CustomError('Product not available', 404);
      }

      res.status(200).json({
        success: true,
        message: 'Product retrieved successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // Search products (Client view - only searches active products)
  static async searchProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        throw new CustomError('Search query is required', 400);
      }

      const pagination: PaginationQuery = {};
      
      if (req.query.page) {
        pagination.page = parseInt(req.query.page as string);
      }
      if (req.query.limit) {
        pagination.limit = parseInt(req.query.limit as string);
      }
      if (req.query.sort) {
        pagination.sort = req.query.sort as string;
      }
      if (req.query.order) {
        pagination.order = req.query.order as 'asc' | 'desc';
      }

      // Search only active products
      const result = await ProductService.searchProducts(q, pagination, { is_active: true });

      res.status(200).json({
        success: true,
        message: 'Search completed successfully',
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get products by category (Client view - only shows active products)
  static async getProductsByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryId = parseInt(req.params.categoryId!);
      
      if (isNaN(categoryId)) {
        throw new CustomError('Invalid category ID', 400);
      }

      const pagination: PaginationQuery = {};
      
      if (req.query.page) {
        pagination.page = parseInt(req.query.page as string);
      }
      if (req.query.limit) {
        pagination.limit = parseInt(req.query.limit as string);
      }
      if (req.query.sort) {
        pagination.sort = req.query.sort as string;
      }
      if (req.query.order) {
        pagination.order = req.query.order as 'asc' | 'desc';
      }

      // Only show active products in category
      const result = await ProductService.getProductsByCategory(categoryId, pagination, { is_active: true });

      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get featured products (Client view - only shows active products)
  static async getFeaturedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination: PaginationQuery = {
        page: 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 8,
        sort: 'created_at',
        order: 'desc',
      };

      const filters: ProductFilters = {
        is_active: true, // Only show active products
      };

      const result = await ProductService.getProducts(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Featured products retrieved successfully',
        data: result.products,
      });
    } catch (error) {
      next(error);
    }
  }
}
