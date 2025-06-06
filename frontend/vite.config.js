import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {visualizer} from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
    build: {
    target: 'esnext',               // Modern JS target
    minify: 'esbuild',              // Faster, leaner minification
    cssMinify: true,                // Minify CSS
    sourcemap: false,               // No source maps for production
    assetsInlineLimit: 4096,        // Inline small assets
    chunkSizeWarningLimit: 500,     // Warn about large chunks
  },
  server: {
    host: true,                     // Enables LAN access (for mobile)
    port: 8888
  }
})
