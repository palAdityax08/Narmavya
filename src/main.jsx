import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './Componets/Home.jsx';
import Product from './Componets/product.jsx';
import About from './Componets/about.jsx';
import Contact from './Componets/contact.jsx';
import SignUp from './Componets/singUp.jsx';
import Login from './Componets/login.jsx';
import AddToCart from './Componets/Others/addTocart.jsx';
import ProtectedRoute from "./Componets/ProtectedRoute.jsx";
import Detail from './Componets/detail.jsx';
import Payment from './Componets/payment.jsx';
import Wishlist from './Componets/wishlist.jsx';
import ProductInfo from './Componets/Others/productInfo.jsx';
import Profile from './Componets/profile.jsx';
import Orders from './Componets/orders.jsx';
import OrderDetail from './Componets/orderDetail.jsx';

// ── Auto-restore session ─────────────────────────────────────────────────────
// If a user is stored in localStorage (registered/logged in before),
// auto-mark them as logged in so they don't have to re-login on every
// browser open — exactly like Amazon, Flipkart, Swiggy etc.
const storedUser = JSON.parse(localStorage.getItem('user'));
const existingSession = JSON.parse(sessionStorage.getItem('login'));
if (storedUser && !existingSession?.isLoggedIn) {
  // Restore session silently — 7-day rolling session
  const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
  sessionStorage.setItem('login', JSON.stringify({ isLoggedIn: true, expiry }));
}
// ────────────────────────────────────────────────────────────────────────────

const routers = createBrowserRouter(
  [
    // ── PUBLIC ROUTES (no auth required) ──────────────────────────
    { path: "/",                element: <Home /> },
    { path: "products/:category", element: <Product /> },
    { path: "products",         element: <Product /> },
    { path: "about",            element: <About /> },
    { path: "Contact",          element: <Contact /> },
    { path: "/product/:id",     element: <ProductInfo /> },
    { path: "login",            element: <Login /> },
    { path: "signUp",           element: <SignUp /> },

    // ── AUTH-GATED ROUTES ─────────────────────────────────────────
    {
      path: "/details-form",
      element: <ProtectedRoute><Detail /></ProtectedRoute>
    },
    {
      path: "/payment",
      element: <ProtectedRoute><Payment /></ProtectedRoute>
    },
    {
      path: "wishlist",
      element: <ProtectedRoute><Wishlist /></ProtectedRoute>
    },
    {
      path: "addToCart",
      element: <ProtectedRoute><AddToCart /></ProtectedRoute>
    },
    {
      path: "profile",
      element: <ProtectedRoute><Profile /></ProtectedRoute>
    },
    {
      path: "orders",
      element: <ProtectedRoute><Orders /></ProtectedRoute>
    },
    {
      path: "orders/:orderId",
      element: <ProtectedRoute><OrderDetail /></ProtectedRoute>
    },
  ]
);

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <RouterProvider router={routers} />
  </HelmetProvider>
);
