import React, { useState } from 'react';
import { Bell, Search, Menu, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/authStore';
import { useThemeActions } from '@/store/themeStore';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface AdminTopBarProps {
  onMenuClick: () => void;
}

const AdminTopBar: React.FC<AdminTopBarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { toggleTheme } = useThemeActions();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'New order received', time: '2 minutes ago', unread: true },
    { id: 2, message: 'Low stock alert for Roses', time: '1 hour ago', unread: true },
    { id: 3, message: 'Customer review received', time: '3 hours ago', unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left side */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Search */}
            <div className="hidden md:block ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hidden sm:flex"
            >
              <span className="sr-only">Toggle theme</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Profile */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Admin
                  </p>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Profile"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-medium">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {user?.first_name} {user?.last_name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
          
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              View Profile
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdminTopBar;
