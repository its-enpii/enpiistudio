import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const styleLayers = [
  'material',
  'glassmorphism',
  'neumorphism',
  'neobrutalism',
  'neobrutalism-tamed',
  'minimalism',
] as const
const tokenOnlyLayers = styleLayers

const layerSources = Object.fromEntries(
  styleLayers.map(layer => [
    layer,
    readFileSync(resolve(__dirname, `../src/styles/layers/${layer}.css`), 'utf8'),
  ]),
)

describe('Enpii UI style layer value sets', () => {
  it.each(tokenOnlyLayers)('%s is a parseable token-only value set', (layer) => {
    const source = layerSources[layer]

    expect(source).toContain(`[data-enpii-layer="${layer}"] {`)
    expect(source).toContain('--radius-control:')
    expect(source).toContain('--shadow-md:')
    expect(source).toContain(':root,')
    expect(source.slice(0, source.indexOf('@media'))).not.toContain('@media')
    expect(source).not.toMatch(/\.enpii-[a-z0-9-]+/)
  })

  it.each(styleLayers)('%s defines every structural token', (layer) => {
    const source = layerSources[layer]

    expect(source).toContain('--control-border-width:')
    expect(source).toContain('--overlay-border-width:')
    expect(source).toContain('--press-transform:')
    expect(source).toContain('--shadow-control-pressed:')
  })

  it('keeps neobrutalism value set in native tokens', () => {
    const source = layerSources.neobrutalism

    expect(source).toContain('[data-enpii-layer="neobrutalism"] {')
    expect(source).toContain('--radius-control:')
    expect(source).toContain('--shadow-md:')
    expect(source).toContain('--shadow-control: 3px 3px 0 var(--color-ink);')
    expect(source).toContain('--shadow-card: 4px 4px 0 var(--color-ink);')
    expect(source).toContain('--shadow-focus: 0 0 0 2px var(--color-ink);')
    expect(source).not.toMatch(/--enpii-/)
  })

  it.each(styleLayers)('%s forbids selectors, !important, overweight and raw color values', (layer) => {
    const source = layerSources[layer]

    expect(source).not.toMatch(/\.enpii-[a-z0-9-]+/)
    expect(source).not.toContain('!important')

    for (const match of source.matchAll(/font-weight:\s*(\d+)/gi)) {
      expect(Number(match[1])).toBeLessThanOrEqual(600)
    }

    const sourceWithoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(sourceWithoutComments).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })
})
