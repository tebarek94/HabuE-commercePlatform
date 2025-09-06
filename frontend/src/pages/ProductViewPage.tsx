import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Star, Calendar, Droplets, Sun, Thermometer, MapPin, Clock, Info } from 'lucide-react';
import { Product } from '@/types';
import { adminApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

// Utility functions for image handling
const getImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42MjcgMzYgMzYgMzAuNjI3IDM2IDI0QzM2IDE3LjM3MjYgMzAuNjI3IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42MjcgMTcuMzcyNiAzNiAyNCAzNloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI0IDMwQzI2LjIwOTEgMzAgMjggMjguMjA5MSAyOCAyNkMyOCAyMy43OTA5IDI2LjIwOTEgMjIgMjQgMjJDMjEuNzkwOSAyMiAyMCAyMy43OTA5IDIwIDI2QzIwIDI4LjIwOTEgMjEuNzkwOSAzMCAyNCAzMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `http://localhost:3001${imageUrl}`;
};

const getPlaceholderImageUrl = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42MjcgMzYgMzYgMzAuNjI3IDM2IDI0QzM2IDE3LjM3MjYgMzAuNjI3IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42MjcgMTcuMzcyNiAzNiAyNCAzNloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI0IDMwQzI2LjIwOTEgMzAgMjggMjguMjA5MSAyOCAyNkMyOCAyMy43OTA5IDI2LjIwOTEgMjIgMjQgMjJDMjEuNzkwOSAyMiAyMCAyMy43OTA5IDIwIDI2QzIwIDI4LjIwOTEgMjEuNzkwOSAzMCAyNCAzMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
};
import { useAuth } from '@/store/authStore';
import { canPerformAdminActions } from '@/utils/roleUtils';

const ProductViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const hasAdminAccess = canPerformAdminActions(user);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const productData = await adminApi.getProduct(parseInt(id!));
      setProduct(productData);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getWaterNeedsIcon = (needs: string) => {
    switch (needs) {
      case 'low':
        return <Droplets className="h-4 w-4 text-blue-400" />;
      case 'medium':
        return <Droplets className="h-4 w-4 text-blue-600" />;
      case 'high':
        return <Droplets className="h-4 w-4 text-blue-800" />;
      default:
        return <Droplets className="h-4 w-4 text-gray-400" />;
    }
  };

  const getLightIcon = (light: string) => {
    switch (light) {
      case 'full_sun':
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'partial_sun':
        return <Sun className="h-4 w-4 text-yellow-400" />;
      case 'shade':
        return <Sun className="h-4 w-4 text-gray-400" />;
      default:
        return <Sun className="h-4 w-4 text-gray-400" />;
    }
  };

  const getFragranceIcon = (fragrance: string) => {
    if (fragrance === 'none') return null;
    return <span className="text-lg">🌸</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="error">
            {error || 'Product not found'}
          </Alert>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const images = product.additional_images && product.additional_images.length > 0 
    ? [product.image_url, ...product.additional_images].filter(Boolean)
    : [product.image_url].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {hasAdminAccess && (
            <Button
              variant="primary"
              onClick={() => navigate(`/admin/products`)}
            >
              Manage Products
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={getImageUrl(images[imageIndex])}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getPlaceholderImageUrl();
                }}
              />
            </div>
            
            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      index === imageIndex
                        ? 'border-primary-500'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImageUrl();
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(product.price)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {product.is_active ? 'In Stock' : 'Out of Stock'}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {product.stock_quantity} available
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Flower Details */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  🌸 Flower Details
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.color && (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Color:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.color}</span>
                    </div>
                  )}
                  
                  {product.season && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Season:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{product.season}</span>
                    </div>
                  )}
                  
                  {product.bloom_time && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Bloom Time:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.bloom_time}</span>
                    </div>
                  )}
                  
                  {product.height && (
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Height:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.height}</span>
                    </div>
                  )}
                  
                  {product.fragrance && (
                    <div className="flex items-center space-x-2">
                      {getFragranceIcon(product.fragrance)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">Fragrance:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{product.fragrance}</span>
                    </div>
                  )}
                  
                  {product.vase_life && (
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Vase Life:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.vase_life} days</span>
                    </div>
                  )}
                  
                  {product.origin && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Origin:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.origin}</span>
                    </div>
                  )}
                </div>

                {/* Care Requirements */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Care Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.difficulty_level && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(product.difficulty_level)}`}>
                        {product.difficulty_level.charAt(0).toUpperCase() + product.difficulty_level.slice(1)} Care
                      </span>
                    )}
                    {product.water_needs && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {getWaterNeedsIcon(product.water_needs)}
                        <span className="ml-1 capitalize">{product.water_needs} Water</span>
                      </span>
                    )}
                    {product.light_requirements && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        {getLightIcon(product.light_requirements)}
                        <span className="ml-1 capitalize">{product.light_requirements.replace('_', ' ')}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Care Instructions */}
                {product.care_instructions && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Care Instructions</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {product.care_instructions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                className="flex-1 btn-mobile"
                disabled={!product.is_active || product.stock_quantity === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="px-4 btn-mobile"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Stock Warning */}
            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <Alert variant="warning">
                Only {product.stock_quantity} left in stock!
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductViewPage;
