import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import { Plus, Edit, Trash2, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '@/store/authStore';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllUsers({ limit: 50 });
      setAdminUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (userData: any) => {
    setLoading(true);
    try {
      await adminApi.createUser(userData);
      await fetchUsers();
      setShowCreateModal(false);
      toast.success('User created successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw to prevent form from closing
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userData: any) => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      await adminApi.updateUser(selectedUser.id, userData);
      await fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
      toast.success('User updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw to prevent form from closing
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    setLoading(true);
    try {
      await adminApi.deleteUser(userId);
      await fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
      toast.success('User deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    setLoading(true);
    try {
      await adminApi.updateUser(userId, { is_active: !currentStatus });
      await fetchUsers();
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (value: unknown, admin: AdminUser) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {admin.first_name} {admin.last_name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {admin.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (value: unknown, admin: AdminUser) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <Shield className="w-3 h-3 mr-1" />
          {admin.role}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: unknown, admin: AdminUser) => (
        <div className="flex flex-col space-y-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            admin.is_active 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            <UserCheck className="w-3 h-3 mr-1" />
            {admin.is_active ? 'Active' : 'Inactive'}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            admin.email_verified 
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            {admin.email_verified ? 'Verified' : 'Unverified'}
          </span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value: unknown, admin: AdminUser) => (
        <span className="text-gray-900 dark:text-gray-100">
          {admin.phone || 'Not provided'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: unknown, admin: AdminUser) => (
        <span className="text-gray-900 dark:text-gray-100">
          {new Date(admin.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: unknown, admin: AdminUser) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedUser(admin);
              setShowEditModal(true);
            }}
            disabled={admin.id === currentUser?.id}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedUser(admin);
              setShowDeleteModal(true);
            }}
            disabled={admin.id === currentUser?.id}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleCreateAdmin = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Admin Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage administrator accounts and permissions
          </p>
        </div>
        <Button onClick={handleCreateAdmin}>
          <Plus className="w-4 h-4 mr-2" />
          Add Admin User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Admins
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {adminUsers.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Admins
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {adminUsers.filter(admin => admin.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Verified Admins
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {adminUsers.filter(admin => admin.email_verified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Admin Roles
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {new Set(adminUsers.map(admin => admin.role)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Users Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Administrator Accounts
          </h3>
        </CardHeader>
        <CardContent>
          <DataTable
            data={adminUsers}
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete "{selectedUser?.first_name} {selectedUser?.last_name}"? This action cannot be undone.
          </p>
          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleDeleteUser(selectedUser.id)}
              loading={loading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Create New Admin User
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This feature will be implemented with the admin management API.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowCreateModal(false)}>
                Create Admin
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Edit Admin User
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Editing: {selectedUser.first_name} {selectedUser.last_name}
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowEditModal(false)}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
