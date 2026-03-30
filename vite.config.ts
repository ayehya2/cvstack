import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Force one React copy for the app + @dnd-kit (dedupe alone can still leave two instances in dev chunks).
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/modifiers',
      '@dnd-kit/utilities',
    ],
  },
  server: {
    // Lock 5173 so dev:all leaves 5174 for InterviewMint (see interviewmint vite.config).
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxy LaTeX compilation requests to the latex-on-http API
      // This avoids CORS issues and provides real pdfTeX compilation
      '/api/latex': {
        target: 'https://latex.ytotech.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/latex/, '/builds/sync'),
      },
    },
  },
})
