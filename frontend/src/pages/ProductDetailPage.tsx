import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import Button from '@/components/ui/Button';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { formatCurrency } from '@/lib/utils';
import { getImageUrl } from '@/utils/imageUtils';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const productData = await productsApi.getProduct(Number(id));
        setProduct(productData as Product);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌸</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="primary" onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const images = product.image_url ? [getImageUrl(product.image_url)] : [];
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <button onClick={() => navigate('/')} className="hover:text-primary-600 dark:hover:text-primary-400">
                Home
              </button>
            </li>
            <li>/</li>
            <li>
              <button onClick={() => navigate('/products')} className="hover:text-primary-600 dark:hover:text-primary-400">
                Products
              </button>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-gray-100">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><span class="text-6xl">🌸</span></div>';
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-6xl">🌸</span>
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'aspect-square rounded-lg overflow-hidden border-2 transition-colors',
                      selectedImage === index
                        ? 'border-primary-500'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {product.name}
              </h1>
              {product.category_name && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Category: {product.category_name}
                </p>
              )}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
                      )}
                    />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    (4.0) • 24 reviews
                  </span>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {isOutOfStock ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                  Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  In Stock ({product.stock_quantity} available)
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <AddToCartButton
                product={product}
                variant="default"
                size="lg"
                showQuantity={true}
                className="w-full"
              />
              <Button
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Heart className="mr-2 h-5 w-5" />
                Add to Wishlist
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Free Delivery</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Easy Returns</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Quality Guarantee</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Fresh flowers guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
