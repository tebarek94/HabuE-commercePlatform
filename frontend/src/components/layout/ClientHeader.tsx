import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useAuthActions } from '@/store/authStore';
import { useCart } from '@/store/cartStore';
import { useThemeActions } from '@/store/themeStore';
import Button from '@/components/ui/Button';

const ClientHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { logout } = useAuthActions();
  const { totalItems } = useCart();
  const { toggleTheme } = useThemeActions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              FlowerShop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
            >
              Products
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search flowers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </form>
          </div>

          {/* Right side actions */}
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

            {/* Wishlist */}
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Heart className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block">{user?.first_name}</span>
                </Button>
                {/* Dropdown menu would go here */}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="space-y-4">
              {/* Mobile search */}
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search flowers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </form>

              {/* Mobile navigation */}
              <nav className="space-y-2">
                <Link
                  to="/"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  to="/about"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </nav>

              {/* Mobile user actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-3 py-2 text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default ClientHeader;
