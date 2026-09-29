import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const DashboardRouter = () => {
  const { role } = useAuth();
  
  switch (role) {
    case 'ADMIN':
      return <Navigate to="/dashboard/admin" replace />;
    case 'AGENT':
      return <Navigate to="/dashboard/agent" replace />;
    case 'CUSTOMER':
    default:
      return <Navigate to="/dashboard/customer" replace />;
  }
};
