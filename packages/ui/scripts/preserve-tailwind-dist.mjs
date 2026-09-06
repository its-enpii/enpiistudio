import { mkdir } from 'node:fs/promises'
import { copyFileSync, renameSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const tailwindPath = fileURLToPath(new URL('../dist/tailwind.css', import.meta.url))
const preservedPath = fileURLToPath(new URL('../dist/tailwind-preserved.css', import.meta.url))
const distDir = fileURLToPath(new URL('../dist', import.meta.url))

await mkdir(distDir, { recursive: true })

if (!existsSync(tailwindPath)) {
  // Fresh clone or clean build: build tailwind.css first
  execSync('npm run build:tailwind', { stdio: 'inherit', cwd: fileURLToPath(new URL('..', import.meta.url)) })
}

if (existsSync(tailwindPath)) {
  renameSync(tailwindPath, preservedPath)
  copyFileSync(preservedPath, tailwindPath)
}
