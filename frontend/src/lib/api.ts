import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from Zustand persist storage
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Only logout if this is not a login/register request
      const isAuthRequest = error.config?.url?.includes('/auth/login') || 
                           error.config?.url?.includes('/auth/register');
      
      if (!isAuthRequest) {
        console.log('401 Unauthorized - clearing auth state');
        // Token expired or invalid - clear Zustand storage
        localStorage.removeItem('auth-storage');
        // Redirect to login only if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else {
        console.log('401 on auth request - not clearing state');
      }
    }
    
    // Log network errors for debugging
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Generic API response handler
function handleApiResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (response.data.success) {
    return response.data.data as T;
  }
  throw new Error(response.data.message || 'Request failed. Please try again.');
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse>('/auth/login', { email, password });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Login failed. Please try again.');
  },

  register: async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => {
    const response = await api.post<ApiResponse>('/auth/register', userData);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Registration failed. Please try again.');
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse>('/auth/profile');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to get profile.');
  },

  updateProfile: async (userData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) => {
    const response = await api.put<ApiResponse>('/auth/profile', userData);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update profile.');
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post<ApiResponse>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to change password.');
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<ApiResponse>('/auth/refresh', { refreshToken });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to refresh token.');
  },
};

// Client Products API (for viewing products only)
export const clientProductsApi = {
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category_id?: number;
    min_price?: number;
    max_price?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => {
    const response = await api.get<ApiResponse>('/client/products', { params });
    if (response.data.success) {
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    }
    throw new Error(response.data.message || 'Request failed. Please try again.');
  },

  getProduct: async (id: number) => {
    const response = await api.get<ApiResponse>(`/client/products/${id}`);
    return handleApiResponse(response);
  },

  searchProducts: async (query: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<ApiResponse>('/client/products/search', {
      params: { q: query, ...params },
    });
    return handleApiResponse(response);
  },

  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get<ApiResponse>('/client/products/featured', {
      params: { limit },
    });
    if (response.data.success) {
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    }
    throw new Error(response.data.message || 'Request failed. Please try again.');
  },

  getProductsByCategory: async (categoryId: number, params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<ApiResponse>(`/client/products/category/${categoryId}`, { params });
    if (response.data.success) {
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    }
    throw new Error(response.data.message || 'Request failed. Please try again.');
  },
};

// Categories API
export const categoriesApi = {
  getCategories: async () => {
    const response = await api.get<ApiResponse>('/admin/categories');
    return handleApiResponse(response);
  },

  createCategory: async (categoryData: {
    name: string;
    description?: string;
    image_url?: string;
  }) => {
    const response = await api.post<ApiResponse>('/admin/categories', categoryData);
    return handleApiResponse(response);
  },

  updateCategory: async (id: number, categoryData: {
    name?: string;
    description?: string;
    image_url?: string;
    is_active?: boolean;
  }) => {
    const response = await api.put<ApiResponse>(`/admin/categories/${id}`, categoryData);
    return handleApiResponse(response);
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/admin/categories/${id}`);
    return handleApiResponse(response);
  },
};

// Cart API
export const cartApi = {
  getCart: async () => {
    const response = await api.get<ApiResponse>('/cart');
    return handleApiResponse(response);
  },

  addToCart: async (productId: number, quantity: number) => {
    const response = await api.post<ApiResponse>('/cart', {
      product_id: productId,
      quantity,
    });
    return handleApiResponse(response);
  },

  updateCartItem: async (itemId: number, quantity: number) => {
    const response = await api.put<ApiResponse>(`/cart/${itemId}`, { quantity });
    return handleApiResponse(response);
  },

  removeFromCart: async (itemId: number) => {
    const response = await api.delete<ApiResponse>(`/cart/${itemId}`);
    return handleApiResponse(response);
  },

  clearCart: async () => {
    const response = await api.delete<ApiResponse>('/cart/clear');
    return handleApiResponse(response);
  },

  getCartSummary: async () => {
    const response = await api.get<ApiResponse>('/cart/summary');
    return handleApiResponse(response);
  },
};

// Client Orders API (for client order management)
export const clientOrdersApi = {
  getOrders: async () => {
    const response = await api.get<ApiResponse>('/client/orders');
    return handleApiResponse(response);
  },

  getOrder: async (id: number) => {
    const response = await api.get<ApiResponse>(`/client/orders/${id}`);
    return handleApiResponse(response);
  },

  createOrder: async (orderData: {
    shipping_address: string;
    billing_address?: string;
    payment_method?: string;
    notes?: string;
    items: { product_id: number; quantity: number; price: number; }[];
  }) => {
    const response = await api.post<ApiResponse>('/client/orders', orderData);
    return handleApiResponse(response);
  },

  cancelOrder: async (id: number) => {
    const response = await api.patch<ApiResponse>(`/client/orders/${id}/cancel`);
    return handleApiResponse(response);
  },
};

// Admin API
export const adminApi = {
  getDashboard: async () => {
    const response = await api.get<ApiResponse>('/admin/dashboard');
    return handleApiResponse(response);
  },

  getAnalytics: async (period?: 'day' | 'week' | 'month' | 'year') => {
    const response = await api.get<ApiResponse>('/admin/analytics', {
      params: { period },
    });
    return handleApiResponse(response);
  },

  getRecentOrders: async (limit = 5) => {
    const response = await api.get<ApiResponse>('/admin/dashboard/recent-orders', {
      params: { limit },
    });
    return handleApiResponse(response);
  },

  getTopProducts: async (limit = 5) => {
    const response = await api.get<ApiResponse>('/admin/dashboard/top-products', {
      params: { limit },
    });
    return handleApiResponse(response);
  },

  getCategoryPerformance: async () => {
    const response = await api.get<ApiResponse>('/admin/dashboard/category-performance');
    return handleApiResponse(response);
  },

  getRecentActivity: async (limit = 10) => {
    const response = await api.get<ApiResponse>('/admin/dashboard/recent-activity', {
      params: { limit },
    });
    return handleApiResponse(response);
  },

  // Categories CRUD
  getCategories: async () => {
    const response = await api.get<ApiResponse>('/admin/categories');
    return handleApiResponse(response);
  },

  createCategory: async (categoryData: any) => {
    const response = await api.post<ApiResponse>('/admin/categories', categoryData);
    return handleApiResponse(response);
  },

  updateCategory: async (id: number, categoryData: any) => {
    const response = await api.put<ApiResponse>(`/admin/categories/${id}`, categoryData);
    return handleApiResponse(response);
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/admin/categories/${id}`);
    return handleApiResponse(response);
  },

  // Orders CRUD
  getAllOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    payment_status?: string;
    user_id?: number;
    date_from?: string;
    date_to?: string;
  }) => {
    const response = await api.get<ApiResponse>('/admin/orders', { params });
    return handleApiResponse(response);
  },

  getOrderById: async (id: number) => {
    const response = await api.get<ApiResponse>(`/admin/orders/${id}`);
    return handleApiResponse(response);
  },

  updateOrderStatus: async (id: number, status: string) => {
    const response = await api.patch<ApiResponse>(`/admin/orders/${id}/status`, { status });
    return handleApiResponse(response);
  },

  updatePaymentStatus: async (id: number, payment_status: string) => {
    const response = await api.patch<ApiResponse>(`/admin/orders/${id}/payment-status`, { payment_status });
    return handleApiResponse(response);
  },

  getOrderStats: async () => {
    const response = await api.get<ApiResponse>('/admin/orders/stats');
    return handleApiResponse(response);
  },

  getOrderHistory: async (id: number) => {
    const response = await api.get<ApiResponse>(`/admin/orders/${id}/history`);
    return handleApiResponse(response);
  },

  getOrderAnalytics: async (params?: {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
  }) => {
    const response = await api.get<ApiResponse>('/admin/orders/analytics', { params });
    return handleApiResponse(response);
  },

  // Products CRUD (Admin)
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category_id?: number;
    min_price?: number;
    max_price?: number;
    search?: string;
    is_active?: boolean;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => {
    const response = await api.get<ApiResponse>('/admin/products', { params });
    if (response.data.success) {
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    }
    throw new Error(response.data.message || 'Request failed. Please try again.');
  },

  getProduct: async (id: number) => {
    const response = await api.get<ApiResponse>(`/admin/products/${id}`);
    return handleApiResponse(response);
  },

  createProduct: async (productData: {
    name: string;
    description: string;
    price: number;
    category_id: number;
    image_url?: string;
    stock_quantity: number;
    is_active?: boolean;
  }) => {
    const response = await api.post<ApiResponse>('/admin/products', productData);
    return handleApiResponse(response);
  },

  createProductWithImage: async (formData: FormData) => {
    const response = await api.post<ApiResponse>('/admin/products/with-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return handleApiResponse(response);
  },

  updateProduct: async (id: number, productData: {
    name?: string;
    description?: string;
    price?: number;
    category_id?: number;
    image_url?: string;
    stock_quantity?: number;
    is_active?: boolean;
  }) => {
    const response = await api.put<ApiResponse>(`/admin/products/${id}`, productData);
    return handleApiResponse(response);
  },

  updateProductWithImage: async (id: number, formData: FormData) => {
    const response = await api.put<ApiResponse>(`/admin/products/${id}/with-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return handleApiResponse(response);
  },

  deleteProduct: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/admin/products/${id}`);
    return handleApiResponse(response);
  },

  updateProductStock: async (id: number, quantity: number) => {
    const response = await api.patch<ApiResponse>(`/admin/products/${id}/stock`, { quantity });
    return handleApiResponse(response);
  },

  // Users CRUD
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<ApiResponse>('/users', { params });
    return handleApiResponse(response);
  },

  getUserById: async (id: number) => {
    const response = await api.get<ApiResponse>(`/users/${id}`);
    return handleApiResponse(response);
  },

  createUser: async (userData: any) => {
    const response = await api.post<ApiResponse>('/users', userData);
    return handleApiResponse(response);
  },

  updateUser: async (id: number, userData: any) => {
    const response = await api.put<ApiResponse>(`/users/${id}`, userData);
    return handleApiResponse(response);
  },

  deleteUser: async (id: number) => {
    const response = await api.delete<ApiResponse>(`/users/${id}`);
    return handleApiResponse(response);
  },

  updateUserStatus: async (id: number, isActive: boolean) => {
    const endpoint = isActive ? `/users/${id}/activate` : `/users/${id}/deactivate`;
    const response = await api.patch<ApiResponse>(endpoint);
    return handleApiResponse(response);
  },

  updateUserRole: async (id: number, role: 'client' | 'admin') => {
    const response = await api.patch<ApiResponse>(`/users/${id}/role`, { role });
    return handleApiResponse(response);
  },
};

export default api;
