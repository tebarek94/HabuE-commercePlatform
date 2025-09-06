import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { adminApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import  {Card, CardContent, CardHeader } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import ProductForm from '@/components/admin/ProductForm';
import { useAuth } from '@/store/authStore';
import { canPerformAdminActions } from '@/utils/roleUtils';

// Utility functions for image handling
const getImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42MjcgMzYgMzYgMzAuNjI3IDM2IDI0QzM2IDE3LjM3MjYgMzAuNjI3IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42MjcgMTcuMzcyNiAzNiAyNCAzNloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI0IDMwQzI2LjIwOTEgMzAgMjggMjguMjA5MSAyOCAyNkMyOCAyMy43OTA5IDI2LjIwOTEgMjIgMjQgMjJDMjEuNzkwOSAyMiAyMCAyMy43OTA5IDIwIDI2QzIwIDI4LjIwOTEgMjEuNzkwOSAzMCAyNCAzMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `http://localhost:3001${imageUrl}`;
};

const getPlaceholderImageUrl = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42MjcgMzYgMzYgMzAuNjI3IDM2IDI0QzM2IDE3LjM3MjYgMzAuNjI3IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42MjcgMTcuMzcyNiAzNiAyNCAzNloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI0IDMwQzI2LjIwOTEgMzAgMjggMjguMjA5MSAyOCAyNkMyOCAyMy43OTA5IDI2LjIwOTEgMjIgMjQgMjJDMjEuNzkwOSAyMiAyMCAyMy43OTA5IDIwIDI2QzIwIDI4LjIwOTEgMjEuNzkwOSAzMCAyNCAzMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
};

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_name?: string;
  is_active: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

const AdminProducts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  const { categories } = useCategories();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Check if user has admin permissions
  const hasAdminAccess = canPerformAdminActions(user);
  
  // Debug logging
  console.log('AdminProducts Debug:', {
    isLoading,
    isAuthenticated,
    user: user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      first_name: user.first_name,
      last_name: user.last_name
    } : null,
    hasAdminAccess,
    canAccessAdmin: user?.role === 'admin' && user?.is_active === true,
    hasAdminRole: user?.role === 'admin'
  });

  // Fetch products using admin API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getProducts({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
      });
      
      setProducts((response.data as Product[]) || []);
      setPagination(response.pagination || pagination);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  React.useEffect(() => {
    fetchProducts();
  }, [pagination.page, searchQuery]);

  // Debounced search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        fetchProducts();
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleDelete = async (productId: number) => {
    setLoading(true);
    try {
      await adminApi.deleteProduct(productId);
      await fetchProducts();
      setShowDeleteModal(false);
      setSelectedProduct(null);
      toast.success('Product deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (productId: number, currentStatus: boolean) => {
    setLoading(true);
    try {
      await adminApi.updateProduct(productId, { is_active: !currentStatus });
      await fetchProducts();
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData: any) => {
    setLoading(true);
    try {
      // Handle file upload if imageFile is present
      if (productData.imageFile) {
        const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('description', productData.description);
        formData.append('price', productData.price.toString());
        formData.append('category_id', productData.category_id.toString());
        formData.append('stock_quantity', productData.stock_quantity.toString());
        formData.append('is_active', productData.is_active.toString());
        formData.append('image', productData.imageFile);
        
        await adminApi.createProductWithImage(formData);
      } else {
        await adminApi.createProduct(productData);
      }
      await fetchProducts();
      setShowAddModal(false);
      toast.success('Product created successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw to prevent form from closing
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    if (!selectedProduct) return;
    
    setLoading(true);
    try {
      // Handle file upload if imageFile is present
      if (productData.imageFile) {
        const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('description', productData.description);
        formData.append('price', productData.price.toString());
        formData.append('category_id', productData.category_id.toString());
        formData.append('stock_quantity', productData.stock_quantity.toString());
        formData.append('is_active', productData.is_active.toString());
        formData.append('image', productData.imageFile);
        
        await adminApi.updateProductWithImage(selectedProduct.id, formData);
      } else {
        await adminApi.updateProduct(selectedProduct.id, productData);
      }
      await fetchProducts();
      setShowEditModal(false);
      setSelectedProduct(null);
      toast.success('Product updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (_value: unknown, product: Product) => (
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getPlaceholderImageUrl();
            }}
          />
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Product Name',
      render: (_value: unknown, product: Product) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{product.category_name}</p>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (_value: unknown, product: Product) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {formatCurrency(product.price)}
        </span>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (_value: unknown, product: Product) => (
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-medium',
          product.stock_quantity > 10
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : product.stock_quantity > 0
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        )}>
          {product.stock_quantity} units
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: unknown, product: Product) => (
        <button
          onClick={() => handleToggleStatus(product.id, product.is_active)}
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium transition-colors',
            product.is_active
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
          )}
        >
          {product.is_active ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, product: Product) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open(`/product/${product.id}`, '_blank')}
            className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            title="View Product Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedProduct(product);
              setShowEditModal(true);
            }}
            className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedProduct(product);
              setShowDeleteModal(true);
            }}
            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have admin permissions
  // Allow access if user has admin role (fallback for backend issues)
  const hasAdminRole = user?.role === 'admin';
  const shouldDenyAccess = !hasAdminAccess && !hasAdminRole;
  
  if (shouldDenyAccess) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page. Admin access is required.
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6 text-sm">
            <p className="font-medium mb-2">Debug Info:</p>
            <p>User: {user?.email || 'Not logged in'}</p>
            <p>Role: {user?.role || 'No role'}</p>
            <p>Active: {user?.is_active?.toString() || 'undefined'}</p>
            <p>Has Admin Access: {hasAdminAccess.toString()}</p>
            <p>Has Admin Role: {hasAdminRole.toString()}</p>
          </div>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your flower products and inventory
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
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
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            All Products ({pagination.total})
          </h3>
        </CardHeader>
        <CardContent>
          <DataTable
            data={products}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        </CardContent>
      </Card>

      {/* Product Details Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Product Details - ${selectedProduct.name}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name
                </label>
                <p className="text-gray-900 dark:text-gray-100">{selectedProduct.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <p className="text-gray-900 dark:text-gray-100">{selectedProduct.category_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price
                </label>
                <p className="text-gray-900 dark:text-gray-100">{formatCurrency(selectedProduct.price)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock Quantity
                </label>
                <p className="text-gray-900 dark:text-gray-100">{selectedProduct.stock_quantity} units</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <p className="text-gray-900 dark:text-gray-100">{selectedProduct.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <span className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                selectedProduct.is_active
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              )}>
                {selectedProduct.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
          </p>
          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedProduct && handleDelete(selectedProduct.id)}
              loading={loading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product"
        size="2xl"
      >
        <ProductForm
          categories={categories}
          onSubmit={handleCreateProduct}
          onCancel={() => setShowAddModal(false)}
          loading={loading}
        />
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Product - ${selectedProduct?.name}`}
        size="2xl"
      >
        <ProductForm
          product={selectedProduct}
          categories={categories}
          onSubmit={handleUpdateProduct}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default AdminProducts;
