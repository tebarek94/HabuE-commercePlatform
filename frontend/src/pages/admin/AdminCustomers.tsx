import React, { useState, useEffect } from 'react';
import { Eye, Edit, Search, Filter, User, Mail, Calendar, Shield, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { adminApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/authStore';
import { canPerformAdminActions } from '@/utils/roleUtils';
import CustomerEditForm from '@/components/admin/CustomerEditForm';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'client' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  total_orders: number;
  total_spent: number;
}

const AdminCustomers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });

  const { user, isAuthenticated, isLoading } = useAuth();
  const hasAdminAccess = canPerformAdminActions(user);
  
  // Debug logging
  console.log('AdminCustomers Debug:', {
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

  // Fetch customers using admin API
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getAllUsers({
        page: pagination.page,
        limit: pagination.limit,
      });
      
      // Transform the response to match our Customer interface
      const customerData = (response as any[]).map(user => ({
        ...user,
        total_orders: user.total_orders || 0,
        total_spent: user.total_spent || 0,
      }));
      
      setCustomers(customerData);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCustomers();
  }, [pagination.page]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && customer.is_active) ||
      (statusFilter === 'inactive' && !customer.is_active);
    
    const matchesRole = !roleFilter || customer.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleToggleStatus = async (customerId: number, currentStatus: boolean) => {
    setLoading(true);
    try {
      await adminApi.updateUserStatus(customerId, !currentStatus);
      await fetchCustomers();
      toast.success(`Customer ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (customerId: number, newRole: 'client' | 'admin') => {
    setLoading(true);
    try {
      await adminApi.updateUserRole(customerId, newRole);
      await fetchCustomers();
      setShowEditModal(false);
      setSelectedCustomer(null);
      toast.success(`Customer role updated to ${newRole} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer role';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };


  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (_value: unknown, customer: Customer) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {customer.first_name} {customer.last_name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (_value: unknown, customer: Customer) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-gray-100">
            {customer.phone || 'No phone'}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            {customer.email_verified ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <UserCheck className="h-3 w-3 mr-1" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                <Mail className="h-3 w-3 mr-1" />
                Unverified
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (_value: unknown, customer: Customer) => (
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          customer.role === 'admin'
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        )}>
          <Shield className="h-3 w-3 mr-1" />
          {customer.role === 'admin' ? 'Admin' : 'Client'}
        </span>
      ),
    },
    {
      key: 'stats',
      label: 'Stats',
      render: (_value: unknown, customer: Customer) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-gray-100">
            {customer.total_orders} orders
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatCurrency(customer.total_spent)}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: unknown, customer: Customer) => (
        <button
          onClick={() => handleToggleStatus(customer.id, customer.is_active)}
          className={cn(
            'px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
            customer.is_active
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
          )}
        >
          {customer.is_active ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      key: 'joined',
      label: 'Joined',
      render: (_value: unknown, customer: Customer) => (
        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(customer.created_at)}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, customer: Customer) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedCustomer(customer);
              setShowDetailsModal(true);
            }}
            className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedCustomer(customer);
              setShowEditModal(true);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Customers</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage customer accounts and their information
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
                  placeholder="Search customers..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
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

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            All Customers ({filteredCustomers.length})
          </h3>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredCustomers}
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`Customer Details - ${selectedCustomer.first_name} ${selectedCustomer.last_name}`}
        >
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {selectedCustomer.first_name} {selectedCustomer.last_name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-gray-900 dark:text-gray-100">{selectedCustomer.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {selectedCustomer.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <span className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  selectedCustomer.role === 'admin'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                )}>
                  <Shield className="h-3 w-3 mr-1" />
                  {selectedCustomer.role === 'admin' ? 'Admin' : 'Client'}
                </span>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Status
              </label>
              <div className="flex space-x-4">
                <span className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  selectedCustomer.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                )}>
                  {selectedCustomer.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  selectedCustomer.email_verified
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                )}>
                  <Mail className="h-3 w-3 mr-1" />
                  {selectedCustomer.email_verified ? 'Email Verified' : 'Email Unverified'}
                </span>
              </div>
            </div>

            {/* Statistics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statistics
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {selectedCustomer.total_orders}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(selectedCustomer.total_spent)}
                  </p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Dates
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatDate(selectedCustomer.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatDate(selectedCustomer.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Customer Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Customer - ${selectedCustomer?.first_name} ${selectedCustomer?.last_name}`}
      >
        <CustomerEditForm
          customer={selectedCustomer}
          onSubmit={handleRoleChange}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedCustomer(null);
          }}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default AdminCustomers;
