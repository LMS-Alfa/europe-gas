import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: 'localhost',
    strictPort: true,
    hmr: {
      host: 'localhost',
      port: 3000,
      clientPort: null,
      protocol: 'ws',
      timeout: 120000,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    cors: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'styled-components', 'framer-motion']
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1600
  }
})
