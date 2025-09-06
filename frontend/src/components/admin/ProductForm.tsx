import React, { useState, useEffect, useRef } from 'react';
import { Product } from '@/types';
import { Category } from '@/types';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';

interface ProductFormProps {
  product?: any;
  categories: Category[];
  onSubmit: (productData: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel,
  loading
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
    stock_quantity: '',
    is_active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category_id: product.category_id.toString(),
        image_url: product.image_url || '',
        stock_quantity: product.stock_quantity.toString(),
        is_active: product.is_active
      });
      // Set image preview if product has an image
      if (product.image_url) {
        setImagePreview(getImageUrl(product.image_url));
      }
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = 'Valid stock quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        image_url: formData.image_url.trim() || undefined,
        stock_quantity: parseInt(formData.stock_quantity),
        is_active: formData.is_active,
        imageFile: selectedFile // Include the selected file
      };

      await onSubmit(productData);
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }

    setSelectedFile(file);
    setErrors(prev => ({ ...prev, image: '' }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="max-h-[90vh] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {product ? 'Edit Product' : 'Add New Product'}
        </h3>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              placeholder="Enter product name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              placeholder="Enter product description"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.stock_quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                placeholder="0"
              />
              {errors.stock_quantity && <p className="text-red-500 text-sm mt-1">{errors.stock_quantity}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => handleInputChange('category_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.category_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Image
            </label>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-4 relative">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-48 flex items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"><span class="text-4xl">🌸</span></div>';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {selectedFile ? 'Image selected' : 'Drop an image here or click to browse'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Choose File
                </button>
              </div>
            </div>

            {/* Alternative: Image URL Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Or enter image URL
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => {
                  handleInputChange('image_url', e.target.value);
                  if (e.target.value) {
                    setImagePreview(getImageUrl(e.target.value));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
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

          {/* Form Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Form Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Product Name:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{formData.name || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Price:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">
                  {formData.price ? `$${parseFloat(formData.price).toFixed(2)}` : 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{formData.stock_quantity || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`ml-2 ${formData.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {formData.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

        </form>
      </CardContent>
      
      {/* Sticky Footer with Buttons */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[140px]"
            onClick={handleSubmit}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              product ? 'Update Product' : 'Create Product'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductForm;
