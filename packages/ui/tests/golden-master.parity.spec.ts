import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  GOLDEN_PROPERTIES,
  captureGoldenStyles,
  goldenComponentTable,
  parseColor,
  serializeColor,
  type GoldenSnapshot,
} from './golden-master.harness'

const goldenDirectory = resolve(process.cwd(), 'tests/__golden__')
const baselinePath = resolve(goldenDirectory, 'bem-baseline.json')

interface ParityDifference {
  id: string
  property: string
  baseline: string
  actual: string
  reason: string
}

const defaultTolerance = 0.5
const layoutProperties = new Set(['min-height', 'height', 'width'])

export function assertParity(
  snapshotA: Record<string, GoldenSnapshot>,
  snapshotB: Record<string, GoldenSnapshot>,
  tolerance = defaultTolerance,
): void {
  const differences = compareSnapshots(snapshotA, snapshotB, tolerance)
  if (differences.length) {
    throw new Error(formatDifferences(differences))
  }
}

export function compareSnapshots(
  snapshotA: Record<string, GoldenSnapshot>,
  snapshotB: Record<string, GoldenSnapshot>,
  tolerance = defaultTolerance,
): ParityDifference[] {
  const differences: ParityDifference[] = []
  const ids = new Set([...Object.keys(snapshotA), ...Object.keys(snapshotB)])
  for (const id of ids) {
    const a = snapshotA[id]
    const b = snapshotB[id]
    if (!a || !b) {
      differences.push({
        id,
        property: '*',
        baseline: a ? 'present' : 'missing',
        actual: b ? 'present' : 'missing',
        reason: 'snapshot presence',
      })
      continue
    }
    for (const property of GOLDEN_PROPERTIES) {
      if (isEquivalent(a[property], b[property], property, tolerance)) continue
      differences.push({
        id,
        property,
        baseline: a[property],
        actual: b[property],
        reason: differenceReason(a[property], b[property], property),
      })
    }
  }
  return differences
}

function isEquivalent(a: string, b: string, property: string, tolerance: number): boolean {
  if (property === 'box-shadow') return areShadowsEqual(a, b)
  if (property.endsWith('color')) return areColorsEqual(a, b)
  if (property === 'outline') return areOutlinesEqual(a, b)
  if (hasPxUnit(a) || hasPxUnit(b)) return areNumericListsEqual(a, b, tolerance)
  return a === b
}

function differenceReason(a: string, b: string, property: string): string {
  if (property === 'box-shadow') return 'shadow component'
  if (property.endsWith('color')) return 'normalized color'
  if (property === 'outline') return 'outline component'
  if (hasPxUnit(a) || hasPxUnit(b)) return `numeric > ${defaultTolerance}px`
  return 'string value'
}

function hasPxUnit(value: string): boolean {
  return /-?\d+(?:\.\d+)?px/u.test(value)
}

function areNumericListsEqual(a: string, b: string, tolerance: number): boolean {
  const aValues = pxValues(a)
  const bValues = pxValues(b)
  if (aValues.length !== bValues.length) return a === b
  return aValues.every((value, index) => Math.abs(value - bValues[index]) <= tolerance)
}

function pxValues(value: string): number[] {
  return [...value.matchAll(/(-?\d+(?:\.\d+)?)px/gu)].map(match => Number.parseFloat(match[1]))
}

export function normalizeColor(value: string): string {
  const color = parseColor(value)
  return color ? serializeColor(color) : value.trim().toLowerCase()
}

function areColorsEqual(a: string, b: string): boolean {
  return normalizeColor(a) === normalizeColor(b)
}

function areOutlinesEqual(a: string, b: string): boolean {
  const outlineA = parseOutline(a)
  const outlineB = parseOutline(b)
  return outlineA.width === outlineB.width
    && outlineA.style === outlineB.style
    && areColorsEqual(outlineA.color, outlineB.color)
}

interface Outline {
  width: number
  style: string
  color: string
}

function parseOutline(value: string): Outline {
  const parts = value.trim().split(/\s+/u)
  if (!parts.length) return { width: 0, style: 'none', color: 'currentcolor' }
  const px = pxValues(parts[0])[0]
  return {
    width: Number.isNaN(px) ? 0 : px,
    style: parts[1] ?? 'none',
    color: parts.slice(2).join(' ') || 'currentcolor',
  }
}

interface Shadow {
  x: number
  y: number
  blur: number
  spread: number
  color: string
  inset: boolean
}

export function parseBoxShadow(value: string): Shadow[] {
  if (!value || value === 'none') return []
  const shadows: Shadow[] = []
  const components = splitTopLevel(value)
  for (const component of components) {
    const inset = /\binset\b/i.test(component)
    const numbers = [...component.matchAll(/(-?\d+(?:\.\d+)?)(px)?/gu)]
    const lengths = numbers.filter(match => match[2]).map(match => Number.parseFloat(match[1]))
    if (lengths.length < 2) {
      shadows.push({ x: 0, y: 0, blur: 0, spread: 0, color: component.trim(), inset })
      continue
    }
    const color = component
      .replace(/inset/i, '')
      .replace(/-?\d+(?:\.\d+)?px/gu, '')
      .trim()
    shadows.push({
      x: lengths[0],
      y: lengths[1],
      blur: lengths[2] ?? 0,
      spread: lengths[3] ?? 0,
      color: normalizeColor(color),
      inset,
    })
  }
  return shadows
}

function splitTopLevel(value: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const character of value.trim()) {
    if (character === '(') depth += 1
    if (character === ')' && depth > 0) depth -= 1
    if (character === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
      continue
    }
    current += character
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function areShadowsEqual(a: string, b: string): boolean {
  const shadowsA = parseBoxShadow(a)
  const shadowsB = parseBoxShadow(b)
  if (shadowsA.length !== shadowsB.length) return false
  return shadowsA.every((shadow, index) => {
    const other = shadowsB[index]
    return shadow.x === other.x
      && shadow.y === other.y
      && shadow.blur === other.blur
      && shadow.spread === other.spread
      && shadow.inset === other.inset
      && areColorsEqual(shadow.color, other.color)
  })
}

function formatDifferences(differences: ParityDifference[]): string {
  const header = '| snapshot | property | baseline | actual | reason |'
  const divider = '| --- | --- | --- | --- | --- |'
  const rows = differences.map(({ id, property, baseline, actual, reason }) => (
    `| ${id} | ${property} | ${baseline || '∅'} | ${actual || '∅'} | ${reason} |`
  ))
  return [
    `Golden-master parity failed (${differences.length} differences).`,
    header,
    divider,
    ...rows,
  ].join('\n')
}

describe('golden-master harness', () => {
  it('covers the 30-component BEM rewrite scope', () => {
    const table = goldenComponentTable()
    expect(table).toHaveLength(30)
    expect([...new Set(table.map(row => row.component))]).toHaveLength(30)
  })

  it('compares colors exactly after rgb/rgba normalization', () => {
    expect(areColorsEqual('rgb(1, 2, 3)', 'rgba(1, 2, 3, 1)')).toBe(true)
    expect(areColorsEqual('rgb(1, 2, 3)', 'rgba(1, 2, 3, .999)')).toBe(false)
  })

  it('parses box-shadow components instead of comparing raw strings', () => {
    expect(areShadowsEqual(
      '0px 1px 2px rgba(0, 0, 0, 0.5), inset 0px 0px 0px rgb(255, 255, 255)',
      '0px 1px 2px rgba(0, 0, 0, .5), inset 0px 0px 0px rgba(255, 255, 255, 1)',
    )).toBe(true)
    expect(areShadowsEqual('0px 1px 2px red', '0px 2px 2px red')).toBe(false)
  })
})

describe('golden-master baseline', () => {
  beforeAll(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  const goldenMode = process.env.GOLDEN ?? 'bem'
  if (goldenMode !== 'bem') {
    it('rejects unsupported golden mode', () => {
      expect(`Unsupported GOLDEN mode: ${goldenMode}`).toBe('bem')
    })
  }

  if (goldenMode === 'bem' && process.env.GOLDEN_RECORD === '1') {
    it('records the current BEM baseline', { timeout: 120000 }, () => {
      const snapshots = captureGoldenStyles()
      mkdirSync(goldenDirectory, { recursive: true })
      writeFileSync(baselinePath, `${JSON.stringify(snapshots, null, 2)}\n`)
      expect(Object.keys(snapshots).length).toBeGreaterThan(0)
    })
  } else if (goldenMode === 'bem') {
    it('matches the committed BEM baseline', { timeout: 120000 }, () => {
      const baseline = readBaseline()
      const current = captureGoldenStyles()
      assertParity(baseline, current, 0.5)
    })
  }
})

function readBaseline(): Record<string, GoldenSnapshot> {
  const source = readFileSync(baselinePath, 'utf8')
  const parsed = JSON.parse(source) as Record<string, GoldenSnapshot>
  for (const value of Object.values(parsed)) {
    if (!value || typeof value !== 'object') {
      throw new Error(`Invalid baseline at ${baselinePath}`)
    }
  }
  return parsed
}
