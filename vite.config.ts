import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API requests to the NestJS backend in dev to keep same-origin
    // This enables httpOnly refresh cookies to be sent reliably from the browser
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // If backend is mounted at /api already, no rewrite needed
        // rewrite: (path) => path,
      },
    },
  },
})
