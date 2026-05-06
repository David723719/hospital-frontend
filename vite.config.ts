import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://hospitalizacion-api-production.up.railway.app',
        changeOrigin: true,
        secure: true
      }
    }
  },
  build: { outDir: 'dist', sourcemap: false }
})