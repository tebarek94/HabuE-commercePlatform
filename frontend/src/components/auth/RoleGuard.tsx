import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { canPerformAdminActions } from '@/utils/roleUtils';

interface RoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAdmin?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  fallback = null,
  requireAdmin = false 
}) => {
  const { user } = useAuthStore();

  // If admin access is required but user doesn't have it
  if (requireAdmin && !canPerformAdminActions(user)) {
    return fallback ? <>{fallback}</> : null;
  }

  // If user has required access, render children
  return <>{children}</>;
};

export default RoleGuard;
