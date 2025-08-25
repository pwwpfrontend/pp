import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RoleGuard = ({ allowedRoles, children }) => {
  const { isAuthenticated, isAuthorized, loading } = useAuth(allowedRoles);

  console.log('RoleGuard:', { allowedRoles, isAuthenticated, isAuthorized, loading });

  if (loading) {
    console.log('RoleGuard: Loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#405952]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('RoleGuard: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorized) {
    console.log('RoleGuard: Not authorized, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('RoleGuard: Authorized, rendering children');
  return children;
};

export default RoleGuard;