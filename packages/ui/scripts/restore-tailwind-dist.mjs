import { copyFileSync, rmSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const tailwindPath = fileURLToPath(new URL('../dist/tailwind.css', import.meta.url))
const preservedPath = fileURLToPath(new URL('../dist/tailwind-preserved.css', import.meta.url))

if (statSync(preservedPath, { throwIfNoEntry: false })) {
  copyFileSync(preservedPath, tailwindPath)
  rmSync(preservedPath)
}
