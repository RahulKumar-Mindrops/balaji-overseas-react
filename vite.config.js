import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('error', () => {
            console.warn(
              '\n[vite proxy] API not reachable at http://localhost:3001 — start the backend: npm run dev:backend\n' +
                '            (or run both: npm run dev:full)\n',
            )
          })
        },
      },
    },
  },
})
