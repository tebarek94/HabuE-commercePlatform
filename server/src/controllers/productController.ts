import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';
import { CreateProductRequest, UpdateProductRequest, ProductFilters, PaginationQuery, AuthenticatedRequest } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class ProductController {
  // Get all products
  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: ProductFilters = {};
      
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
      if (req.query.is_active !== undefined) {
        filters.is_active = req.query.is_active === 'true';
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

  // Get product by ID
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

      res.status(200).json({
        success: true,
        message: 'Product retrieved successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new product (Admin only)
  static async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const productData: CreateProductRequest = req.body;
      const product = await ProductService.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new product with image upload (Admin only)
  static async createProductWithImage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.createProductWithImage(req);

      res.status(201).json({
        success: true,
        message: 'Product created successfully with image',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update product (Admin only)
  static async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = parseInt(req.params.id!);
      
      if (isNaN(productId)) {
        throw new CustomError('Invalid product ID', 400);
      }

      const updateData: UpdateProductRequest = req.body;
      const product = await ProductService.updateProduct(productId, updateData);

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update product with image upload (Admin only)
  static async updateProductWithImage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = parseInt(req.params.id!);
      
      if (isNaN(productId)) {
        throw new CustomError('Invalid product ID', 400);
      }

      const product = await ProductService.updateProductWithImage(productId, req);

      res.status(200).json({
        success: true,
        message: 'Product updated successfully with image',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete product (Admin only)
  static async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = parseInt(req.params.id!);
      
      if (isNaN(productId)) {
        throw new CustomError('Invalid product ID', 400);
      }

      await ProductService.deleteProduct(productId);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Search products
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

      const result = await ProductService.searchProducts(q, pagination);

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

  // Get products by category
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

      const result = await ProductService.getProductsByCategory(categoryId, pagination);

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

  // Get featured products
  static async getFeaturedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination: PaginationQuery = {
        page: 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 8,
        sort: 'created_at',
        order: 'desc',
      };

      const filters: ProductFilters = {
        is_active: true,
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

  // Update product stock (Admin only)
  static async updateStock(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = parseInt(req.params.id!);
      const { quantity } = req.body;
      
      if (isNaN(productId)) {
        throw new CustomError('Invalid product ID', 400);
      }

      if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
        throw new CustomError('Valid quantity is required', 400);
      }

      await ProductService.updateStock(productId, quantity);

      res.status(200).json({
        success: true,
        message: 'Stock updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
