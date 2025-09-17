import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <- obligatoire pour Tailwind v4
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les dépendances lourdes
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-alert-dialog', '@radix-ui/react-dropdown-menu'],
          'utils-vendor': ['yup', 'lucide-react'],
          'supabase-vendor': ['@supabase/supabase-js']
        }
      }
    },
    // Optimisations pour réduire la taille
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Augmenter la limite d'avertissement
    chunkSizeWarningLimit: 1000
  }
})
