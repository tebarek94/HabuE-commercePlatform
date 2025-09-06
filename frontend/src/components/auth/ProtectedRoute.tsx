import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { canAccessRoute, requiresAdminAccess } from '@/utils/roleUtils';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // If user is not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires admin access but user is not admin
  if (requireAdmin && !canAccessRoute(user, location.pathname)) {
    return <Navigate to="/" replace />;
  }

  // If user can access the route, render children
  return <>{children}</>;
};

export default ProtectedRoute;
