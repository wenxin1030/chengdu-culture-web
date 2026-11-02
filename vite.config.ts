/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 部署在 <user>.github.io/<repo>/ 时，用 BASE_PATH=/<repo>/ 构建
  base: process.env.BASE_PATH || '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    open: false,
  },
  preview: {
    port: 4173,
    host: '127.0.0.1',
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['src/utils/**', 'src/stores/**', 'src/composables/**', 'src/api/**'],
      exclude: ['**/*.d.ts'],
    },
  },
})