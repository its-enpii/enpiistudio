import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { defineEnpiiUiConfig } from '../src/config'
import { loadEnpiiUiConfig } from '../src/config-node'
import { buildEnpiiUiCss, enpiiUi } from '../src/vite-plugin/enpii-ui'

const temporaryDirectories: string[] = []

afterAll(async () => {
  await Promise.all(temporaryDirectories.map(directory => rm(directory, { recursive: true, force: true })))
})

describe('Enpii UI config loader', () => {
  it('returns safe defaults', async () => {
    expect(defineEnpiiUiConfig({})).toEqual({
      theme: 'sky',
      styleLayer: 'none',
      darkMode: 'auto',
      overrides: {},
    })
  })

  it('loads JavaScript configs and applies overrides last', async () => {
    const cwd = await createTemporaryDirectory()
    await writeFile(path.join(cwd, 'enpii.ui.config.js'), [
      'export default {',
      "  theme: 'sky',",
      "  darkMode: 'class',",
      "  overrides: { '--enpii-color-primary': '#38BDF8' },",
      '}',
    ].join('\n'), 'utf8')

    const config = await loadEnpiiUiConfig(cwd)
    const css = buildEnpiiUiCss(config)

    expect(config.overrides['--enpii-color-primary']).toBe('#38BDF8')
    expect(css.indexOf('@source')).toBeLessThan(css.indexOf('@custom-variant dark'))
    expect(css.indexOf('@custom-variant dark')).toBeLessThan(css.indexOf('--enpii-color-primary'))
    expect(css).toContain("@custom-variant dark (&:where(.dark, .dark *))")
  })

  it('generates exactly one dark-mode trigger', async () => {
    expect(buildEnpiiUiCss(defineEnpiiUiConfig({ darkMode: 'auto' }))).not.toContain('@custom-variant dark')
    expect(buildEnpiiUiCss(defineEnpiiUiConfig({ darkMode: 'auto' }))).toContain('@media (prefers-color-scheme: dark)')

    const classCss = buildEnpiiUiCss(defineEnpiiUiConfig({ darkMode: 'class' }))
    expect(classCss.match(/@custom-variant dark/g)).toHaveLength(1)
    expect(classCss).toContain("@custom-variant dark (&:where(.dark, .dark *))")
    expect(classCss).not.toContain('prefers-color-scheme')

    const manualCss = buildEnpiiUiCss(defineEnpiiUiConfig({ darkMode: 'manual' }))
    expect(manualCss.match(/@custom-variant dark/g)).toHaveLength(1)
    expect(manualCss).toContain("@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *))")
    expect(manualCss).not.toContain('prefers-color-scheme')
  })

  it('exposes the Vite plugin and injects the consumer CSS', async () => {
    const plugin = enpiiUi({
      config: {
        theme: 'sky',
        styleLayer: 'none',
        darkMode: 'manual',
        overrides: { '--enpii-color-primary': '#111827' },
      },
    })
    expect(plugin.name).toBe('enpii-ui')
    expect(plugin.configResolved).toBeTypeOf('function')

    await plugin.configResolved?.({ root: process.cwd() } as never)
    expect(plugin.load?.('\0enpii-ui.css')).toContain('--enpii-color-primary: #111827')
    expect(plugin.resolveId?.('virtual:enpii-ui.css')).toBe('\0enpii-ui.css')
  })
})

async function createTemporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), 'enpii-ui-config-'))
  temporaryDirectories.push(directory)
  return directory
}
