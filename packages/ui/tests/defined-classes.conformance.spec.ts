import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { auditTemplateClasses } from '../scripts/audit-template-classes.mjs'

const historicalTokens: string[] = JSON.parse(
  readFileSync(resolve(__dirname, 'fixtures/historical-enpii-classes.json'), 'utf8'),
)

describe('consumer class definition conformance', () => {
  it('defines every class token used by component templates', async () => {
    expect(await auditTemplateClasses()).toEqual([])
  })

  it('does not restore the non-shipped components stylesheet', () => {
    expect(existsSync(resolve(__dirname, '../src/styles/components.css'))).toBe(false)
    expect(readFileSync(resolve(__dirname, '../src/index.ts'), 'utf8'))
      .not.toContain('styles/components.css')
  })

  it('locks every historical styled marker as a pure marker', () => {
    const shippedSources = [
      readFileSync(resolve(__dirname, '../entry.tailwind.css'), 'utf8'),
      ...readdirSync(resolve(__dirname, '../src/styles'))
        .filter(name => name.endsWith('.css'))
        .map(name => readFileSync(resolve(__dirname, '../src/styles', name), 'utf8')),
    ].join('\n')

    for (const token of historicalTokens) {
      expect(typeof token).toBe('string')
      expect(shippedSources, `${token} must not regain a stylesheet rule`).not.toMatch(
        new RegExp(`\\.${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-zA-Z0-9_-])`),
      )
      expect(typeof token).toBe('string')
    }
  })
})
