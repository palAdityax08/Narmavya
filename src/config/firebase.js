// ─── Firebase Client Config — narmavya-a2362 ─────────────────────────────────
// Google Auth is enabled. Go to:
// Firebase Console → Authentication → Sign-in method → Enable Google

import { initializeApp, getApps }     from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'AIzaSyDsS0NibKSSqQM2Rz5VSauZs-M1uS76O10',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'narmavya-a2362.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'narmavya-a2362',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'narmavya-a2362.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| '866776766189',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:866776766189:web:84599a0ef78cb0af639ee4',
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     || 'G-VYP2ZC1QPQ',
};

// Prevent re-initialization during hot module reload
const app            = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth           = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.addScope('email');
googleProvider.addScope('profile');

export { auth, googleProvider };
export default app;
