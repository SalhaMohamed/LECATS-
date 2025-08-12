import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // If a token exists, render the child component (via <Outlet />)
  // Otherwise, redirect to the /login page
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;