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

const extractTokens = (source: string) => {
  const sourceWithoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '')
  const tokens = new Set<string>()
  for (const [, name] of sourceWithoutComments.matchAll(/--([a-z0-9-]+)\s*:\s*[^;]+;/g)) {
    tokens.add(`--${name}`)
  }
  return tokens
}

const allHookTokens = new Set<string>()
for (const layer of styleLayers) {
  for (const token of extractTokens(layerSources[layer])) {
    allHookTokens.add(token)
  }
}

describe('Enpii UI style layer value sets', () => {
  it('defines 100% of the hook taxonomy with 0 missing variables across all 6 layers', () => {
    expect(styleLayers).toHaveLength(6)
    expect(allHookTokens.size).toBe(148)

    for (const layer of styleLayers) {
      const layerTokens = extractTokens(layerSources[layer])
      const missing = [...allHookTokens].filter(token => !layerTokens.has(token))
      expect(missing, `${layer} must have 0 missing variables from the taxonomy`).toEqual([])
      expect(layerTokens.size).toBe(allHookTokens.size)
    }
  })

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
    expect(source).toContain('--card-border-width:')
    expect(source).toContain('--card-border-style:')
    expect(source).toContain('--card-border-color:')
    expect(source).toContain('--control-border-color:')
    expect(source).toContain('--control-border-color-filled:')
    expect(source).toContain('--overlay-border-color:')
    expect(source).toContain('--control-shadow:')
    expect(source).toContain('--shadow-card:')
    expect(source).toContain('--shadow-focus:')
    expect(source).toContain('--radius-sm:')
    expect(source).toContain('--radius-md:')
    expect(source).toContain('--radius-lg:')
    expect(source).toContain('--radius-xl:')
    expect(source).toContain('--radius-2xl:')
    expect(source).toContain('--radius-track:')
    expect(source).toContain('--radius-media:')
    expect(source).toContain('--focus-width:')
    expect(source).toContain('--focus-width-overlay:')
    expect(source).toContain('--focus-width-priority:')
    expect(source).toContain('--focus-width-minimal:')
    expect(source).toContain('--focus-offset:')
    expect(source).toContain('--focus-offset-negative:')
    expect(source).toContain('--focus-offset-negative-outside:')
    expect(source).toContain('--focus-offset-negative-wide:')
    expect(source).toContain('--focus-offset-outside:')
    expect(source).toContain('--focus-offset-wide:')
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

    const sourceWithoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/#0000\b/g, '')
    expect(sourceWithoutComments).not.toMatch(/#[0-9a-fA-F]{3,8}/)
  })
})
