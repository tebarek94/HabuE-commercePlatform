import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Truck, Shield, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import ProductGrid from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import SmartHomeRedirect from '@/components/SmartHomeRedirect';

const HomePage: React.FC = () => {
  const { products, loading } = useProducts({ 
    pagination: { limit: 8 } 
  });

  const features = [
    {
      icon: Heart,
      title: 'Fresh Flowers',
      description: 'Handpicked fresh flowers delivered daily',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Same-day delivery available in most areas',
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: '100% satisfaction guarantee or your money back',
    },
    {
      icon: Star,
      title: 'Expert Care',
      description: 'Professional florists with years of experience',
    },
  ];

  return (
    <>
      <SmartHomeRedirect />
      <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Beautiful Flowers for{' '}
              <span className="text-accent-400">Every Occasion</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Handpicked fresh flowers delivered with care. From romantic roses to cheerful sunflowers, 
              we have the perfect arrangement for your special moments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why Choose FlowerShop?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We're committed to providing the best flower experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover our most popular flower arrangements
            </p>
          </div>
          
          <ProductGrid
            products={products}
            loading={loading}
            columns={4}
          />
          
          <div className="text-center mt-12">
            <Link to="/products">
              <Button variant="primary" size="lg">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Brighten Someone's Day?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Order now and get free delivery on orders over 2,500 ETB
          </p>
          <Link to="/products">
            <Button variant="secondary" size="lg">
              Start Shopping
            </Button>
          </Link>
        </div>
      </section>
      </div>
    </>
  );
};

export default HomePage;
