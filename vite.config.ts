import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom']
  },
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    hmr: process.env.DISABLE_HMR === 'true' ? false : {
      protocol: 'wss',
      host: 'ais-dev-abpyzgtehgloftmrbpss3v-708515236167.asia-east1.run.app',
      clientPort: 443
    }
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-recharts': ['recharts'],
          'vendor-icons': ['lucide-react'],
          'vendor-motion': ['framer-motion']
        }
      }
    }
  }
});
