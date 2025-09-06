import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { useCartActions } from '@/store/cartStore';
import { useAuth } from '@/store/authStore';
import { usePendingCartAction } from '@/hooks/usePendingCartAction';

const PublicLayout: React.FC = () => {
  const { loadCart } = useCartActions();
  const { isAuthenticated } = useAuth();

  // Handle pending cart actions after login
  usePendingCartAction();

  // Load cart when component mounts, but only if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    }
  }, [loadCart, isAuthenticated]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
