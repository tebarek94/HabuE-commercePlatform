import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    stock_quantity: number;
  };
  added_at: string;
}

const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock wishlist data - replace with actual API call
    const mockWishlistItems: WishlistItem[] = [
      {
        id: 1,
        product: {
          id: 1,
          name: 'Red Roses Bouquet',
          price: 29.99,
          image_url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400',
          stock_quantity: 10,
        },
        added_at: '2024-01-15T10:30:00Z',
      },
      {
        id: 2,
        product: {
          id: 2,
          name: 'White Lilies',
          price: 24.99,
          image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
          stock_quantity: 5,
        },
        added_at: '2024-01-14T15:45:00Z',
      },
    ];

    setTimeout(() => {
      setWishlistItems(mockWishlistItems);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRemoveFromWishlist = (itemId: number) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAddToCart = (productId: number) => {
    // Mock add to cart functionality
    console.log('Adding product to cart:', productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Start adding products you love to your wishlist.
            </p>
            <Link to="/products">
              <Button variant="default">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            My Wishlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
          </p>
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden relative">
                  {item.product.image_url ? (
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">🌸</span>
                    </div>
                  )}
                  
                  {/* Remove from Wishlist Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {item.product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {formatCurrency(item.product.price)}
                    </span>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      item.product.stock_quantity > 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    )}>
                      {item.product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      disabled={item.product.stock_quantity === 0}
                      onClick={() => handleAddToCart(item.product.id)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                    
                    <Link to={`/products/${item.product.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/products">
            <Button variant="outline">
              Continue Shopping
            </Button>
          </Link>
          <Button
            variant="default"
            onClick={() => {
              // Add all items to cart
              wishlistItems.forEach(item => {
                if (item.product.stock_quantity > 0) {
                  handleAddToCart(item.product.id);
                }
              });
            }}
          >
            Add All to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
