import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',

  // Root directory for Vite
  root: path.resolve(__dirname),

  // Build output directory for Tauri
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
      '@localmind/shared': path.resolve(__dirname, '../shared/src'),
    },
  },

  server: {
    port: 5173,
    strictPort: true,
  },

  // Clear screen on rebuild
  clearScreen: false,
});
