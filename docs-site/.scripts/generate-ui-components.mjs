import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const sourcePath = resolve(root, 'packages/ui/src/index.ts')
const outputPath = resolve(root, 'docs-site/.generated/ui-components.md')

const source = readFileSync(sourcePath, 'utf8')
const matches = [...source.matchAll(/export\s+\{\s*default\s+as\s+(Enpii[A-Za-z0-9]+)\s*\}/g)]
const names = [...new Set(matches.map(match => match[1]))].sort((a, b) => a.localeCompare(b))

const table = [
  'Berikut dihasilkan otomatis dari `packages/ui/src/index.ts` saat build.',
  '',
  `Total komponen: **${names.length}**.`,
  '',
  '| Komponen | Nama export |',
  '| --- | --- |',
  ...names.map(name => `| ${name.replace(/^Enpii/, '').replace(/([a-z0-9])([A-Z])/g, '$1 $2')} | \`${name}\` |`),
].join('\n')

writeFileSync(outputPath, `${table}\n`)
console.log(`Generated ${names.length} UI component entries.`)
