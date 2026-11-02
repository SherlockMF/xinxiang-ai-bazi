import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: './',
    plugins: [react()],
    css: { postcss: { plugins: [tailwindcss()] } },
    server: {
      port: 5173,
      proxy: { '/api': { target: env.API_PROXY_TARGET || 'http://127.0.0.1:3100', changeOrigin: true } }
    },
    build: { target: 'es2022' }
  };
});
