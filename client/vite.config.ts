import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_ENV__: process.env.VITE_VERCEL_ENV,
  },
  resolve: {
    alias: {
      "@app/utils": path.resolve(__dirname, "../packages/utils/src/index.ts")
    }
  }
})