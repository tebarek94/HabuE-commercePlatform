import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../types';

// Custom error class
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Handle custom errors
  if (error instanceof CustomError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  }
  // Handle validation errors
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // Handle MySQL errors
  else if (error.name === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry';
  }
  else if (error.name === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referenced record not found';
  }
  // Handle multer errors
  else if (error.name === 'MulterError') {
    statusCode = 400;
    message = 'File upload error';
  }

  // Log error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: error.message,
      stack: error.stack,
    }),
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

// Validation error handler
export const handleValidationError = (errors: any[]): CustomError => {
  const message = errors.map(error => error.msg).join(', ');
  return new CustomError(message, 400);
};

// Database error handler
export const handleDatabaseError = (error: any): CustomError => {
  if (error.code === 'ER_DUP_ENTRY') {
    return new CustomError('Duplicate entry found', 409);
  }
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return new CustomError('Referenced record not found', 400);
  }
  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return new CustomError('Cannot delete referenced record', 400);
  }
  return new CustomError('Database operation failed', 500);
};
