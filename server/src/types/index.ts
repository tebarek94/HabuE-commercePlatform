import { Request } from 'express';

// User Types
export interface User {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'client' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  image_url?: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category_id: number;
  image_url?: string;
  stock_quantity: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  category_id?: number;
  image_url?: string;
  stock_quantity?: number;
  is_active?: boolean;
}

// Cart Types
export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface AddToCartRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Order Types
export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  billing_address?: string;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: Date;
}

export interface OrderWithItems extends Order {
  items: OrderItemWithProduct[];
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

export interface CreateOrderRequest {
  shipping_address: string;
  billing_address?: string;
  payment_method?: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// JWT Payload
export interface JwtPayload {
  userId: number;
  email: string;
  role: 'client' | 'admin';
  iat?: number;
  exp?: number;
}

// Request Types with Authentication
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Database Row Types
export interface DatabaseUser {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'client' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number | null;
  image_url: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseOrder {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  billing_address: string | null;
  payment_method: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// File Upload Types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Search and Filter Types
export interface ProductFilters {
  category_id?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
  is_active?: boolean;
}

export interface OrderFilters {
  status?: string;
  payment_status?: string;
  user_id?: number;
  date_from?: string;
  date_to?: string;
}
