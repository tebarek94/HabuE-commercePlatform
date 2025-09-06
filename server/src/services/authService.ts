import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { generateToken, generateRefreshToken } from '../middleware/auth';
import { CreateUserRequest, LoginRequest, AuthResponse, User, DatabaseUser } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AuthService {
  // Register a new user
  static async register(userData: CreateUserRequest): Promise<AuthResponse> {
    try {
      const { email, password, first_name, last_name, phone, role } = userData;

      // Check if user already exists
      const connection = await pool.getConnection();
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if ((existingUsers as any[]).length > 0) {
        connection.release();
        throw new CustomError('User with this email already exists', 409);
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const [result] = await connection.execute(
        'INSERT INTO users (email, password, first_name, last_name, phone, role, is_active, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, first_name, last_name, phone || null, role || 'client', true, false]
      );

      const insertResult = result as any;
      const userId = insertResult.insertId;

      // Get created user
      const [newUsers] = await connection.execute(
        'SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      connection.release();

      const newUser = (newUsers as DatabaseUser[])[0];
      if (!newUser) {
        throw new CustomError('Failed to create user', 500);
      }
      
      const user: Omit<User, 'password'> = {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        ...(newUser.phone && { phone: newUser.phone }),
        role: newUser.role,
        is_active: newUser.is_active,
        email_verified: newUser.email_verified,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      };

      // Generate tokens
      const token = generateToken({ userId: user.id, email: user.email, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

      logger.info(`New user registered: ${user.email}`);

      return {
        user,
        token,
        refreshToken,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Registration failed', 500);
    }
  }

  // Login user
  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      const { email, password } = loginData;

      const connection = await pool.getConnection();
      const [users] = await connection.execute(
        'SELECT id, email, password, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at FROM users WHERE email = ?',
        [email]
      );

      connection.release();

      const userList = users as DatabaseUser[];
      if (userList.length === 0) {
        throw new CustomError('Invalid email or password', 401);
      }

      const user = userList[0];
      if (!user) {
        throw new CustomError('Invalid email or password', 401);
      }

      if (!user.is_active) {
        throw new CustomError('Account is deactivated', 401);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new CustomError('Invalid email or password', 401);
      }

      const userResponse: Omit<User, 'password'> = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        ...(user.phone && { phone: user.phone }),
        role: user.role,
        is_active: user.is_active,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      // Generate tokens
      const token = generateToken({ userId: user.id, email: user.email, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

      logger.info(`User logged in: ${user.email}`);

      return {
        user: userResponse,
        token,
        refreshToken,
      };
    } catch (error) {
      logger.error('Login error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Login failed', 500);
    }
  }

  // Get user by ID
  static async getUserById(userId: number): Promise<Omit<User, 'password'> | null> {
    try {
      const connection = await pool.getConnection();
      const [users] = await connection.execute(
        'SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      connection.release();

      const userList = users as DatabaseUser[];
      if (userList.length === 0) {
        return null;
      }

      const user = userList[0];
      if (!user) {
        return null;
      }
      
      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        ...(user.phone && { phone: user.phone }),
        role: user.role,
        is_active: user.is_active,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw new CustomError('Failed to get user', 500);
    }
  }

  // Update user profile
  static async updateUser(userId: number, updateData: Partial<CreateUserRequest>): Promise<Omit<User, 'password'>> {
    try {
      const connection = await pool.getConnection();

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

      if (updateFields.length === 0) {
        connection.release();
        throw new CustomError('No fields to update', 400);
      }

      updateValues.push(userId);

      await connection.execute(
        `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        updateValues
      );

      // Get updated user
      const [users] = await connection.execute(
        'SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      connection.release();

      const userList = users as DatabaseUser[];
      if (userList.length === 0) {
        throw new CustomError('User not found', 404);
      }

      const user = userList[0];
      if (!user) {
        throw new CustomError('User not found', 404);
      }
      
      logger.info(`User profile updated: ${user.email}`);

      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        ...(user.phone && { phone: user.phone }),
        role: user.role,
        is_active: user.is_active,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    } catch (error) {
      logger.error('Update user error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update user', 500);
    }
  }

  // Change password
  static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const connection = await pool.getConnection();
      
      try {
        const [users] = await connection.execute(
          'SELECT password FROM users WHERE id = ?',
          [userId]
        );

        const userList = users as any[];
        if (userList.length === 0) {
          throw new CustomError('User not found', 404);
        }

        const user = userList[0];

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
          throw new CustomError('Current password is incorrect', 400);
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await connection.execute(
          'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [hashedNewPassword, userId]
        );

        logger.info(`Password changed for user ID: ${userId}`);
      } finally {
        connection.release();
      }
    } catch (error) {
      logger.error('Change password error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to change password', 500);
    }
  }
}
