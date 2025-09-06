import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

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

interface CustomerEditFormProps {
  customer?: Customer | null;
  onSubmit: (customerId: number, newRole: 'client' | 'admin') => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CustomerEditForm: React.FC<CustomerEditFormProps> = ({ 
  customer, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    role: customer?.role || 'client',
    is_active: customer?.is_active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !customer) {
      return;
    }

    try {
      await onSubmit(customer.id, formData.role as 'client' | 'admin');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No customer selected</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Info Display */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Customer Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Name:</span>
            <span className="ml-2 text-gray-900 dark:text-gray-100">
              {customer.first_name} {customer.last_name}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Email:</span>
            <span className="ml-2 text-gray-900 dark:text-gray-100">{customer.email}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Phone:</span>
            <span className="ml-2 text-gray-900 dark:text-gray-100">
              {customer.phone || 'Not provided'}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Orders:</span>
            <span className="ml-2 text-gray-900 dark:text-gray-100">
              {customer.total_orders} orders
            </span>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          User Role *
        </label>
        <select
          value={formData.role}
          onChange={(e) => handleInputChange('role', e.target.value)}
          className={cn(
            'w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            errors.role ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
          )}
          disabled={loading}
        >
          <option value="client">Client</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>
        )}
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Admins have access to the admin panel and can manage the system
        </p>
      </div>

      {/* Status Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Account Status
        </label>
        <select
          value={formData.is_active ? 'active' : 'inactive'}
          onChange={(e) => handleInputChange('is_active', e.target.value === 'active')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={loading}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Inactive users cannot log in to the system
        </p>
      </div>

      {/* Current Status Display */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Current Status
        </h4>
        <div className="flex space-x-4">
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            customer.is_active
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          )}>
            {customer.is_active ? 'Active' : 'Inactive'}
          </span>
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            customer.role === 'admin'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          )}>
            {customer.role === 'admin' ? 'Admin' : 'Client'}
          </span>
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            customer.email_verified
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          )}>
            {customer.email_verified ? 'Email Verified' : 'Email Unverified'}
          </span>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          Update Customer
        </Button>
      </div>
    </form>
  );
};

export default CustomerEditForm;
