import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { defineEnpiiUiConfig, enpiiUiStyleLayers } from '../src/config'

const styleLayers = ['material', 'glassmorphism', 'neumorphism', 'neobrutalism', 'minimalism'] as const

const layerSources = Object.fromEntries(
  styleLayers.map(layer => [
    layer,
    readFileSync(resolve(__dirname, `../src/styles/layers/${layer}.css`), 'utf8'),
  ]),
)

function rootTokens(source: string): string[] {
  return source.match(/--enpii-[a-z0-9-]+(?=:)/g) ?? []
}

describe('Enpii UI style layer value sets', () => {
  it.each(styleLayers)('%s is a parseable token-only value set', (layer) => {
    const source = layerSources[layer]

    expect(source).toContain(`[data-enpii-layer="${layer}"] {`)
    expect(source).toContain('--enpii-radius-control:')
    expect(source).toContain('--enpii-shadow-md:')
    expect(source).toContain('--enpii-font-weight-medium:')
    expect(rootTokens(source)).toContain('--enpii-radius-control')
    expect(source).toContain(':root,')
    expect(source.slice(0, source.indexOf('@media'))).not.toContain('@media')
    expect(source).not.toMatch(/\.enpii-[a-z0-9-]+/)
  })

  it('enforces font-weight caps and neobrutalism solid offsets', () => {
    for (const layer of ['material', 'glassmorphism', 'neumorphism', 'minimalism'] as const) {
      for (const token of ['--enpii-font-weight-medium:', '--enpii-font-weight-semibold:']) {
        expect(layerSources[layer]).toContain(`${token} 500;`)
      }
    }

    const neobrutalism = layerSources.neobrutalism
    expect(neobrutalism).toContain('--enpii-font-weight-medium: 500;')
    expect(neobrutalism).toContain('--enpii-font-weight-semibold: 600;')
    expect(neobrutalism).toMatch(/--enpii-shadow-control: 2px 2px 0 /)
    expect(neobrutalism).toMatch(/--enpii-shadow-md: 2px 2px 0 /)
  })

  it('does not change brand color tokens', () => {
    for (const source of Object.values(layerSources)) {
      expect(source).not.toMatch(/--enpii-color-(primary|secondary|tertiary|success|warning|danger|error)/)
    }
  })

  it('validates configured style layers', () => {
    for (const layer of enpiiUiStyleLayers) {
      expect(defineEnpiiUiConfig({ styleLayer: layer }).styleLayer).toBe(layer)
    }

    expect(() => defineEnpiiUiConfig({ styleLayer: 'brutal' as never })).toThrow(
      'Unknown Enpii UI style layer: "brutal"',
    )
  })
})
