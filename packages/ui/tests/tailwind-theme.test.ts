import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const skyTokens = readFileSync(resolve(__dirname, '../src/theme/sky/tokens.css'), 'utf8')

describe('sky Tailwind theme', () => {
  it('defines every color token used by Vue components', () => {
    const usedTokens = new Set<string>()
    const componentFiles = readdirSync(resolve(__dirname, '../src/components'), { withFileTypes: true })
      .filter(entry => entry.isFile() && entry.name.endsWith('.vue'))
      .map(entry => `src/components/${entry.name}`)

    expect(componentFiles.length).toBeGreaterThan(80)
    for (const relativePath of componentFiles) {
      const source = readFileSync(resolve(__dirname, '..', relativePath), 'utf8')
      for (const match of source.matchAll(/var\((--enpii-color-[a-z0-9-]+)/g)) {
        usedTokens.add(match[1])
      }
    }

    expect(usedTokens.size).toBeGreaterThan(0)
    for (const token of usedTokens) {
      expect(skyTokens, `Missing sky token: ${token}`).toContain(`${token}:`)
    }
  })

  it('defines the approved light and dark sky values', () => {
    for (const declaration of [
      '--enpii-color-primary: #87CEEB;',
      '--enpii-color-primary-hover: #5FB8DB;',
      '--enpii-color-primary-text: #0369A1;',
      '--enpii-color-primary-soft: #E0F2FE;',
      '--enpii-color-primary-border: #7DD3FC;',
      '--enpii-color-primary-container: #7DD3FC;',
      '--enpii-color-on-primary-container: #0C4A6E;',
      '--enpii-color-primary-deep: #0C4A6E;',
      '--enpii-color-focus: #0284C7;',
      '--enpii-color-accent: #F4B740;',
      '--enpii-color-ink: #14202B;',
      '--enpii-color-surface: #F7F9FA;',
      '--enpii-color-outline: #8B9AB0;',
      '--enpii-color-outline-variant: #D0D8E0;',
    ]) {
      expect(skyTokens).toContain(declaration)
    }

    const dark = skyTokens.slice(skyTokens.indexOf('@media (prefers-color-scheme: dark)'))
    for (const declaration of [
      '--enpii-color-surface: #0F172A;',
      '--enpii-color-surface-container: #334155;',
      '--enpii-color-ink: #CBD5E1;',
      '--enpii-color-primary: #38BDF8;',
      '--enpii-color-primary-text: #7DD3FC;',
      '--enpii-color-focus: #38BDF8;',
      '--enpii-color-outline: #64748B;',
      '--enpii-color-outline-variant: #475569;',
    ]) {
      expect(dark).toContain(declaration)
    }
  })

  it('exposes each semantic color token through Tailwind @theme utilities', () => {
    const entry = readFileSync(resolve(__dirname, '../entry.tailwind.css'), 'utf8')
    const tokenNames = [...new Set([...skyTokens.matchAll(/--enpii-color-[a-z0-9-]+(?=:)/g)].map(match => match[0]))]
    expect(tokenNames).toHaveLength(54)

    for (const tokenName of tokenNames) {
      const utilityName = tokenName.replace('--enpii-color-', '--color-')
      expect(entry, `Missing Tailwind theme binding: ${utilityName}`).toContain(`${utilityName}: var(${tokenName})`)
    }
  })
})
