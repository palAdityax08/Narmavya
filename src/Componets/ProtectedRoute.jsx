import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// ─── Standard ProtectedRoute wrapper ─────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const session = JSON.parse(sessionStorage.getItem("login"));
  const location = useLocation();
  const isAuthenticated = session?.isLoggedIn;

  if (!isAuthenticated) {
    // Save where user was heading so we can redirect back after login
    return <Navigate to="/login" state={{ returnTo: location.pathname + location.search }} replace />;
  }
  return children;
};

export default ProtectedRoute;

// ─── Hook: use inside event handlers to trigger auth gate  ─────────────────
export const useRequireAuth = () => {
  const location = useLocation();
  const session = JSON.parse(sessionStorage.getItem("login"));
  const isAuthenticated = session?.isLoggedIn;
  return {
    isAuthenticated,
    returnTo: location.pathname,
  };
};
