import React, { useState } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductFilters } from '@/types';
import Button from '@/components/ui/Button';
import ProductGrid from '@/components/products/ProductGrid';
import Alert from '@/components/ui/Alert';

const ProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { products, loading, error, pagination, setFilters: updateFilters, setPage } = useProducts({
    filters,
    pagination: { page: 1, limit: 12 },
  });

  const { categories } = useCategories();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ ...filters, search: searchQuery });
  };

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    updateFilters(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    updateFilters({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            All Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover our beautiful collection of fresh flowers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors',
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors',
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category_id || ''}
                    onChange={(e) => handleFilterChange({ 
                      category_id: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.min_price || ''}
                      onChange={(e) => handleFilterChange({ 
                        min_price: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.max_price || ''}
                      onChange={(e) => handleFilterChange({ 
                        max_price: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Availability
                  </label>
                  <select
                    value={filters.is_active === undefined ? '' : filters.is_active.toString()}
                    onChange={(e) => handleFilterChange({ 
                      is_active: e.target.value === '' ? undefined : e.target.value === 'true'
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Products</option>
                    <option value="true">In Stock</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400">
            {pagination ? `${pagination.total} products found` : 'Loading...'}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Products Grid */}
        <ProductGrid
          products={products}
          loading={loading}
          columns={viewMode === 'grid' ? 4 : 1}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setPage(pagination.page - 1)}
              >
                Previous
              </Button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === pagination.page ? 'primary' : 'outline'}
                  onClick={() => setPage(page)}
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
