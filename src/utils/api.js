// ─── Axios API instance ───────────────────────────────────────────────────────
// Centralised HTTP client. Automatically attaches JWT token from authStore.
//
// IMPORTANT: VITE_API_URL *must* be set in Vercel environment variables.
// It must point to the BACKEND project URL, e.g.:
//   VITE_API_URL=https://narmavya-m8ks.vercel.app/api
//
// Vite bakes env vars at BUILD TIME — changing them requires a Vercel redeploy.

import axios from 'axios';

// Determine base URL — never fall back to localhost in production
const BASE_URL = (() => {
  const env = import.meta.env.VITE_API_URL;
  if (env) return env;

  // In development (local), localhost is fine
  if (import.meta.env.DEV) return 'http://localhost:5000/api';

  // In production with no env var set, log a loud warning.
  // We return an empty string so axios uses relative URLs — but the
  // frontend vercel.json excludes /api/* from its SPA rewrite so these
  // will 404 clearly rather than silently 405.
  console.error(
    '[Narmavya] VITE_API_URL is not set!\n' +
    'Go to Vercel → Frontend project → Settings → Environment Variables\n' +
    'and add: VITE_API_URL = https://<your-backend>.vercel.app/api\n' +
    'Then REDEPLOY the frontend project.'
  );
  return '';
})();

const api = axios.create({
  baseURL: BASE_URL,
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
