import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { Card } from '@/components/ui/Card';

// Utility function for image handling
const getImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42MjcgMzYgMzYgMzAuNjI3IDM2IDI0QzM2IDE3LjM3MjYgMzAuNjI3IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42MjcgMTcuMzcyNiAzNiAyNCAzNloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI0IDMwQzI2LjIwOTEgMzAgMjggMjguMjA5MSAyOCAyNkMyOCAyMy43OTA5IDI2LjIwOTEgMjIgMjQgMjJDMjEuNzkwOSAyMiAyMCAyMy43OTA5IDIwIDI2QzIwIDI4LjIwOTEgMjEuNzkwOSAzMCAyNCAzMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `http://localhost:3001${imageUrl}`;
};

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  className,
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist?.(product);
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 border-purple-200 dark:border-purple-800',
        className
      )}
      hover
    >
      <Link to={`/products/${product.id}`} className="block">
        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-700">
          {product.image_url ? (
            <img
              src={getImageUrl(product.image_url)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><span class="text-4xl">🌸</span></div>';
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">🌸</span>
            </div>
          )}
          
          {/* Stock Badge */}
          {product.stock_quantity === 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full font-medium shadow-lg">
              Out of Stock
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddToWishlist}
                className="w-10 h-10 p-0 bg-white/90 hover:bg-white shadow-lg rounded-full hover:scale-110 transition-transform"
              >
                <Heart className="h-5 w-5 text-pink-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 bg-white/90 hover:bg-white shadow-lg rounded-full hover:scale-110 transition-transform"
              >
                <Eye className="h-5 w-5 text-purple-500" />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          {product.category_name && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {product.category_name}
            </p>
          )}
          
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {product.description}
          </p>
          
          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(product.price)}
            </span>
            {product.stock_quantity > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {product.stock_quantity} in stock
              </span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <AddToCartButton
            product={product}
            variant="primary"
            size="sm"
            className="w-full"
          />
        </div>
      </Link>
    </Card>
  );
};

export default ProductCard;
