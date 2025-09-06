import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { CustomError } from './errorHandler';

// Validation result handler
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new CustomError(errorMessages.join(', '), 400);
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true; // Allow empty phone numbers
      }
      // Basic phone validation - allow various formats
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),
  handleValidationErrors,
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

export const validateUserUpdate = [
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') {
        return true; // Allow empty phone numbers
      }
      // Basic phone validation - allow various formats
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),
  handleValidationErrors,
];

// Product validation rules
export const validateProductCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Product description must be between 10 and 1000 characters'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('category_id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('stock_quantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  handleValidationErrors,
];

export const validateProductUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Product name must be between 2 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Product description must be between 10 and 1000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('stock_quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  handleValidationErrors,
];

// Category validation rules
export const validateCategoryCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  handleValidationErrors,
];

// Cart validation rules
export const validateAddToCart = [
  body('product_id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  handleValidationErrors,
];

export const validateUpdateCartItem = [
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  handleValidationErrors,
];

// Order validation rules
export const validateOrderCreation = [
  body('shipping_address')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Shipping address must be between 10 and 500 characters'),
  body('billing_address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Billing address must be between 10 and 500 characters'),
  body('payment_method')
    .optional()
    .isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'])
    .withMessage('Invalid payment method'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  handleValidationErrors,
];

export const validateOrderStatusUpdate = [
  body('status')
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  handleValidationErrors,
];

// Parameter validation rules
export const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  handleValidationErrors,
];

// Query validation rules
export const validatePaginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['id', 'name', 'price', 'created_at', 'updated_at'])
    .withMessage('Invalid sort field'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc'),
  handleValidationErrors,
];

export const validateProductFilters = [
  query('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  query('min_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a non-negative number'),
  query('max_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a non-negative number'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  query('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  handleValidationErrors,
];
