import React, { useState, useEffect } from 'react';
import { Eye, Edit, Search, Filter, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

const AdminOrders: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllOrders({
        limit: 50,
        status: statusFilter || undefined,
      });
      setOrders(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Mock data for demonstration - remove when API is ready
  const mockOrders: Order[] = [
    {
      id: 1,
      order_number: 'ORD-2024-001',
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      total_amount: 89.99,
      status: 'delivered',
      payment_method: 'credit_card',
      shipping_address: '123 Main St, City, State 12345',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-17T14:20:00Z',
      items: [
        { id: 1, product_name: 'Red Roses Bouquet', quantity: 1, price: 49.99 },
        { id: 2, product_name: 'Mixed Spring Flowers', quantity: 1, price: 39.99 }
      ]
    },
    {
      id: 2,
      order_number: 'ORD-2024-002',
      customer_name: 'Jane Smith',
      customer_email: 'jane@example.com',
      total_amount: 65.50,
      status: 'shipped',
      payment_method: 'paypal',
      shipping_address: '456 Oak Ave, City, State 12345',
      created_at: '2024-01-20T09:15:00Z',
      updated_at: '2024-01-21T16:45:00Z',
      items: [
        { id: 3, product_name: 'White Lilies', quantity: 2, price: 32.75 }
      ]
    },
    {
      id: 3,
      order_number: 'ORD-2024-003',
      customer_name: 'Bob Johnson',
      customer_email: 'bob@example.com',
      total_amount: 125.00,
      status: 'processing',
      payment_method: 'credit_card',
      shipping_address: '789 Pine St, City, State 12345',
      created_at: '2024-01-22T14:30:00Z',
      updated_at: '2024-01-22T14:30:00Z',
      items: [
        { id: 4, product_name: 'Premium Orchid Collection', quantity: 1, price: 125.00 }
      ]
    },
    {
      id: 4,
      order_number: 'ORD-2024-004',
      customer_name: 'Alice Brown',
      customer_email: 'alice@example.com',
      total_amount: 45.75,
      status: 'pending',
      payment_method: 'cash_on_delivery',
      shipping_address: '321 Elm St, City, State 12345',
      created_at: '2024-01-23T16:45:00Z',
      updated_at: '2024-01-23T16:45:00Z',
      items: [
        { id: 5, product_name: 'Sunflower Arrangement', quantity: 1, price: 45.75 }
      ]
    }
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setLoading(true);
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      setShowStatusModal(false);
      setSelectedOrder(null);
      toast.success('Order status updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      key: 'order_number',
      title: 'Order #',
      render: (order: Order) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{order.order_number}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(order.created_at)}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      title: 'Customer',
      render: (order: Order) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{order.customer_name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer_email}</p>
        </div>
      ),
    },
    {
      key: 'total',
      title: 'Total',
      render: (order: Order) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {formatCurrency(order.total_amount)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (order: Order) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          getStatusColor(order.status)
        )}>
          {getStatusIcon(order.status)}
          <span className="ml-1 capitalize">{order.status}</span>
        </span>
      ),
    },
    {
      key: 'payment',
      title: 'Payment',
      render: (order: Order) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
          {order.payment_method.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (order: Order) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedOrder(order);
              setShowDetailsModal(true);
            }}
            className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedOrder(order);
              setShowStatusModal(true);
            }}
            className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Orders</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage customer orders and track their status
        </p>
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
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
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

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            All Orders ({filteredOrders.length})
          </h3>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredOrders}
            columns={columns}
            loading={loading}
            emptyMessage="No orders found"
          />
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`Order Details - ${selectedOrder.order_number}`}
        >
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order Number
                </label>
                <p className="text-gray-900 dark:text-gray-100">{selectedOrder.order_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <span className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getStatusColor(selectedOrder.status)
                )}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="ml-1 capitalize">{selectedOrder.status}</span>
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Customer
                </label>
                <p className="text-gray-900 dark:text-gray-100">{selectedOrder.customer_name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.customer_email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method
                </label>
                <p className="text-gray-900 dark:text-gray-100 capitalize">
                  {selectedOrder.payment_method.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Order Items
              </label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shipping Address
              </label>
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
          </div>
        </Modal>
      )}

      {/* Update Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Update Order Status - ${selectedOrder?.order_number}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Status
            </label>
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              selectedOrder ? getStatusColor(selectedOrder.status) : ''
            )}>
              {selectedOrder && getStatusIcon(selectedOrder.status)}
              <span className="ml-1 capitalize">{selectedOrder?.status}</span>
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Status
            </label>
            <select 
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select new status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => selectedOrder && newStatus && handleStatusUpdate(selectedOrder.id, newStatus)}
              loading={loading}
              disabled={!newStatus}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminOrders;
