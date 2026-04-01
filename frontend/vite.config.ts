import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const polytechUrl = process.env.VITE_POLYTECH_URL || 'http://localhost:3000'
const laposteUrl = process.env.VITE_LAPOSTE_URL || 'http://localhost:4001'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/offers': polytechUrl,
      '/student': polytechUrl,
      '/students': polytechUrl,
      '/internship': polytechUrl,
      '/api': laposteUrl,
    },
  },
  preview: {
    proxy: {
      '/offers': polytechUrl,
      '/student': polytechUrl,
      '/students': polytechUrl,
      '/internship': polytechUrl,
      '/api': laposteUrl,
    },
  },
})
