import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import path from 'path'

// Load backend server env to discover PORT dynamically for dev proxy
const serverEnv = dotenv.config({ path: path.resolve(__dirname, '../.env') })
const backendPort = serverEnv.parsed?.PORT || process.env.PORT || '3006'
const backendUrl = `http://localhost:${backendPort}`

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Use relative /api in frontend; Vite proxies to the running backend
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
