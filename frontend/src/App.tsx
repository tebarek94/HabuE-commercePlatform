import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/store/authStore';

// Layouts
import AdminLayout from '@/components/layout/AdminLayout';
import ClientLayout from '@/components/layout/ClientLayout';
import PublicLayout from '@/components/layout/PublicLayout';

// Pages
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import LoginPage from '@/pages/LoginPage';
import ProfilePage from '@/pages/ProfilePage';
import OrdersPage from '@/pages/OrdersPage';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminUsers from '@/pages/admin/AdminUsers';
import RegisterPage from './pages/RegisterPage';
import ClientDashboard from '@/pages/ClientDashboard';
import WishlistPage from '@/pages/WishlistPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAuth?: boolean; requireAdmin?: boolean }> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Public Landing Page */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
          </Route>

          {/* Client Dashboard Routes */}
          <Route path="/dashboard" element={<ClientLayout />}>
            <Route index element={
              <ProtectedRoute>
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="wishlist" element={<WishlistPage />} />
            
            {/* Protected Client Routes */}
            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="admin-users" element={<AdminUsers />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000, // Default 5 seconds
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              duration: 4000, // Success messages show for 4 seconds
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              duration: 6000, // Error messages show for 6 seconds
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
            loading: {
              duration: Infinity, // Loading messages stay until dismissed
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;
