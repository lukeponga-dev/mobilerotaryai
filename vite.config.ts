import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  return {
    plugins: [
      react(),
      dts() // Generates TypeScript declaration files for library builds
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src') // Simplifies imports like '@/components/Header'
      }
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY)
    },
    build: {
      lib: isBuild
        ? {
          entry: 'src/index.ts',
          name: 'RoboWiseAI',
          fileName: (format) => `index.${format}.js`
        }
        : undefined,
      rollupOptions: {
        external: ['react', '@google/genai'],
        output: {
          globals: {
            react: 'React'
          }
        }
      }
    }
  };
});