import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@its-enpii/ui': fileURLToPath(new URL('../ui', import.meta.url)),
      '@its-enpii/ui/dist': fileURLToPath(new URL('../ui/dist', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'EnpiiSkeleton',
      fileName: 'enpii-skeleton',
    },
    rollupOptions: {
      external: ['vue', '@its-enpii/ui'],
      output: {
        globals: {
          vue: 'Vue',
          '@its-enpii/ui': 'EnpiiUi',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: {
    fs: {
      allow: [fileURLToPath(new URL('./..', import.meta.url))],
    },
  },
})
