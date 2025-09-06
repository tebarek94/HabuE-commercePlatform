import { pool } from '../config/database';
import { Product, CreateProductRequest, UpdateProductRequest, ProductFilters, PaginationQuery, PaginationInfo } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class ProductService {
  // Get all products with pagination and filters
  static async getProducts(
    filters: ProductFilters = {},
    pagination: PaginationQuery = {}
  ): Promise<{ products: Product[]; pagination: PaginationInfo }> {
    try {
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const offset = (page - 1) * limit;
      const sort = pagination.sort || 'created_at';
      const order = pagination.order || 'desc';

      // Build WHERE clause
      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      if (filters.category_id) {
        whereConditions.push('p.category_id = ?');
        queryParams.push(filters.category_id);
      }

      if (filters.min_price !== undefined) {
        whereConditions.push('p.price >= ?');
        queryParams.push(filters.min_price);
      }

      if (filters.max_price !== undefined) {
        whereConditions.push('p.price <= ?');
        queryParams.push(filters.max_price);
      }

      if (filters.search) {
        whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
        queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      if (filters.is_active !== undefined) {
        whereConditions.push('p.is_active = ?');
        queryParams.push(filters.is_active);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM products p 
        ${whereClause}
      `;
      const [countResult] = await pool.execute(countQuery, queryParams);
      const total = (countResult as any[])[0].total;

      // Get products
      const productsQuery = `
        SELECT p.*, c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${whereClause}
        ORDER BY p.${sort} ${order.toUpperCase()}
        LIMIT ? OFFSET ?
      `;
      const [products] = await pool.execute(productsQuery, [...queryParams, limit, offset]);

      const totalPages = Math.ceil(total / limit);

      return {
        products: products as Product[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('Get products error:', error);
      throw new CustomError('Failed to get products', 500);
    }
  }

  // Get product by ID
  static async getProductById(productId: number): Promise<Product | null> {
    try {
      const connection = await pool.getConnection();
      const [products] = await connection.execute(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = ?`,
        [productId]
      );

      connection.release();

      const productList = products as Product[];
      return productList.length > 0 ? productList[0]! : null;
    } catch (error) {
      logger.error('Get product by ID error:', error);
      throw new CustomError('Failed to get product', 500);
    }
  }

  // Create new product
  static async createProduct(productData: CreateProductRequest): Promise<Product> {
    try {
      const { name, description, price, category_id, image_url, stock_quantity } = productData;

      // Verify category exists
      const connection = await pool.getConnection();
      const [categories] = await connection.execute(
        'SELECT id FROM categories WHERE id = ? AND is_active = true',
        [category_id]
      );

      if ((categories as any[]).length === 0) {
        connection.release();
        throw new CustomError('Category not found', 404);
      }

      // Create product
      const [result] = await connection.execute(
        'INSERT INTO products (name, description, price, category_id, image_url, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, price, category_id, image_url || null, stock_quantity]
      );

      const insertResult = result as any;
      const productId = insertResult.insertId;

      // Get created product
      const [newProducts] = await connection.execute(
        'SELECT * FROM products WHERE id = ?',
        [productId]
      );

      connection.release();

      const newProduct = (newProducts as Product[])[0]!;
      logger.info(`New product created: ${newProduct.name}`);

      return newProduct;
    } catch (error) {
      logger.error('Create product error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create product', 500);
    }
  }

  // Create product with image upload
  static async createProductWithImage(req: any): Promise<Product> {
    try {
      const multer = require('multer');
      const path = require('path');
      const fs = require('fs');

      // Configure multer for image uploads
      const storage = multer.diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const uploadDir = path.join(__dirname, '../../uploads/products');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req: any, file: any, cb: any) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
        }
      });

      const upload = multer({
        storage: storage,
        limits: {
          fileSize: 5 * 1024 * 1024 // 5MB limit
        },
        fileFilter: (req: any, file: any, cb: any) => {
          if (file.mimetype.startsWith('image/')) {
            cb(null, true);
          } else {
            cb(new CustomError('Only image files are allowed', 400), false);
          }
        }
      });

      // Handle the upload
      return new Promise((resolve, reject) => {
        upload.single('image')(req, null, async (err: any) => {
          if (err) {
            reject(err);
            return;
          }

          try {
            const { name, description, price, category_id, stock_quantity, is_active } = req.body;

            // Verify category exists
            const connection = await pool.getConnection();
            const [categories] = await connection.execute(
              'SELECT id FROM categories WHERE id = ? AND is_active = true',
              [category_id]
            );

            if ((categories as any[]).length === 0) {
              connection.release();
              throw new CustomError('Category not found', 404);
            }

            // Generate image URL
            const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

            // Create product
            const [result] = await connection.execute(
              'INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [name, description, price, category_id, imageUrl, stock_quantity, is_active === 'true']
            );

            const insertResult = result as any;
            const productId = insertResult.insertId;

            // Get created product
            const [newProducts] = await connection.execute(
              'SELECT * FROM products WHERE id = ?',
              [productId]
            );

            connection.release();

            const newProduct = (newProducts as Product[])[0]!;
            logger.info(`New product created with image: ${newProduct.name}`);

            resolve(newProduct);
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      logger.error('Create product with image error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create product with image', 500);
    }
  }

  // Update product
  static async updateProduct(productId: number, updateData: UpdateProductRequest): Promise<Product> {
    try {
      const connection = await pool.getConnection();

      // Check if product exists
      const [existingProducts] = await connection.execute(
        'SELECT id FROM products WHERE id = ?',
        [productId]
      );

      if ((existingProducts as any[]).length === 0) {
        connection.release();
        throw new CustomError('Product not found', 404);
      }

      // Verify category if provided
      if (updateData.category_id) {
        const [categories] = await connection.execute(
          'SELECT id FROM categories WHERE id = ? AND is_active = true',
          [updateData.category_id]
        );

        if ((categories as any[]).length === 0) {
          connection.release();
          throw new CustomError('Category not found', 404);
        }
      }

      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updateData.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(updateData.name);
      }
      if (updateData.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(updateData.description);
      }
      if (updateData.price !== undefined) {
        updateFields.push('price = ?');
        updateValues.push(updateData.price);
      }
      if (updateData.category_id !== undefined) {
        updateFields.push('category_id = ?');
        updateValues.push(updateData.category_id);
      }
      if (updateData.image_url !== undefined) {
        updateFields.push('image_url = ?');
        updateValues.push(updateData.image_url);
      }
      if (updateData.stock_quantity !== undefined) {
        updateFields.push('stock_quantity = ?');
        updateValues.push(updateData.stock_quantity);
      }
      if (updateData.is_active !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(updateData.is_active);
      }

      if (updateFields.length === 0) {
        connection.release();
        throw new CustomError('No fields to update', 400);
      }

      updateValues.push(productId);

      await connection.execute(
        `UPDATE products SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        updateValues
      );

      // Get updated product
      const [updatedProducts] = await connection.execute(
        'SELECT * FROM products WHERE id = ?',
        [productId]
      );

      connection.release();

      const updatedProduct = (updatedProducts as Product[])[0]!;
      logger.info(`Product updated: ${updatedProduct.name}`);

      return updatedProduct;
    } catch (error) {
      logger.error('Update product error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update product', 500);
    }
  }

  // Update product with image upload
  static async updateProductWithImage(productId: number, req: any): Promise<Product> {
    try {
      const multer = require('multer');
      const path = require('path');
      const fs = require('fs');

      // Configure multer for image uploads
      const storage = multer.diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const uploadDir = path.join(__dirname, '../../uploads/products');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req: any, file: any, cb: any) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
        }
      });

      const upload = multer({
        storage: storage,
        limits: {
          fileSize: 5 * 1024 * 1024 // 5MB limit
        },
        fileFilter: (req: any, file: any, cb: any) => {
          if (file.mimetype.startsWith('image/')) {
            cb(null, true);
          } else {
            cb(new CustomError('Only image files are allowed', 400), false);
          }
        }
      });

      // Handle the upload
      return new Promise((resolve, reject) => {
        upload.single('image')(req, null, async (err: any) => {
          if (err) {
            reject(err);
            return;
          }

          try {
            const connection = await pool.getConnection();

            // Check if product exists
            const [existingProducts] = await connection.execute(
              'SELECT id FROM products WHERE id = ?',
              [productId]
            );

            if ((existingProducts as any[]).length === 0) {
              connection.release();
              throw new CustomError('Product not found', 404);
            }

            const { name, description, price, category_id, stock_quantity, is_active } = req.body;

            // Verify category if provided
            if (category_id) {
              const [categories] = await connection.execute(
                'SELECT id FROM categories WHERE id = ? AND is_active = true',
                [category_id]
              );

              if ((categories as any[]).length === 0) {
                connection.release();
                throw new CustomError('Category not found', 404);
              }
            }

            // Build dynamic update query
            const updateFields: string[] = [];
            const updateValues: any[] = [];

            if (name !== undefined) {
              updateFields.push('name = ?');
              updateValues.push(name);
            }
            if (description !== undefined) {
              updateFields.push('description = ?');
              updateValues.push(description);
            }
            if (price !== undefined) {
              updateFields.push('price = ?');
              updateValues.push(price);
            }
            if (category_id !== undefined) {
              updateFields.push('category_id = ?');
              updateValues.push(category_id);
            }
            if (stock_quantity !== undefined) {
              updateFields.push('stock_quantity = ?');
              updateValues.push(stock_quantity);
            }
            if (is_active !== undefined) {
              updateFields.push('is_active = ?');
              updateValues.push(is_active === 'true');
            }

            // Add image URL if file was uploaded
            if (req.file) {
              updateFields.push('image_url = ?');
              updateValues.push(`/uploads/products/${req.file.filename}`);
            }

            if (updateFields.length === 0) {
              connection.release();
              throw new CustomError('No fields to update', 400);
            }

            updateValues.push(productId);

            await connection.execute(
              `UPDATE products SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
              updateValues
            );

            // Get updated product
            const [updatedProducts] = await connection.execute(
              'SELECT * FROM products WHERE id = ?',
              [productId]
            );

            connection.release();

            const updatedProduct = (updatedProducts as Product[])[0]!;
            logger.info(`Product updated with image: ${updatedProduct.name}`);

            resolve(updatedProduct);
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      logger.error('Update product with image error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update product with image', 500);
    }
  }

  // Delete product
  static async deleteProduct(productId: number): Promise<void> {
    try {
      const connection = await pool.getConnection();

      // Check if product exists
      const [existingProducts] = await connection.execute(
        'SELECT id FROM products WHERE id = ?',
        [productId]
      );

      if ((existingProducts as any[]).length === 0) {
        connection.release();
        throw new CustomError('Product not found', 404);
      }

      // Check if product is in any orders
      const [orderItems] = await connection.execute(
        'SELECT id FROM order_items WHERE product_id = ?',
        [productId]
      );

      if ((orderItems as any[]).length > 0) {
        connection.release();
        throw new CustomError('Cannot delete product that has been ordered', 400);
      }

      // Delete product
      await connection.execute('DELETE FROM products WHERE id = ?', [productId]);

      connection.release();
      logger.info(`Product deleted: ID ${productId}`);
    } catch (error) {
      logger.error('Delete product error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete product', 500);
    }
  }

  // Update product stock
  static async updateStock(productId: number, quantity: number): Promise<void> {
    try {
      const connection = await pool.getConnection();

      // Check if product exists
      const [existingProducts] = await connection.execute(
        'SELECT id, stock_quantity FROM products WHERE id = ?',
        [productId]
      );

      if ((existingProducts as any[]).length === 0) {
        connection.release();
        throw new CustomError('Product not found', 404);
      }

      const product = (existingProducts as any[])[0];
      const newStock = product.stock_quantity - quantity;

      if (newStock < 0) {
        connection.release();
        throw new CustomError('Insufficient stock', 400);
      }

      await connection.execute(
        'UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStock, productId]
      );

      connection.release();
      logger.info(`Product stock updated: ID ${productId}, new stock: ${newStock}`);
    } catch (error) {
      logger.error('Update stock error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update stock', 500);
    }
  }

  // Get products by category
  static async getProductsByCategory(categoryId: number, pagination: PaginationQuery = {}): Promise<{ products: Product[]; pagination: PaginationInfo }> {
    return this.getProducts({ category_id: categoryId }, pagination);
  }

  // Search products
  static async searchProducts(searchTerm: string, pagination: PaginationQuery = {}): Promise<{ products: Product[]; pagination: PaginationInfo }> {
    return this.getProducts({ search: searchTerm }, pagination);
  }
}
