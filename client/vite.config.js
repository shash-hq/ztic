import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // All /api and /socket.io calls forwarded to Express — no CORS issues in dev
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        ws: true,  // WebSocket proxy
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
