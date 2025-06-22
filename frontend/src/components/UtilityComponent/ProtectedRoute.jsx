// src/components/ProtectedRoute.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authChecked } = useSelector((state) => state.auth);
  const location = useLocation();

  // 1. While we're checking for authentication, show a loading state.
  //    This prevents a "flash" of the login page on a reload.
  if (!authChecked) {
    return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
  }

  // 2. Once checked, if the user is authenticated, render the component they wanted to access.
  if (isAuthenticated) {
    return children;
  }
  
  // 3. If not authenticated, redirect them to the login page.
  //    `replace` prevents the user from hitting "back" to the protected page.
  //    `state` remembers the page they were trying to visit, so you can redirect them back after login.
  return <Navigate to="/" state={{ from: location }} replace />;
};