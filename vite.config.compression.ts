import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// ULTRA-AGGRESSIVE COMPRESSION CONFIG for YC Demo
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  build: {
    // Extreme optimization settings
    minify: 'terser',
    terserOptions: {
      compress: {
        // Ultra-aggressive compression
        drop_console: true, // Remove all console logs
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info'], // Remove specific functions
        passes: 3, // Multiple compression passes
        unsafe: true, // Enable unsafe optimizations
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true,
        collapse_vars: true,
        reduce_vars: true,
        hoist_funs: true,
        hoist_vars: true,
        dead_code: true,
        evaluate: true,
        loops: true,
        unused: true,
        toplevel: true,
        booleans_as_integers: true
      },
      mangle: {
        // Aggressive variable name mangling
        toplevel: true,
        eval: true,
        reserved: []
      },
      format: {
        // Remove all comments and whitespace
        comments: false,
        beautify: false,
        semicolons: false,
        braces: false
      }
    },
    rollupOptions: {
      output: {
        // Force everything into one chunk for maximum compression
        manualChunks: () => 'index',
        // Ultra-compressed file names
        entryFileNames: 'index-[hash].js',
        chunkFileNames: 'chunk-[hash].js',
        assetFileNames: 'asset-[hash].[ext]',
        // Compression settings
        compact: true
      },
      // Remove unused code
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    },
    // Increase chunk size warning to avoid noise
    chunkSizeWarningLimit: 10000, // 10MB limit
    // Disable source maps for smaller build
    sourcemap: false,
    // Target modern browsers for better compression
    target: 'es2020',
    // Inline small assets
    assetsInlineLimit: 8192, // 8KB
    // CSS optimization
    cssMinify: 'lightningcss'
  },
  // Remove dev tools from build
  define: {
    'process.env.NODE_ENV': '"production"',
    '__DEV__': false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [],
    exclude: ['@replit/vite-plugin-cartographer']
  }
});