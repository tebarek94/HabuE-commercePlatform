import { pool } from '../config/database';
import { CartItem, CartItemWithProduct, Product } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export class CartService {
  // Get user's cart items with product details
  static async getCartItems(userId: number): Promise<CartItemWithProduct[]> {
    try {
      const connection = await pool.getConnection();
      
      const [cartItems] = await connection.execute(`
        SELECT 
          ci.id,
          ci.user_id,
          ci.product_id,
          ci.quantity,
          ci.created_at,
          ci.updated_at,
          p.name as product_name,
          p.description as product_description,
          p.price as product_price,
          p.image_url as product_image_url,
          p.stock_quantity as product_stock_quantity,
          p.is_active as product_is_active,
          p.category_id as product_category_id,
          p.created_at as product_created_at,
          p.updated_at as product_updated_at
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ? AND p.is_active = true
        ORDER BY ci.created_at DESC
      `, [userId]);

      connection.release();

      const items = (cartItems as any[]).map(row => ({
        id: row.id,
        user_id: row.user_id,
        product_id: row.product_id,
        quantity: row.quantity,
        created_at: row.created_at,
        updated_at: row.updated_at,
        product: {
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          price: parseFloat(row.product_price),
          image_url: row.product_image_url,
          stock_quantity: row.product_stock_quantity,
          is_active: row.product_is_active,
          category_id: row.product_category_id,
          created_at: row.product_created_at,
          updated_at: row.product_updated_at,
        } as Product
      }));

      return items;
    } catch (error) {
      logger.error('Get cart items error:', error);
      throw new CustomError('Failed to get cart items', 500);
    }
  }

  // Add item to cart
  static async addToCart(userId: number, cartData: AddToCartRequest): Promise<CartItemWithProduct> {
    try {
      const { product_id, quantity } = cartData;

      const connection = await pool.getConnection();

      // Check if product exists and is active
      const [products] = await connection.execute(
        'SELECT * FROM products WHERE id = ? AND is_active = true',
        [product_id]
      );

      if ((products as any[]).length === 0) {
        connection.release();
        throw new CustomError('Product not found or inactive', 404);
      }

      const product = (products as any[])[0];

      // Check stock availability
      if (product.stock_quantity < quantity) {
        connection.release();
        throw new CustomError('Insufficient stock available', 400);
      }

      // Check if item already exists in cart
      const [existingItems] = await connection.execute(
        'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
        [userId, product_id]
      );

      if ((existingItems as any[]).length > 0) {
        // Update existing item quantity
        const existingItem = (existingItems as any[])[0];
        const newQuantity = existingItem.quantity + quantity;

        if (product.stock_quantity < newQuantity) {
          connection.release();
          throw new CustomError('Insufficient stock available', 400);
        }

        await connection.execute(
          'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [newQuantity, existingItem.id]
        );

        // Get updated item with product details
        const [updatedItems] = await connection.execute(`
          SELECT 
            ci.id,
            ci.user_id,
            ci.product_id,
            ci.quantity,
            ci.created_at,
            ci.updated_at,
            p.name as product_name,
            p.description as product_description,
            p.price as product_price,
            p.image_url as product_image_url,
            p.stock_quantity as product_stock_quantity,
            p.is_active as product_is_active,
            p.category_id as product_category_id,
            p.created_at as product_created_at,
            p.updated_at as product_updated_at
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.id = ?
        `, [existingItem.id]);

        connection.release();

        const updatedItem = (updatedItems as any[])[0];
        return {
          id: updatedItem.id,
          user_id: updatedItem.user_id,
          product_id: updatedItem.product_id,
          quantity: updatedItem.quantity,
          created_at: updatedItem.created_at,
          updated_at: updatedItem.updated_at,
          product: {
            id: updatedItem.product_id,
            name: updatedItem.product_name,
            description: updatedItem.product_description,
            price: parseFloat(updatedItem.product_price),
            image_url: updatedItem.product_image_url,
            stock_quantity: updatedItem.product_stock_quantity,
            is_active: updatedItem.product_is_active,
            category_id: updatedItem.product_category_id,
            created_at: updatedItem.product_created_at,
            updated_at: updatedItem.product_updated_at,
          } as Product
        };
      } else {
        // Add new item to cart
        const [result] = await connection.execute(
          'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, product_id, quantity]
        );

        const insertResult = result as any;
        const cartItemId = insertResult.insertId;

        // Get created item with product details
        const [newItems] = await connection.execute(`
          SELECT 
            ci.id,
            ci.user_id,
            ci.product_id,
            ci.quantity,
            ci.created_at,
            ci.updated_at,
            p.name as product_name,
            p.description as product_description,
            p.price as product_price,
            p.image_url as product_image_url,
            p.stock_quantity as product_stock_quantity,
            p.is_active as product_is_active,
            p.category_id as product_category_id,
            p.created_at as product_created_at,
            p.updated_at as product_updated_at
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.id = ?
        `, [cartItemId]);

        connection.release();

        const newItem = (newItems as any[])[0];
        logger.info(`Item added to cart: Product ${product_id}, Quantity ${quantity}, User ${userId}`);

        return {
          id: newItem.id,
          user_id: newItem.user_id,
          product_id: newItem.product_id,
          quantity: newItem.quantity,
          created_at: newItem.created_at,
          updated_at: newItem.updated_at,
          product: {
            id: newItem.product_id,
            name: newItem.product_name,
            description: newItem.product_description,
            price: parseFloat(newItem.product_price),
            image_url: newItem.product_image_url,
            stock_quantity: newItem.product_stock_quantity,
            is_active: newItem.product_is_active,
            category_id: newItem.product_category_id,
            created_at: newItem.product_created_at,
            updated_at: newItem.product_updated_at,
          } as Product
        };
      }
    } catch (error) {
      logger.error('Add to cart error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to add item to cart', 500);
    }
  }

  // Update cart item quantity
  static async updateCartItem(userId: number, cartItemId: number, updateData: UpdateCartItemRequest): Promise<CartItemWithProduct> {
    try {
      const { quantity } = updateData;

      const connection = await pool.getConnection();

      // Check if cart item exists and belongs to user
      const [existingItems] = await connection.execute(
        'SELECT * FROM cart_items WHERE id = ? AND user_id = ?',
        [cartItemId, userId]
      );

      if ((existingItems as any[]).length === 0) {
        connection.release();
        throw new CustomError('Cart item not found', 404);
      }

      // Check stock availability
      const [products] = await connection.execute(
        'SELECT stock_quantity FROM products WHERE id = (SELECT product_id FROM cart_items WHERE id = ?)',
        [cartItemId]
      );

      if ((products as any[]).length === 0) {
        connection.release();
        throw new CustomError('Product not found', 404);
      }

      const product = (products as any[])[0];
      if (product.stock_quantity < quantity) {
        connection.release();
        throw new CustomError('Insufficient stock available', 400);
      }

      // Update cart item
      await connection.execute(
        'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [quantity, cartItemId]
      );

      // Get updated item with product details
      const [updatedItems] = await connection.execute(`
        SELECT 
          ci.id,
          ci.user_id,
          ci.product_id,
          ci.quantity,
          ci.created_at,
          ci.updated_at,
          p.name as product_name,
          p.description as product_description,
          p.price as product_price,
          p.image_url as product_image_url,
          p.stock_quantity as product_stock_quantity,
          p.is_active as product_is_active,
          p.category_id as product_category_id,
          p.created_at as product_created_at,
          p.updated_at as product_updated_at
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.id = ?
      `, [cartItemId]);

      connection.release();

      const updatedItem = (updatedItems as any[])[0];
      logger.info(`Cart item updated: ID ${cartItemId}, Quantity ${quantity}`);

      return {
        id: updatedItem.id,
        user_id: updatedItem.user_id,
        product_id: updatedItem.product_id,
        quantity: updatedItem.quantity,
        created_at: updatedItem.created_at,
        updated_at: updatedItem.updated_at,
        product: {
          id: updatedItem.product_id,
          name: updatedItem.product_name,
          description: updatedItem.product_description,
          price: parseFloat(updatedItem.product_price),
          image_url: updatedItem.product_image_url,
          stock_quantity: updatedItem.product_stock_quantity,
          is_active: updatedItem.product_is_active,
          category_id: updatedItem.product_category_id,
          created_at: updatedItem.product_created_at,
          updated_at: updatedItem.product_updated_at,
        } as Product
      };
    } catch (error) {
      logger.error('Update cart item error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update cart item', 500);
    }
  }

  // Remove item from cart
  static async removeFromCart(userId: number, cartItemId: number): Promise<void> {
    try {
      const connection = await pool.getConnection();

      // Check if cart item exists and belongs to user
      const [existingItems] = await connection.execute(
        'SELECT * FROM cart_items WHERE id = ? AND user_id = ?',
        [cartItemId, userId]
      );

      if ((existingItems as any[]).length === 0) {
        connection.release();
        throw new CustomError('Cart item not found', 404);
      }

      // Remove cart item
      await connection.execute(
        'DELETE FROM cart_items WHERE id = ?',
        [cartItemId]
      );

      connection.release();
      logger.info(`Cart item removed: ID ${cartItemId}, User ${userId}`);
    } catch (error) {
      logger.error('Remove from cart error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to remove item from cart', 500);
    }
  }

  // Clear user's cart
  static async clearCart(userId: number): Promise<void> {
    try {
      const connection = await pool.getConnection();

      await connection.execute(
        'DELETE FROM cart_items WHERE user_id = ?',
        [userId]
      );

      connection.release();
      logger.info(`Cart cleared for user: ${userId}`);
    } catch (error) {
      logger.error('Clear cart error:', error);
      throw new CustomError('Failed to clear cart', 500);
    }
  }

  // Get cart summary (total items and price)
  static async getCartSummary(userId: number): Promise<{ totalItems: number; totalPrice: number }> {
    try {
      const connection = await pool.getConnection();

      const [summary] = await connection.execute(`
        SELECT 
          SUM(ci.quantity) as total_items,
          SUM(ci.quantity * p.price) as total_price
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ? AND p.is_active = true
      `, [userId]);

      connection.release();

      const result = (summary as any[])[0];
      return {
        totalItems: result.total_items || 0,
        totalPrice: parseFloat(result.total_price) || 0,
      };
    } catch (error) {
      logger.error('Get cart summary error:', error);
      throw new CustomError('Failed to get cart summary', 500);
    }
  }
}
