import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import { getRedirectPath } from '@/utils/redirect';

const SmartHomeRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // If authenticated, redirect to appropriate dashboard based on role
  if (isAuthenticated && user) {
    const redirectPath = getRedirectPath(user);
    return <Navigate to={redirectPath} replace />;
  }

  // If not authenticated, stay on home page
  return null;
};

export default SmartHomeRedirect;
