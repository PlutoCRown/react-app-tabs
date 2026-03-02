import { defineConfig } from 'vite';

const resolve = (relativePath: string) => new URL(relativePath, import.meta.url).pathname;

export default defineConfig({
  base: '/react-app-tabs/',
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: resolve('./node_modules/react'),
      'react-dom': resolve('./node_modules/react-dom'),
      'react/jsx-runtime': resolve('./node_modules/react/jsx-runtime.js'),
    },
  },
  server: {
    port: 5173,
    fs: {
      allow: ['..'],
    },
  },
});
