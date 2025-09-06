import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Bell, User, Home } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCart } from '@/store/cartStore';
import CartIcon from '@/components/cart/CartIcon';

interface ClientTopBarProps {
  onMenuClick: () => void;
}

const ClientTopBar: React.FC<ClientTopBarProps> = ({ onMenuClick }) => {
  const { user } = useAuthStore();
  const { totalItems } = useCart();

  return (
    <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-purple-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 px-4 shadow-lg sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-purple-700 dark:text-purple-300 lg:hidden hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-7 w-7" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-8 w-px bg-purple-200 dark:bg-gray-700 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search */}
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-6 text-purple-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-10 pr-0 text-purple-900 dark:text-purple-100 placeholder:text-purple-400 focus:ring-0 sm:text-base bg-transparent"
            placeholder="Search products..."
            type="search"
            name="search"
          />
        </form>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Public Site Link */}
          <Link
            to="/"
            className="flex items-center gap-x-2 text-base text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 transition-colors bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg hover:bg-white/80 dark:hover:bg-gray-800/80"
          >
            <Home className="h-5 w-5" />
            <span className="hidden sm:block font-medium">Public Site</span>
          </Link>

          {/* Cart Icon */}
          <div className="relative">
            <CartIcon />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-7 w-7" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-gray-700" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="flex items-center gap-x-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientTopBar;
