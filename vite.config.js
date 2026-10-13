import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // jSquash tự tải file .wasm qua import.meta.url, pre-bundle sẽ làm sai đường dẫn
  optimizeDeps: { exclude: ['@jsquash/webp'] },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8081',
    },
  },
});
