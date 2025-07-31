import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { analyzer } from 'rollup-plugin-analyzer';
import compression from 'vite-plugin-compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react({
      // Use Preact for smaller bundle size
      jsxRuntime: 'automatic',
      jsxImportSource: '@preact/compat'
    }),
    themePlugin(),
    // Bundle analyzer to see what's taking space
    analyzer({ summaryOnly: true }),
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression (even better)
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
      // Use Preact instead of React for smaller size
      "react": "@preact/compat",
      "react-dom": "@preact/compat"
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    // Ultra-aggressive compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 5, // More compression passes
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        collapse_vars: true,
        reduce_vars: true,
        dead_code: true,
        unused: true,
        toplevel: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info'],
        pure_getters: true,
        hoist_funs: true,
        hoist_vars: true,
        side_effects: false
      },
      mangle: {
        toplevel: true,
        safari10: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false,
        ascii_only: true
      }
    },
    rollupOptions: {
      output: {
        // Split into optimized chunks
        manualChunks: {
          // Separate React/Preact
          'react-vendor': ['react', 'react-dom'],
          // Separate UI components
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
          // Keep videos separate for lazy loading
          'videos': ['./src/embedded-videos/index.ts'],
          // Other vendors
          'vendor': ['@tanstack/react-query', 'wouter']
        },
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    },
    // Remove source maps completely
    sourcemap: false,
    // Increase chunk size limit
    chunkSizeWarningLimit: 15000,
    // Inline very small assets
    assetsInlineLimit: 4096, // 4KB
    // Target modern browsers for better compression
    target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['@preact/compat'],
    exclude: ['@replit/vite-plugin-cartographer']
  },
  // Production-only settings
  define: {
    'process.env.NODE_ENV': '"production"',
    '__DEV__': false,
    // Remove debug flags
    'process.env.DEBUG': 'false'
  }
});