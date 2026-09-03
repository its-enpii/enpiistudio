import { fileURLToPath, URL } from 'node:url'
import { cp } from 'node:fs/promises'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-style-layers',
      closeBundle: async () => {
        await cp(
          fileURLToPath(new URL('./styles', import.meta.url)),
          fileURLToPath(new URL('./dist/styles', import.meta.url)),
          { recursive: true },
        )
        await cp(
          fileURLToPath(new URL('./src/assets', import.meta.url)),
          fileURLToPath(new URL('./dist/assets', import.meta.url)),
          { recursive: true },
        )
        await cp(
          fileURLToPath(new URL('./tailwind.v4.css', import.meta.url)),
          fileURLToPath(new URL('./dist/tailwind.v4.css', import.meta.url)),
        )
        await cp(
          fileURLToPath(new URL('./tailwind.preset.js', import.meta.url)),
          fileURLToPath(new URL('./dist/tailwind.preset.js', import.meta.url)),
        )
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'EnpiiStudioUi',
      fileName: 'enpii-ui',
    },
    rollupOptions: {
      external: ['vue', '@tiptap/vue-3', '@tiptap/starter-kit', /^@tiptap\//, /^prosemirror-/, 'qrcode'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
})
