import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { captureGoldenStyles, compareSnapshots } from './golden-master.harness'

describe('filtered golden', () => {
  it('only Input family', { timeout: 120000 }, () => {
    const paths = [
      resolve(process.cwd(), 'tests/__golden__/bem-baseline.json'),
      resolve(__dirname, '__golden__/bem-baseline.json'),
      resolve(process.cwd(), 'packages/ui/tests/__golden__/bem-baseline.json'),
    ]
    let baseline: Record<string, any> | null = null
    for (const p of paths) {
      try { baseline = JSON.parse(readFileSync(p,'utf8')); break } catch {}
    }
    if (!baseline) throw new Error('no baseline')
    const cur = captureGoldenStyles()
    const want = new Set(['EnpiiInput','EnpiiTextarea','EnpiiCheckbox','EnpiiSwitch'])
    // Currency and Mask not in golden cases — only these 4 are covered
    const fb: Record<string,any> = {}
    const fc: Record<string,any> = {}
    for (const k of Object.keys(baseline)) {
      const comp = k.split(':')[0]
      if (want.has(comp)) fb[k]=baseline[k]
    }
    for (const k of Object.keys(cur)) {
      const comp = k.split(':')[0]
      if (want.has(comp)) fc[k]=cur[k]
    }
    const diffs = compareSnapshots(fb, fc, 0.5)
    if (diffs.length) {
      // print first 30
      console.log(diffs.slice(0,30).map(d=>JSON.stringify(d)).join('\n'))
      console.log('total',diffs.length)
    }
    expect(diffs.length).toBe(0)
  })
})
