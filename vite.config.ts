import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    server: {
  allowedHosts: ['ai-mechanic-0gyf.onrender.com'],
  port: 5173,
  open: true
    }
  };
});
