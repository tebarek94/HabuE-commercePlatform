import React, { useState } from 'react';
import { Eye, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/authStore';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { formatCurrency } from '@/lib/utils';

interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  items: Array<{
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mock data - replace with actual API call
  React.useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockOrders: Order[] = [
          {
            id: 1,
            order_number: 'ORD-2024-001',
            status: 'delivered',
            total_amount: 89.99,
            shipping_address: '123 Main St, City, State 12345',
            payment_method: 'credit_card',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-17T14:20:00Z',
            items: [
              { id: 1, product_id: 1, product_name: 'Red Roses Bouquet', quantity: 1, price: 49.99 },
              { id: 2, product_id: 2, product_name: 'Mixed Spring Flowers', quantity: 1, price: 39.99 }
            ]
          },
          {
            id: 2,
            order_number: 'ORD-2024-002',
            status: 'shipped',
            total_amount: 65.50,
            shipping_address: '456 Oak Ave, City, State 12345',
            payment_method: 'paypal',
            created_at: '2024-01-20T09:15:00Z',
            updated_at: '2024-01-21T16:45:00Z',
            items: [
              { id: 3, product_id: 3, product_name: 'White Lilies', quantity: 2, price: 32.75 }
            ]
          },
          {
            id: 3,
            order_number: 'ORD-2024-003',
            status: 'processing',
            total_amount: 125.00,
            shipping_address: '789 Pine St, City, State 12345',
            payment_method: 'credit_card',
            created_at: '2024-01-22T14:30:00Z',
            updated_at: '2024-01-22T14:30:00Z',
            items: [
              { id: 4, product_id: 4, product_name: 'Premium Orchid Collection', quantity: 1, price: 125.00 }
            ]
          }
        ];
        
        setOrders(mockOrders);
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Please log in
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You need to be logged in to view your orders.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            My Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your flower orders
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              No orders yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/products'}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Order Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {order.order_number}
                        </h3>
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(order.status)
                        )}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Order Date</p>
                          <p className="text-gray-900 dark:text-gray-100">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Total Amount</p>
                          <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                            {formatCurrency(order.total_amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Payment Method</p>
                          <p className="text-gray-900 dark:text-gray-100 capitalize">
                            {order.payment_method.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Items</p>
                          <p className="text-gray-900 dark:text-gray-100">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Order Details - {selectedOrder.order_number}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Order Status */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Order Status
                  </h4>
                  <span className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                    getStatusColor(selectedOrder.status)
                  )}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-2 capitalize">{selectedOrder.status}</span>
                  </span>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {item.product_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(item.price)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Shipping Address
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedOrder.shipping_address}
                  </p>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {formatCurrency(selectedOrder.total_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span className="text-gray-900 dark:text-gray-100">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tax</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {formatCurrency(selectedOrder.total_amount * 0.08)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-900 dark:text-gray-100">Total</span>
                        <span className="text-primary-600 dark:text-primary-400">
                          {formatCurrency(selectedOrder.total_amount + (selectedOrder.total_amount * 0.08))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
