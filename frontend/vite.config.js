import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    open: true,
    // One backend for all three workstreams — see ../server/gateway.js
    proxy: { '/api': 'http://localhost:4000' },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
    // The setup file boots the real API, so give it room on a cold start.
    testTimeout: 15000,
    server: {
      deps: {
        // Load the backends as plain Node modules. Transformed through Vite,
        // their `import.meta.url` stops being a file:// URL and the JSON
        // content files no longer resolve.
        external: [/[\\/]server[\\/]/, /league_feature/, /quiz_feature/, /person-b/],
      },
    },
  },
})
