import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      // Use Preact for smaller bundle
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 10, // Maximum compression passes
        unsafe: true,
        unsafe_comps: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
        side_effects: false
      },
      mangle: { toplevel: true },
      format: { comments: false }
    },
    rollupOptions: {
      output: {
        manualChunks: () => 'index', // Single chunk for maximum compression
        entryFileNames: 'app-[hash].js',
        assetFileNames: 'app-[hash].[ext]'
      }
    },
    sourcemap: false,
    target: 'es2020',
    assetsInlineLimit: 0, // Don't inline anything, keep separate
    chunkSizeWarningLimit: 50000 // 50MB limit
  },
  root: 'client'
});