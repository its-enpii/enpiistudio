import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { auditTemplateClasses } from '../scripts/audit-template-classes.mjs'

const historicalTokens: string[] = JSON.parse(
  readFileSync(resolve(__dirname, 'fixtures/historical-enpii-classes.json'), 'utf8'),
)

describe('consumer class definition conformance', () => {
  it('defines every class token used by component templates', async () => {
    expect(await auditTemplateClasses()).toEqual([])
  })

  it('rejects audit bypasses and allows explicitly manifested markers', async () => {
    const temporaryRoot = mkdtempSync(join(tmpdir(), 'enpii-class-audit-'))
    const componentsDirectory = join(temporaryRoot, 'components')
    const randomSuffix = randomUUID().replaceAll('-', '')
    const canaryToken = `enpii-canary-${randomSuffix}`
    const fakeMarker = `enpii-badge--fake-${randomSuffix}`

    try {
      mkdirSync(componentsDirectory)
    writeFileSync(join(componentsDirectory, 'EnpiiCanary.vue'), `<template><div class="${canaryToken}" /></template>\n`)
      writeFileSync(join(componentsDirectory, 'EnpiiBadge.vue'), `<template><span class="${fakeMarker}" /></template>\n`)
      writeFileSync(
        join(componentsDirectory, 'EnpiiCommandPalette.vue'),
        '<template><div class="enpii-command-palette-enter-active" /></template>\n',
      )

      const violations = await auditTemplateClasses(componentsDirectory)
      const violationTokens = violations.map(({ token }) => token)

      expect(violationTokens).toContain(canaryToken)
      expect(violationTokens).toContain(fakeMarker)
      expect(violationTokens).not.toContain('enpii-command-palette-enter-active')
      expect(violations.find(({ token }) => token === fakeMarker)?.category).toBe('marker-not-in-manifest')
      expect(violationTokens).not.toContain('material-symbols-outlined')
      expect(violationTokens).not.toContain('peer')
      expect(violationTokens).not.toContain('group')
      expect(violationTokens).not.toContain('group/item')
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  it('requires every historical marker to be explicitly manifested', () => {
    const markerManifest: string[] = JSON.parse(
      readFileSync(resolve(__dirname, 'fixtures/enpii-marker-manifest.json'), 'utf8'),
    )
    const missingMarkers = historicalTokens.filter(token => !markerManifest.includes(token))

    expect(missingMarkers).toEqual([])
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
