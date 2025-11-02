import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/core': '/src/modules/core',
      '@/auth': '/src/modules/auth',
      '@/bookings': '/src/modules/bookings',
      '@/fields': '/src/modules/fields',
      '@/venues': '/src/modules/venues',
      '@/user-profile': '/src/modules/user-profile',
      '@/search': '/src/modules/search',
      '@/admin': '/src/modules/admin',
      '@/analytics': '/src/modules/analytics',
      '@/assets': '/src/assets',
      '@/components': '/src/components',
    }
  }
})
