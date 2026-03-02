import { defineConfig } from 'vite';

export default defineConfig({
  base: '/react-app-tabs/',
  server: {
    port: 5173,
    fs: {
      allow: ['..'],
    },
  },
});
