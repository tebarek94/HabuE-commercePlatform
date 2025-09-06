import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import { getRedirectPath } from '@/utils/redirect';

const SmartDashboardRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, redirect to appropriate dashboard based on role
  const redirectPath = getRedirectPath(user!);
  return <Navigate to={redirectPath} replace />;
};

export default SmartDashboardRedirect;
