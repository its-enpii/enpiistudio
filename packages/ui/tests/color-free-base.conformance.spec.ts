import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectExpressionClasses } from '../scripts/audit-template-classes.mjs'
import { parse } from '@vue/compiler-sfc'
const tailwindcss = await import('tailwindcss')

const colorFreeComponents: string[] = JSON.parse(
  readFileSync(resolve(__dirname, 'fixtures/color-free-components.json'), 'utf8'),
)
const batchColorHooks: string[] = JSON.parse(
  readFileSync(resolve(__dirname, 'fixtures/enpii-color-hooks.json'), 'utf8'),
)
const componentsDirectory = resolve(__dirname, '../src/components')
const layersDirectory = resolve(__dirname, '../src/styles/layers')

const colorFreeExceptions = [
  'bg-transparent',
  'text-current',
  'text-inherit',
  'outline-focus',
]

async function loadDesignSystem() {
  return (tailwindcss as any).__unstable__loadDesignSystem(
    readFileSync(resolve(__dirname, '../entry.tailwind.css'), 'utf8'),
    {
      base: resolve(__dirname, '..'),
      loadStylesheet: (id: string, base: string) => {
        const file = id.startsWith('.') ? resolve(base, id) : resolve(base, '../../node_modules', id, 'index.css')
        return { path: file, base, content: readFileSync(file, 'utf8') }
      },
    },
  )
}

function collectTemplateClasses(node: any, classes = new Set<string>()) {
  if (!node) return classes

  if (node.type === 1) {
    for (const attribute of node.props) {
      if (attribute.type !== 6 && attribute.type !== 7) continue
      if (attribute.type === 6 && attribute.name === 'class' && attribute.value?.content) {
        for (const token of attribute.value.content.split(/\s+/)) {
          if (token) classes.add(token)
        }
      }
      if (attribute.type === 7 && attribute.name === 'bind' && attribute.arg?.content === 'class' && attribute.exp) {
        for (const token of collectExpressionClasses(attribute.exp)) classes.add(token)
      }
    }
  }

  for (const child of node.children ?? []) collectTemplateClasses(child, classes)
  for (const branch of node.branches ?? []) collectTemplateClasses(branch, classes)
  if (node.type === 11 && node.exp) {
    for (const token of collectExpressionClasses(node.exp)) classes.add(token)
  }
  return classes
}

function isAllowedColorDeclaration(property: string, value: string) {
  if (!/^(?:color|background(?:-color|-image)?|border-color|fill|stroke|accent-color)$/.test(property)) return false
  return [
    'inherit',
    'currentColor',
    'transparent',
    'currentcolor',
    /^var\(--(?:control|field|label)-[a-z0-9-]+\)$/,
  ].some(pattern => pattern === value || (pattern instanceof RegExp && pattern.test(value)))
}

describe('color-free base component conformance', () => {
  it('fixes the exact batch 1 component scope', () => {
    expect(colorFreeComponents).toHaveLength(13)
  })

  it('fixes the exact batch 1 color hook taxonomy', () => {
    expect(batchColorHooks).toHaveLength(17)
  })

  it.each(colorFreeComponents)('%s emits no color decisions outside batch hooks', async (filename) => {
    const source = readFileSync(resolve(componentsDirectory, filename), 'utf8')
    const { descriptor, errors } = parse(source, { filename })
    expect(errors).toEqual([])

    const classes = collectTemplateClasses(descriptor.template?.ast)
    const designSystem = await loadDesignSystem()
    const violations: string[] = []

    for (const className of [...classes].sort()) {
      if (colorFreeExceptions.includes(className)) continue
      const css = designSystem.candidatesToCss([className])?.[0]
      if (!css) continue

      for (const declaration of css.matchAll(/(?:^|[;{])\s*([a-z-]+)\s*:\s*([^;}]+)/gi)) {
        const [, property, value] = declaration
        if (!isAllowedColorDeclaration(property, value.trim())) continue
        if (/var\(--(?:control|field|label)-[a-z0-9-]+\)/.test(value.trim())) continue
        violations.push(`${className}: ${property}: ${value.trim()}`)
      }
    }

    expect(violations).toEqual([])
  })
})

describe('batch 1 layer color-hook completeness', () => {
  const layerFiles = [
    'material.css',
    'glassmorphism.css',
    'neumorphism.css',
    'neobrutalism.css',
    'neobrutalism-tamed.css',
    'minimalism.css',
  ]

  it.each(layerFiles)('%s defines every batch 1 hook without selectors in values', (filename) => {
    const source = readFileSync(resolve(layersDirectory, filename), 'utf8')
    const sourceWithoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '')
    const declarations = new Map<string, string>()

    for (const [, name, value] of sourceWithoutComments.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      declarations.set(`--${name}`, value.trim())
    }

    const missingHooks = batchColorHooks.filter(hook => !declarations.has(hook))
    expect(missingHooks, `${filename} must define all batch 1 hooks`).toEqual([])

    for (const hook of batchColorHooks) {
      expect(declarations.get(hook), `${filename} must give ${hook} a non-empty value`).not.toBe('')
      expect(declarations.get(hook), `${filename} must keep ${hook} selector-free`).not.toMatch(/[{}]|\b(?:is|where|not|has)\(/)
    }
  })
})
