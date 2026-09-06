import { mkdir } from 'node:fs/promises'
import { copyFileSync, renameSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const tailwindPath = fileURLToPath(new URL('../dist/tailwind.css', import.meta.url))
const preservedPath = fileURLToPath(new URL('../dist/tailwind-preserved.css', import.meta.url))

await mkdir(fileURLToPath(new URL('../dist', import.meta.url)), { recursive: true })
renameSync(tailwindPath, preservedPath)
copyFileSync(preservedPath, tailwindPath)
