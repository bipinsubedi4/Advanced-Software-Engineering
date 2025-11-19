import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  const hasAccess = (userRole: string, roles?: string[]) => {
    if (!roles || roles.length === 0) {
      return true;
    }

    if (roles.includes(userRole)) {
      return true;
    }

    if (userRole === 'PROVIDER' && roles.includes('CUSTOMER')) {
      // Providers can also act as customers (book services)
      return true;
    }

    if (userRole === 'ADMIN') {
      // Admin accounts should be able to view all routes
      return true;
    }

    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAccess(user.role, allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
