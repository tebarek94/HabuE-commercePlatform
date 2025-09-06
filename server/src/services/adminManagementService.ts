import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { CreateUserRequest, User, DatabaseUser } from '../types';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AdminManagementService {
  // Get all admin users
  static async getAllAdmins(): Promise<Omit<User, 'password'>[]> {
    try {
      const connection = await pool.getConnection();
      const [users] = await connection.execute(
        'SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at FROM users WHERE role = ? ORDER BY created_at DESC',
        ['admin']
      );

      connection.release();

      const userList = users as DatabaseUser[];
      return userList.map(user => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }));
    } catch (error) {
      logger.error('Get all admins error:', error);
      throw new CustomError('Failed to retrieve admin users', 500);
    }
  }

  // Create new admin user
  static async createAdmin(userData: CreateUserRequest): Promise<Omit<User, 'password'>> {
    try {
      const { email, password, first_name, last_name, phone } = userData;

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

      // Create admin user
      const [result] = await connection.execute(
        'INSERT INTO users (email, password, first_name, last_name, phone, role, is_active, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, first_name, last_name, phone || null, 'admin', 1, 1]
      );

      const insertResult = result as any;
      const userId = insertResult.insertId;

      // Get created admin user
      const [newUsers] = await connection.execute(
        'SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      connection.release();

      const newUser = (newUsers as DatabaseUser[])[0];
      const admin: Omit<User, 'password'> = {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        phone: newUser.phone,
        role: newUser.role,
        is_active: newUser.is_active,
        email_verified: newUser.email_verified,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      };

      logger.info(`New admin user created: ${admin.email}`);

      return admin;
    } catch (error) {
      logger.error('Create admin error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create admin user', 500);
    }
  }

  // Update admin user
  static async updateAdmin(userId: number, updateData: Partial<CreateUserRequest>): Promise<Omit<User, 'password'>> {
    try {
      const connection = await pool.getConnection();

      // Check if admin exists
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE id = ? AND role = ?',
        [userId, 'admin']
      );

      if ((existingUsers as any[]).length === 0) {
        connection.release();
        throw new CustomError('Admin user not found', 404);
      }

      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updateData.email !== undefined) {
        // Check if email is already taken by another user
        const [emailCheck] = await connection.execute(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [updateData.email, userId]
        );
        
        if ((emailCheck as any[]).length > 0) {
          connection.release();
          throw new CustomError('Email is already taken by another user', 409);
        }
        
        updateFields.push('email = ?');
        updateValues.push(updateData.email);
      }

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

      if (updateData.password !== undefined) {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);
        updateFields.push('password = ?');
        updateValues.push(hashedPassword);
      }

      if (updateFields.length === 0) {
        connection.release();
        throw new CustomError('No fields to update', 400);
      }

      updateValues.push(userId);

      await connection.execute(
        `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND role = 'admin'`,
        updateValues
      );

      // Get updated admin user
      const [users] = await connection.execute(
        'SELECT id, email, first_name, last_name, phone, role, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      connection.release();

      const userList = users as DatabaseUser[];
      if (userList.length === 0) {
        throw new CustomError('Admin user not found', 404);
      }

      const user = userList[0];
      logger.info(`Admin user updated: ${user.email}`);

      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    } catch (error) {
      logger.error('Update admin error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update admin user', 500);
    }
  }

  // Delete admin user
  static async deleteAdmin(userId: number): Promise<void> {
    try {
      const connection = await pool.getConnection();

      // Check if admin exists
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE id = ? AND role = ?',
        [userId, 'admin']
      );

      if ((existingUsers as any[]).length === 0) {
        connection.release();
        throw new CustomError('Admin user not found', 404);
      }

      // Delete admin user
      await connection.execute(
        'DELETE FROM users WHERE id = ? AND role = ?',
        [userId, 'admin']
      );

      connection.release();

      logger.info(`Admin user deleted: ID ${userId}`);
    } catch (error) {
      logger.error('Delete admin error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete admin user', 500);
    }
  }
}
