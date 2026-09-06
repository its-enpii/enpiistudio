import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const entry = readFileSync(resolve(__dirname, '../entry.tailwind.css'), 'utf8')

function sourceWithCustomVariables(): string {
  const sources = [entry]
  const walk = (directory: string) => {
    for (const item of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, item.name)
      if (item.isDirectory()) walk(path)
      else sources.push(readFileSync(path, 'utf8'))
    }
  }
  walk(resolve(__dirname, '../src'))
  return sources.join('\n')
}

describe('Tailwind-native theme', () => {
  it('defines literal semantic theme values', () => {
    expect(entry).toContain('@theme {')
    expect(entry).toContain('--color-primary: #87CEEB;')
    expect(entry).toContain('--radius-control: 9px;')
    expect(entry).toContain('--spacing-control: 3rem;')
    expect(entry).toContain('--shadow-focus: 0 0 0 4px color-mix(in srgb, var(--color-focus) 25%, transparent);')
    expect(entry).not.toContain('@utility')
  })

  it('removes all legacy Enpii custom properties', () => {
    expect(sourceWithCustomVariables()).not.toContain('var(--enpii-')
    expect(sourceWithCustomVariables()).not.toContain('--enpii-')
  })

  it('defines every color token used by Vue components', () => {
    const usedTokens = new Set<string>()
    const componentFiles = readdirSync(resolve(__dirname, '../src/components'), { withFileTypes: true })
      .filter(item => item.isFile() && item.name.endsWith('.vue'))
      .map(item => `src/components/${item.name}`)

    expect(componentFiles.length).toBeGreaterThan(80)
    for (const relativePath of componentFiles) {
      const source = readFileSync(resolve(__dirname, '..', relativePath), 'utf8')
      for (const match of source.matchAll(/var\((--color-[a-z0-9-]+)/g)) {
        usedTokens.add(match[1])
      }
    }

    expect(usedTokens.size).toBeGreaterThan(0)
    for (const token of usedTokens) {
      expect(entry, `Missing Tailwind theme token: ${token}`).toContain(`${token}:`)
    }
  })
})
