import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ClientSidebar from './ClientSidebar';
import ClientTopBar from './ClientTopBar';
import { useCartActions } from '@/store/cartStore';
import { useAuth } from '@/store/authStore';
import { usePendingCartAction } from '@/hooks/usePendingCartAction';

const ClientLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <ClientSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <ClientTopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}
    </div>
  );
};

export default ClientLayout;