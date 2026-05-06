import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',  // ← CRÍTICO: Evita 404 de assets en Vercel
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});