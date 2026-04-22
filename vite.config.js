import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // For local dev and Vercel/Netlify deployment
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached separately across pages
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animation library — large but rarely changes
          'vendor-motion': ['framer-motion'],
          // State management + utilities
          'vendor-utils': ['zustand', 'axios', 'react-toastify'],
          // Firebase SDK sub-packages
          'vendor-firebase': ['firebase/app', 'firebase/auth'],
        },
      },
    },
  },
});

