import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // In development, send /api requests to the Express server in server/
  server: {
    proxy: { '/api': 'http://localhost:3001' },
  },
})
