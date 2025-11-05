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
        // FIX: __dirname is not available in an ES module scope by default.
        // Replaced with path.resolve('.') which resolves to the current
        // working directory, which is the project root when running Vite.
        '@': path.resolve('.'),
      },
    },
  };
});
