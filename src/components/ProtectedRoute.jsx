import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireGeneralOffice = false, requireFaculty = false }) => {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Helper function to get the appropriate redirect path based on user role
  const getRedirectPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'general-office':
        return '/general-office';
      case 'faculty':
        return '/faculty';
      case 'candidate':
      default:
        return '/dashboard';
    }
  };

  if (requireAdmin && userProfile?.role !== 'admin') {
    return <Navigate to={getRedirectPath(userProfile?.role)} replace />;
  }

  if (requireGeneralOffice && userProfile?.role !== 'general-office') {
    return <Navigate to={getRedirectPath(userProfile?.role)} replace />;
  }

  if (requireFaculty && userProfile?.role !== 'faculty') {
    return <Navigate to={getRedirectPath(userProfile?.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
