import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingBag, 
  ShoppingCart, 
  Package, 
  User, 
  Heart,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useCart } from '@/store/cartStore';
import CartIcon from '@/components/cart/CartIcon';

interface ClientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClientSidebar: React.FC<ClientSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuthStore();
  const { totalItems, totalPrice } = useCart();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Cart', href: '/cart', icon: ShoppingCart },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 shadow-xl border-r border-purple-200 dark:border-gray-700">
          {/* Logo */}
          <div className="flex h-20 flex-shrink-0 items-center px-6 border-b border-purple-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-pink-600">
            <Link to="/dashboard" className="flex items-center">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">🌸</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-white">
                FlowerStore
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="space-y-2 px-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 transform hover:scale-105',
                      isActive
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                        : 'text-gray-700 hover:bg-white/60 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-purple-300'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-4 h-6 w-6 flex-shrink-0 transition-colors',
                        isActive
                          ? 'text-white'
                          : 'text-purple-500 group-hover:text-purple-600 dark:text-purple-400 dark:group-hover:text-purple-300'
                      )}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.name === 'Cart' && totalItems > 0 && (
                      <div className="ml-auto flex items-center">
                        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                          {totalItems > 99 ? '99+' : totalItems}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Cart Summary */}
          {totalItems > 0 && (
            <div className="border-t border-purple-200 dark:border-gray-700 p-6">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-purple-800 dark:text-purple-200">
                    🛒 Cart Summary
                  </span>
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-full">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
                  ${totalPrice.toFixed(2)}
                </div>
                <Link
                  to="/cart"
                  className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  View Cart →
                </Link>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="flex-shrink-0 border-t border-purple-200 dark:border-gray-700 p-6">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              <LogOut className="mr-4 h-6 w-6 text-red-500 group-hover:text-red-600 dark:group-hover:text-red-400" />
              <span className="flex-1">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <Link to="/dashboard" className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                FlowerStore
              </span>
            </Link>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      )}
                    />
                    {item.name}
                    {item.name === 'Cart' && totalItems > 0 && (
                      <div className="ml-auto flex items-center">
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                          {totalItems > 99 ? '99+' : totalItems}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Cart Summary */}
          {totalItems > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                    Cart Summary
                  </span>
                  <span className="text-xs text-primary-600 dark:text-primary-400">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="text-lg font-bold text-primary-900 dark:text-primary-100">
                  ${totalPrice.toFixed(2)}
                </div>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="block mt-2 text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  View Cart →
                </Link>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="flex-shrink-0 border-t border-purple-200 dark:border-gray-700 p-6">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              <LogOut className="mr-4 h-6 w-6 text-red-500 group-hover:text-red-600 dark:group-hover:text-red-400" />
              <span className="flex-1">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientSidebar;
