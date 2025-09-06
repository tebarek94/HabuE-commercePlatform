import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminCategories: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching categories...');
      const data = await adminApi.getCategories();
      console.log('Categories data received:', data);
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(category =>
    category && category.name && (
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleDelete = async (categoryId: number) => {
    setLoading(true);
    try {
      await adminApi.deleteCategory(categoryId);
      await fetchCategories();
      setShowDeleteModal(false);
      setSelectedCategory(null);
      toast.success('Category deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (categoryId: number, currentStatus: boolean) => {
    setLoading(true);
    try {
      await adminApi.updateCategory(categoryId, { is_active: !currentStatus });
      await fetchCategories();
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData: any) => {
    setLoading(true);
    try {
      await adminApi.createCategory(categoryData);
      await fetchCategories();
      setShowAddModal(false);
      toast.success('Category created successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw to prevent form from closing
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (categoryData: any) => {
    if (!selectedCategory) return;
    
    setLoading(true);
    try {
      await adminApi.updateCategory(selectedCategory.id, categoryData);
      await fetchCategories();
      setShowEditModal(false);
      setSelectedCategory(null);
      toast.success('Category updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw to prevent form from closing
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (value: unknown, category: Category) => (
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          {category?.image_url ? (
            <img
              src={category.image_url}
              alt={category?.name || 'Category'}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-gray-400 text-xs">No Image</span>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (value: unknown, category: Category) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{category?.name || 'Unknown'}</p>
          {category?.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {category.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value: unknown, category: Category) => (
        <span
          className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            category?.is_active
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          )}
        >
          {category?.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: unknown, category: Category) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {category?.created_at ? new Date(category.created_at).toLocaleDateString() : 'Unknown'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: unknown, category: Category) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCategory(category);
              setShowEditModal(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => category?.id && handleToggleStatus(category.id, category.is_active)}
            loading={loading}
          >
            {category?.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCategory(category);
              setShowDeleteModal(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage product categories
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCategories}
              className="ml-4"
            >
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            All Categories ({filteredCategories.length})
          </h3>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredCategories}
            columns={columns}
            loading={loading}
            emptyMessage="No categories found"
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Category"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
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
              onClick={() => selectedCategory && handleDelete(selectedCategory.id)}
              loading={loading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Category"
        size="lg"
      >
        <CategoryForm
          onSubmit={handleCreateCategory}
          onCancel={() => setShowAddModal(false)}
          loading={loading}
        />
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Category - ${selectedCategory?.name}`}
        size="lg"
      >
        <CategoryForm
          category={selectedCategory}
          onSubmit={handleUpdateCategory}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

// Category Form Component
interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (categoryData: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        image_url: category.image_url || '',
        is_active: category.is_active
      });
    }
  }, [category]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      image_url: formData.image_url.trim() || undefined,
      is_active: formData.is_active
    };

    await onSubmit(categoryData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              placeholder="Enter category name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Enter category description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Active (visible to customers)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminCategories;
