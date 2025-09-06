import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  UserCog,
  Shield,
  Database,
  FileText,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { useAuthActions } from '@/store/authStore';
import Button from '@/components/ui/Button';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { logout } = useAuthActions();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and key metrics',
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: Package,
      description: 'Manage product catalog',
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: Tag,
      description: 'Manage product categories',
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      description: 'Order management',
    },
    {
      name: 'Customers',
      href: '/admin/customers',
      icon: Users,
      description: 'Customer accounts',
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Reports and insights',
    },
    {
      name: 'Admin Users',
      href: '/admin/admin-users',
      icon: UserCog,
      description: 'Manage admin accounts',
    },
    {
      name: 'System Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'System configuration',
    },
    {
      name: 'Database',
      href: '/admin/database',
      icon: Database,
      description: 'Database management',
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: FileText,
      description: 'Generate reports',
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
      description: 'System notifications',
    },
    {
      name: 'Help & Support',
      href: '/admin/help',
      icon: HelpCircle,
      description: 'Documentation and support',
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              FlowerShop
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-start px-3 py-3 text-sm font-medium rounded-lg transition-colors group',
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
                onClick={() => {
                  // Close mobile menu when navigating
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
              >
                <Icon className={cn(
                  'mr-3 h-5 w-5 mt-0.5 flex-shrink-0',
                  isActive ? 'text-primary-600 dark:text-primary-300' : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.name}</div>
                  <div className={cn(
                    'text-xs mt-0.5 truncate',
                    isActive 
                      ? 'text-primary-600 dark:text-primary-300' 
                      : 'text-gray-500 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300'
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
