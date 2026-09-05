import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  configFile: false,
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: fileURLToPath(new URL('./entry.tailwind.css', import.meta.url)),
      output: {
        entryFileNames: 'tailwind.css',
        assetFileNames: 'tailwind.css',
      },
      preserveEntrySignatures: false,
    },
  },
})

config.plugins?.push({
  name: 'enpii-tailwind-output',
  writeBundle: async () => {
    const { rename } = await import('node:fs/promises')
    await rename(new URL('./dist/tailwind2.css', import.meta.url), new URL('./dist/tailwind.css', import.meta.url))
  },
})

export default config
