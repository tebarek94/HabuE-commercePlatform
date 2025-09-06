import { pool } from '../config/database';
import { Category } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image_url?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}

export class CategoryService {
  // Get all categories
  static async getCategories(): Promise<Category[]> {
    try {
      const connection = await pool.getConnection();
      const [categories] = await connection.execute(
        'SELECT * FROM categories ORDER BY name ASC'
      );

      connection.release();
      return categories as Category[];
    } catch (error) {
      logger.error('Get categories error:', error);
      throw new CustomError('Failed to get categories', 500);
    }
  }

  // Get category by ID
  static async getCategoryById(categoryId: number): Promise<Category | null> {
    try {
      const connection = await pool.getConnection();
      const [categories] = await connection.execute(
        'SELECT * FROM categories WHERE id = ?',
        [categoryId]
      );

      connection.release();

      const categoryList = categories as Category[];
      return categoryList.length > 0 ? categoryList[0] : null;
    } catch (error) {
      logger.error('Get category by ID error:', error);
      throw new CustomError('Failed to get category', 500);
    }
  }

  // Create new category
  static async createCategory(categoryData: CreateCategoryRequest): Promise<Category> {
    try {
      const { name, description, image_url } = categoryData;

      const connection = await pool.getConnection();

      // Check if category with same name already exists
      const [existingCategories] = await connection.execute(
        'SELECT id FROM categories WHERE name = ?',
        [name]
      );

      if ((existingCategories as any[]).length > 0) {
        connection.release();
        throw new CustomError('Category with this name already exists', 409);
      }

      // Create category
      const [result] = await connection.execute(
        'INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)',
        [name, description || null, image_url || null]
      );

      const insertResult = result as any;
      const categoryId = insertResult.insertId;

      // Get created category
      const [newCategories] = await connection.execute(
        'SELECT * FROM categories WHERE id = ?',
        [categoryId]
      );

      connection.release();

      const newCategory = (newCategories as Category[])[0];
      logger.info(`New category created: ${newCategory.name}`);

      return newCategory;
    } catch (error) {
      logger.error('Create category error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create category', 500);
    }
  }

  // Update category
  static async updateCategory(categoryId: number, updateData: UpdateCategoryRequest): Promise<Category> {
    try {
      const connection = await pool.getConnection();

      // Check if category exists
      const [existingCategories] = await connection.execute(
        'SELECT id FROM categories WHERE id = ?',
        [categoryId]
      );

      if ((existingCategories as any[]).length === 0) {
        connection.release();
        throw new CustomError('Category not found', 404);
      }

      // Check if name is being updated and if it conflicts with existing category
      if (updateData.name) {
        const [nameCheck] = await connection.execute(
          'SELECT id FROM categories WHERE name = ? AND id != ?',
          [updateData.name, categoryId]
        );

        if ((nameCheck as any[]).length > 0) {
          connection.release();
          throw new CustomError('Category with this name already exists', 409);
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
      if (updateData.image_url !== undefined) {
        updateFields.push('image_url = ?');
        updateValues.push(updateData.image_url);
      }
      if (updateData.is_active !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(updateData.is_active);
      }

      if (updateFields.length === 0) {
        connection.release();
        throw new CustomError('No fields to update', 400);
      }

      updateValues.push(categoryId);

      await connection.execute(
        `UPDATE categories SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        updateValues
      );

      // Get updated category
      const [updatedCategories] = await connection.execute(
        'SELECT * FROM categories WHERE id = ?',
        [categoryId]
      );

      connection.release();

      const updatedCategory = (updatedCategories as Category[])[0];
      logger.info(`Category updated: ${updatedCategory.name}`);

      return updatedCategory;
    } catch (error) {
      logger.error('Update category error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update category', 500);
    }
  }

  // Delete category
  static async deleteCategory(categoryId: number): Promise<void> {
    try {
      const connection = await pool.getConnection();

      // Check if category exists
      const [existingCategories] = await connection.execute(
        'SELECT id FROM categories WHERE id = ?',
        [categoryId]
      );

      if ((existingCategories as any[]).length === 0) {
        connection.release();
        throw new CustomError('Category not found', 404);
      }

      // Check if category is used by any products
      const [products] = await connection.execute(
        'SELECT id FROM products WHERE category_id = ?',
        [categoryId]
      );

      if ((products as any[]).length > 0) {
        connection.release();
        throw new CustomError('Cannot delete category that has products', 400);
      }

      // Delete category
      await connection.execute('DELETE FROM categories WHERE id = ?', [categoryId]);

      connection.release();
      logger.info(`Category deleted: ID ${categoryId}`);
    } catch (error) {
      logger.error('Delete category error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete category', 500);
    }
  }
}
