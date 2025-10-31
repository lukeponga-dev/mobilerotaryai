import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      allowedHosts: ['aimechanic.netlify.app'],
      cors: {
        origin: ['https://aimechanic.netlify.app'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
      },
      https: false, // Set to true if using local HTTPS with certs
      headers: {
        'Access-Control-Allow-Origin': 'https://aimechanic.netlify.app',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Credentials': 'true',
      },
    },
  };
});
