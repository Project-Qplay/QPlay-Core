import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Ensure correct asset paths for Netlify/static hosting
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
