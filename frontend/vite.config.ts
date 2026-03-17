import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/offers': 'http://localhost:3000',
      '/student': 'http://localhost:3000',
      '/students': 'http://localhost:3000',
      '/internship': 'http://localhost:3000',
    },
  },
})
