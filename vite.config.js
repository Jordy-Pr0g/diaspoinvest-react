import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/claude': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/claude/, ''),
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        cockpit: 'cockpit.html',
      }
    }
  }
})
