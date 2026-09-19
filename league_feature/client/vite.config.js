import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // 4100 is this feature's API; Person D's quiz API runs on 4000.
  server: { proxy: { '/api': 'http://localhost:4100' } },
  test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.js', css: false },
});
