import React, { useState } from 'react';
import { Eye, Edit, Search, Filter, User, Mail, Phone, Calendar, Shield, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';

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

  // Mock data - replace with actual API calls
  const customers: Customer[] = [
    {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      role: 'client',
      is_active: true,
      email_verified: true,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-17T14:20:00Z',
      total_orders: 5,
      total_spent: 450.75
    },
    {
      id: 2,
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      phone: '+1 (555) 234-5678',
      role: 'client',
      is_active: true,
      email_verified: true,
      created_at: '2024-01-20T09:15:00Z',
      updated_at: '2024-01-21T16:45:00Z',
      total_orders: 3,
      total_spent: 195.50
    },
    {
      id: 3,
      first_name: 'Bob',
      last_name: 'Johnson',
      email: 'bob@example.com',
      phone: '+1 (555) 345-6789',
      role: 'client',
      is_active: false,
      email_verified: false,
      created_at: '2024-01-22T14:30:00Z',
      updated_at: '2024-01-22T14:30:00Z',
      total_orders: 1,
      total_spent: 125.00
    },
    {
      id: 4,
      first_name: 'Alice',
      last_name: 'Brown',
      email: 'alice@example.com',
      phone: '+1 (555) 456-7890',
      role: 'admin',
      is_active: true,
      email_verified: true,
      created_at: '2024-01-10T08:00:00Z',
      updated_at: '2024-01-23T16:45:00Z',
      total_orders: 0,
      total_spent: 0
    }
  ];

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
      // API call to toggle customer status
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (err) {
      setError('Failed to update customer status');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (customerId: number, newRole: 'client' | 'admin') => {
    setLoading(true);
    try {
      // API call to change customer role
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setShowEditModal(false);
      setSelectedCustomer(null);
    } catch (err) {
      setError('Failed to update customer role');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (value: unknown, customer: Customer) => (
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
      render: (value: unknown, customer: Customer) => (
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
      render: (value: unknown, customer: Customer) => (
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
      render: (value: unknown, customer: Customer) => (
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
      render: (value: unknown, customer: Customer) => (
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
      render: (value: unknown, customer: Customer) => (
        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(customer.created_at)}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: unknown, customer: Customer) => (
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Change Role
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              defaultValue={selectedCustomer?.role}
            >
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Status
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              defaultValue={selectedCustomer?.is_active ? 'active' : 'inactive'}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => selectedCustomer && handleRoleChange(selectedCustomer.id, 'admin')}
              loading={loading}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminCustomers;
