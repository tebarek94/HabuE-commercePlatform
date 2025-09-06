import { pool } from '../config/database';
import { User, CreateUserRequest, PaginationQuery, PaginationInfo } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: 'client' | 'admin';
  is_active?: boolean;
  email_verified?: boolean;
}

export class UserService {
  // Get all users with pagination (Admin only)
  static async getAllUsers(
    pagination: PaginationQuery = {}
  ): Promise<{ users: Omit<User, 'password'>[]; pagination: PaginationInfo }> {
    try {
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const offset = (page - 1) * limit;
      const sort = pagination.sort || 'created_at';
      const order = pagination.order || 'desc';

      // Get total count
      const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
      const total = (countResult as any[])[0].total;

      // Get users (excluding password)
      const [users] = await pool.execute(`
        SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at
        FROM users
        ORDER BY ${sort} ${order.toUpperCase()}
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      const totalPages = Math.ceil(total / limit);

      return {
        users: users as Omit<User, 'password'>[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('Get all users error:', error);
      throw new CustomError('Failed to get users', 500);
    }
  }

  // Get user by ID (Admin only)
  static async getUserById(userId: number): Promise<Omit<User, 'password'> | null> {
    try {
      const connection = await pool.getConnection();
      const [users] = await connection.execute(`
        SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at
        FROM users
        WHERE id = ?
      `, [userId]);

      connection.release();

      const userList = users as Omit<User, 'password'>[];
      return userList.length > 0 ? userList[0]! : null;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw new CustomError('Failed to get user', 500);
    }
  }

  // Create new user (Admin only)
  static async createUser(userData: CreateUserRequest): Promise<Omit<User, 'password'>> {
    try {
      const { email, password, first_name, last_name, phone } = userData;

      const connection = await pool.getConnection();

      // Check if user with same email already exists
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if ((existingUsers as any[]).length > 0) {
        connection.release();
        throw new CustomError('User with this email already exists', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const [result] = await connection.execute(
        'INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, first_name, last_name, phone || null, 'client']
      );

      const insertResult = result as any;
      const newUserId = insertResult.insertId;

      // Get created user (excluding password)
      const [newUsers] = await connection.execute(`
        SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at
        FROM users
        WHERE id = ?
      `, [newUserId]);

      connection.release();

      const newUser = (newUsers as Omit<User, 'password'>[])[0]!;
      logger.info(`New user created: ${newUser.email}`);

      return newUser;
    } catch (error) {
      logger.error('Create user error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create user', 500);
    }
  }

  // Update user (Admin only)
  static async updateUser(userId: number, updateData: UpdateUserRequest): Promise<Omit<User, 'password'>> {
    try {
      const connection = await pool.getConnection();

      // Check if user exists
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE id = ?',
        [userId]
      );

      if ((existingUsers as any[]).length === 0) {
        connection.release();
        throw new CustomError('User not found', 404);
      }

      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updateData.first_name !== undefined) {
        updateFields.push('first_name = ?');
        updateValues.push(updateData.first_name);
      }
      if (updateData.last_name !== undefined) {
        updateFields.push('last_name = ?');
        updateValues.push(updateData.last_name);
      }
      if (updateData.phone !== undefined) {
        updateFields.push('phone = ?');
        updateValues.push(updateData.phone);
      }
      if (updateData.role !== undefined) {
        updateFields.push('role = ?');
        updateValues.push(updateData.role);
      }
      if (updateData.is_active !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(updateData.is_active);
      }
      if (updateData.email_verified !== undefined) {
        updateFields.push('email_verified = ?');
        updateValues.push(updateData.email_verified);
      }

      if (updateFields.length === 0) {
        connection.release();
        throw new CustomError('No fields to update', 400);
      }

      updateValues.push(userId);

      await connection.execute(
        `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        updateValues
      );

      // Get updated user (excluding password)
      const [updatedUsers] = await connection.execute(`
        SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at
        FROM users
        WHERE id = ?
      `, [userId]);

      connection.release();

      const updatedUser = (updatedUsers as Omit<User, 'password'>[])[0]!;
      logger.info(`User updated: ${updatedUser.email}`);

      return updatedUser;
    } catch (error) {
      logger.error('Update user error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update user', 500);
    }
  }

  // Delete user (Admin only)
  static async deleteUser(userId: number): Promise<void> {
    try {
      const connection = await pool.getConnection();

      // Check if user exists
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE id = ?',
        [userId]
      );

      if ((existingUsers as any[]).length === 0) {
        connection.release();
        throw new CustomError('User not found', 404);
      }

      // Check if user has any orders
      const [orders] = await connection.execute(
        'SELECT id FROM orders WHERE user_id = ?',
        [userId]
      );

      if ((orders as any[]).length > 0) {
        connection.release();
        throw new CustomError('Cannot delete user that has orders', 400);
      }

      // Delete user
      await connection.execute('DELETE FROM users WHERE id = ?', [userId]);

      connection.release();
      logger.info(`User deleted: ID ${userId}`);
    } catch (error) {
      logger.error('Delete user error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete user', 500);
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    clientUsers: number;
    verifiedUsers: number;
  }> {
    try {
      const connection = await pool.getConnection();

      const [stats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
          COUNT(CASE WHEN role = 'client' THEN 1 END) as client_users,
          COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users
        FROM users
      `);

      connection.release();

      const result = (stats as any[])[0];
      return {
        totalUsers: result.total_users,
        activeUsers: result.active_users,
        adminUsers: result.admin_users,
        clientUsers: result.client_users,
        verifiedUsers: result.verified_users,
      };
    } catch (error) {
      logger.error('Get user stats error:', error);
      throw new CustomError('Failed to get user statistics', 500);
    }
  }
}
