import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';
import { JwtPayload, AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';

const JWT_SECRET: string = process.env.JWT_SECRET || 'fallback_secret_key';

// Generate JWT token
export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

// Generate refresh token
export const generateRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  } as jwt.SignOptions);
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    const decoded = verifyToken(token);
    
    // Verify user still exists and is active
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT id, email, role, is_active FROM users WHERE id = ? AND (is_active = true OR is_active IS NULL)',
      [decoded.userId]
    );
    connection.release();

    const users = rows as any[];
    if (users.length === 0) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
      return;
    }

    (req as any).user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Authorization middleware for admin only
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!(req as any).user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if ((req as any).user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
    return;
  }

  next();
};

// Authorization middleware for client only
export const requireClient = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!(req as any).user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if ((req as any).user.role !== 'client') {
    res.status(403).json({
      success: false,
      message: 'Client access required',
    });
    return;
  }

  next();
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      next();
      return;
    }

    const decoded = verifyToken(token);
    
    // Verify user still exists and is active
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT id, email, role, is_active FROM users WHERE id = ? AND is_active = true',
      [decoded.userId]
    );
    connection.release();

    const users = rows as any[];
    if (users.length > 0) {
      (req as any).user = decoded;
    }

    next();
  } catch (error) {
    // Don't fail on optional auth, just continue without user
    next();
  }
};

