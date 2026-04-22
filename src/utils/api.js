// ─── Axios API instance ───────────────────────────────────────────────────────
// Centralised HTTP client. Automatically attaches JWT token from authStore.
// Usage:
//   import api from '../utils/api';
//   const res = await api.get('/products?category=silk-textiles');
//   const res = await api.post('/orders', { items, grandTotal, ... });

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT from localStorage ─────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('narmavya_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: surface error messages nicely ───────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
