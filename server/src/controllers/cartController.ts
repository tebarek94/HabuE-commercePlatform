import { Request, Response } from 'express';
import { CartService } from '../services/cartService';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class CartController {
  // Get user's cart items
  static async getCartItems(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const cartItems = await CartService.getCartItems(userId);
      
      res.json({
        success: true,
        data: cartItems,
        message: 'Cart items retrieved successfully'
      });
    } catch (error) {
      logger.error('Get cart items controller error:', error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  // Add item to cart
  static async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const { product_id, quantity } = req.body;

      if (!product_id || !quantity) {
        throw new CustomError('Product ID and quantity are required', 400);
      }

      if (quantity <= 0 || quantity > 100) {
        throw new CustomError('Quantity must be between 1 and 100', 400);
      }

      const cartItem = await CartService.addToCart(userId, { product_id, quantity });
      
      res.status(201).json({
        success: true,
        data: cartItem,
        message: 'Item added to cart successfully'
      });
    } catch (error) {
      logger.error('Add to cart controller error:', error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  // Update cart item quantity
  static async updateCartItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;

      if (!cartItemId || isNaN(cartItemId)) {
        throw new CustomError('Invalid cart item ID', 400);
      }

      if (!quantity || quantity <= 0 || quantity > 100) {
        throw new CustomError('Quantity must be between 1 and 100', 400);
      }

      const cartItem = await CartService.updateCartItem(userId, cartItemId, { quantity });
      
      res.json({
        success: true,
        data: cartItem,
        message: 'Cart item updated successfully'
      });
    } catch (error) {
      logger.error('Update cart item controller error:', error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  // Remove item from cart
  static async removeFromCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const cartItemId = parseInt(req.params.id);

      if (!cartItemId || isNaN(cartItemId)) {
        throw new CustomError('Invalid cart item ID', 400);
      }

      await CartService.removeFromCart(userId, cartItemId);
      
      res.json({
        success: true,
        message: 'Item removed from cart successfully'
      });
    } catch (error) {
      logger.error('Remove from cart controller error:', error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  // Clear user's cart
  static async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      await CartService.clearCart(userId);
      
      res.json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      logger.error('Clear cart controller error:', error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }

  // Get cart summary
  static async getCartSummary(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const summary = await CartService.getCartSummary(userId);
      
      res.json({
        success: true,
        data: summary,
        message: 'Cart summary retrieved successfully'
      });
    } catch (error) {
      logger.error('Get cart summary controller error:', error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      }
    }
  }
}
