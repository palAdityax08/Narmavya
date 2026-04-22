// ─── Auth Store (Zustand) ─────────────────────────────────────────────────────
// Global authentication state. Replaces scattered sessionStorage.login checks.
// Persists token + user to localStorage so sessions survive page reloads.
//
// Usage:
//   import useAuthStore from '../store/authStore';
//   const { user, token, isAdmin, loginWithGoogle, logout } = useAuthStore();

import { create }                     from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { signInWithPopup }            from 'firebase/auth';
import { auth, googleProvider }       from '../config/firebase';
import api                            from '../utils/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ────────────────────────────────────────────────────────────
      user:  null,     // { _id, name, email, role, avatar }
      token: null,     // JWT string

      // ── Derived ──────────────────────────────────────────────────────────
      isLoggedIn: () => !!get().token,
      isAdmin:    () => get().user?.role === 'admin',

      // ── Google OAuth Login ────────────────────────────────────────────────
      loginWithGoogle: async () => {
        const firebaseResult = await signInWithPopup(auth, googleProvider);
        const idToken        = await firebaseResult.user.getIdToken();

        // Exchange Firebase token for our own JWT
        const { data } = await api.post('/auth/google', { idToken });
        if (!data.success) throw new Error(data.message);

        // Persist token for Axios interceptor
        localStorage.setItem('narmavya_token', data.token);
        // Also set the legacy sessionStorage flag so ProtectedRoute still works
        sessionStorage.setItem('login', JSON.stringify({ isLoggedIn: true, expiry: Date.now() + 7 * 24 * 60 * 60 * 1000 }));

        set({ user: data.user, token: data.token });
        return data.user;
      },

      // ── Email / Password Login ────────────────────────────────────────────
      loginWithEmail: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        if (!data.success) throw new Error(data.message);

        localStorage.setItem('narmavya_token', data.token);
        sessionStorage.setItem('login', JSON.stringify({ isLoggedIn: true, expiry: Date.now() + 7 * 24 * 60 * 60 * 1000 }));

        set({ user: data.user, token: data.token });
        return data.user;
      },

      // ── Email / Password Register ─────────────────────────────────────────
      registerWithEmail: async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        if (!data.success) throw new Error(data.message);

        localStorage.setItem('narmavya_token', data.token);
        sessionStorage.setItem('login', JSON.stringify({ isLoggedIn: true, expiry: Date.now() + 7 * 24 * 60 * 60 * 1000 }));

        set({ user: data.user, token: data.token });
        return data.user;
      },

      // ── Logout ────────────────────────────────────────────────────────────
      logout: () => {
        localStorage.removeItem('narmavya_token');
        sessionStorage.removeItem('login');
        set({ user: null, token: null });
        // Also sign out of Firebase
        auth.signOut().catch(() => {});
      },

      // ── Refresh user from token ───────────────────────────────────────────
      refreshUser: async () => {
        try {
          const { data } = await api.get('/auth/me');
          if (data.success) set({ user: data.user });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name:    'narmavya-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      // On rehydration, re-sync the token into the Axios interceptor key
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem('narmavya_token', state.token);
          sessionStorage.setItem('login', JSON.stringify({ isLoggedIn: true }));
        }
      },
    }
  )
);

export default useAuthStore;
