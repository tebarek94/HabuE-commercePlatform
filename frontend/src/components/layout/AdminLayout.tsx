import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import { useAuth } from '@/store/authStore';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <AdminTopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 py-6 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
