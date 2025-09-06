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
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';
import { useAuth } from '@/store/authStore';
import { canPerformAdminActions } from '@/utils/roleUtils';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  transaction_reference?: string;
  shipping_address: string;
  billing_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: Array<{
    id: number;
    product_name: string;
    product_image?: string;
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const { user, isAuthenticated, isLoading } = useAuth();
  const hasAdminAccess = canPerformAdminActions(user);
  
  // Debug logging
  console.log('AdminOrders Debug:', {
    isLoading,
    isAuthenticated,
    user: user ? {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      first_name: user.first_name,
      last_name: user.last_name
    } : null,
    hasAdminAccess,
    hasAdminRole: user?.role === 'admin'
  });

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getAllOrders({
        limit: 50,
        status: statusFilter || undefined,
      });
      
      // Handle the response structure from the backend
      if (response && typeof response === 'object' && 'orders' in response) {
        setOrders((response as { orders: Order[] }).orders || []);
      } else {
        // Fallback for direct array response
        setOrders(Array.isArray(response) ? response : []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

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

  const handlePaymentStatusUpdate = async (orderId: number, newPaymentStatus: string) => {
    setLoading(true);
    try {
      await adminApi.updatePaymentStatus(orderId, newPaymentStatus);
      await fetchOrders();
      setShowPaymentModal(false);
      setSelectedOrder(null);
      toast.success('Payment status updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment status';
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
      case 'confirmed':
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

  const getPaymentStatusIcon = (status: Order['payment_status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'refunded':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed':
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

  const getPaymentStatusColor = (status: Order['payment_status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'refunded':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
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
      label: 'Order #',
      render: (_value: unknown, order: Order) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{order.order_number}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(order.created_at)}</p>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (_value: unknown, order: Order) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{order.customer_name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer_email}</p>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      render: (_value: unknown, order: Order) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {formatCurrency(order.total_amount)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: unknown, order: Order) => (
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
      label: 'Payment',
      render: (_value: unknown, order: Order) => (
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              getPaymentStatusColor(order.payment_status)
            )}>
              {order.payment_status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
              {order.payment_status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
              {order.payment_status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
              {order.payment_status === 'refunded' && <Package className="h-3 w-3 mr-1" />}
              <span className="capitalize">{order.payment_status}</span>
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
            {order.payment_method.replace('_', ' ')}
          </p>
          {order.transaction_reference && (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
              {order.transaction_reference.substring(0, 12)}...
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, order: Order) => (
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

  // Show access denied if user doesn't have admin permissions
  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have admin permissions
  // Allow access if user has admin role (fallback for backend issues)
  const hasAdminRole = user?.role === 'admin';
  const shouldDenyAccess = !hasAdminAccess && !hasAdminRole;
  
  if (shouldDenyAccess) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page. Admin access is required.
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6 text-sm">
            <p className="font-medium mb-2">Debug Info:</p>
            <p>User: {user?.email || 'Not logged in'}</p>
            <p>Role: {user?.role || 'No role'}</p>
            <p>Active: {user?.is_active?.toString() || 'undefined'}</p>
            <p>Has Admin Access: {hasAdminAccess.toString()}</p>
            <p>Has Admin Role: {hasAdminRole.toString()}</p>
          </div>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/'}
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

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
              <option value="confirmed">Confirmed</option>
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
          />
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`Order Details - ${selectedOrder.order_number}`}
          size="4xl"
        >
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setShowDetailsModal(false)}
            onUpdateStatus={handleStatusUpdate}
            onUpdatePaymentStatus={handlePaymentStatusUpdate}
          />
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

      {/* Update Payment Status Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={`Update Payment Status - ${selectedOrder?.order_number}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Payment Status
            </label>
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              selectedOrder ? getPaymentStatusColor(selectedOrder.payment_status) : ''
            )}>
              {selectedOrder && getPaymentStatusIcon(selectedOrder.payment_status)}
              <span className="ml-1 capitalize">{selectedOrder?.payment_status}</span>
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Payment Status
            </label>
            <select 
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select new payment status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => selectedOrder && newPaymentStatus && handlePaymentStatusUpdate(selectedOrder.id, newPaymentStatus)}
              loading={loading}
              disabled={!newPaymentStatus}
            >
              Update Payment Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminOrders;
