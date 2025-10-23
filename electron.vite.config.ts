import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { electronRenderer } from './vite-plugin-electron-renderer.js';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), electronRenderer()],
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: resolve(__dirname, 'packages/main/src/index.ts'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: resolve(__dirname, 'packages/preload/src/index.ts'),
      },
    },
  },
  renderer: {
    root: resolve(__dirname, 'packages/renderer'),
    build: {
      outDir: resolve(__dirname, 'dist/renderer'),
      rollupOptions: {
        input: resolve(__dirname, 'packages/renderer/index.html'),
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@shared': resolve(__dirname, 'packages/shared/src'),
      },
    },
  },
});
