import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// ── AdminRoute ────────────────────────────────────────────────────────────────
// Wraps any route that should only be accessible to users with role === "admin".
// Non-logged-in users → redirect to /login
// Logged-in non-admins → redirect to / with a flag to show an access denied toast
//
// Usage in main.jsx:
//   { path: '/admin', element: <AdminRoute><AdminDashboard /></AdminRoute> }
const AdminRoute = ({ children }) => {
  const location   = useLocation();
  const { user, isLoggedIn, isAdmin } = useAuthStore();

  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" state={{ accessDenied: true }} replace />;
  }

  return children;
};

export default AdminRoute;
