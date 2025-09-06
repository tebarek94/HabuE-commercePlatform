import React from 'react';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  className?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  onAddToCart,
  onAddToWishlist,
  className,
  columns = 4,
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  if (loading) {
    return (
      <div className={cn('grid gap-6', gridCols[columns], className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌸</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No products found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-6', gridCols[columns], className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
