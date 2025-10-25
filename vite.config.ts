import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, '.', '');
  const isBuild = command === 'build';

  return {
    plugins: [
      react(),
      dts({
        insertTypesEntry: true,
        skipDiagnostics: false,
        tsconfigPath: './tsconfig.json'
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    build: {
      lib: isBuild
        ? {
          entry: 'src/index.ts',
          name: 'RotorWiseAI',
          fileName: (format) => `index.${format}.js`
        }
        : undefined,
      rollupOptions: {
        external: ['react', 'react-dom', '@google/genai'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM'
          }
        }
      }
    }
  };
});