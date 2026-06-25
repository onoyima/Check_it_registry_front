import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import path from 'path'

const serverEnv = dotenv.config({ path: path.resolve(__dirname, '../Check_it_registry_back/.env') })
const backendPort = serverEnv.parsed?.PORT || process.env.PORT || '3006'
const backendUrl = `http://localhost:${backendPort}`

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^react-router$/, replacement: path.resolve(__dirname, 'node_modules/react-router/dist/production/index.mjs') },
      { find: /^react-router\/dom$/, replacement: path.resolve(__dirname, 'node_modules/react-router/dist/production/dom-export.mjs') },
      { find: /^framer-motion$/, replacement: path.resolve(__dirname, 'node_modules/framer-motion/dist/cjs/index.js') },
    ],
  },
  server: {
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
