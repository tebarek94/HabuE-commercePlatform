import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
  first_name: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters'),
  phone: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    // Basic phone validation - allow various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(val.replace(/[\s\-\(\)]/g, ''));
  }, {
    message: 'Please provide a valid phone number',
  }),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms of Service and Privacy Policy',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const profileUpdateSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters'),
  phone: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    // Basic phone validation - allow various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(val.replace(/[\s\-\(\)]/g, ''));
  }, {
    message: 'Please provide a valid phone number',
  }),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

// Product Schemas
export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(255, 'Product name must be less than 255 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category_id: z.number().min(1, 'Please select a category'),
  image_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  stock_quantity: z.number().min(0, 'Stock quantity must be 0 or greater'),
  is_active: z.boolean(),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100, 'Category name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  image_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

// Cart Schemas
export const addToCartSchema = z.object({
  product_id: z.number().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
});

// Checkout Schema
export const checkoutSchema = z.object({
  shipping_address: z.string().min(10, 'Shipping address must be at least 10 characters').max(500, 'Shipping address must be less than 500 characters'),
  billing_address: z.string().min(10, 'Billing address must be at least 10 characters').max(500, 'Billing address must be less than 500 characters').optional(),
  payment_method: z.enum(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'], {
    required_error: 'Please select a payment method',
  }),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

// Search Schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters'),
});

// Filter Schemas
export const productFiltersSchema = z.object({
  category_id: z.number().optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  search: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const orderFiltersSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  user_id: z.number().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

// Type exports for form handling
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type AddToCartFormData = z.infer<typeof addToCartSchema>;
export type UpdateCartItemFormData = z.infer<typeof updateCartItemSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type ProductFiltersFormData = z.infer<typeof productFiltersSchema>;
export type OrderFiltersFormData = z.infer<typeof orderFiltersSchema>;
