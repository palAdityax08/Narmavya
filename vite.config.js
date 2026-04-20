import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/', // For local dev and Vercel/Netlify deployment
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});
