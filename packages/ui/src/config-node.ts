import { access } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineEnpiiUiConfig, type EnpiiUiConfig } from './config'

const configFiles = ['enpii.ui.config.js', 'enpii.ui.config.mjs', 'enpii.ui.config.ts'] as const

export async function loadEnpiiUiConfig(cwd: string = process.cwd()): Promise<EnpiiUiConfig> {
  for (const filename of configFiles) {
    const filePath = path.resolve(cwd, filename)
    if (!await exists(filePath)) continue

    const loaded = await import(pathToFileURL(filePath).href)
    const value = loaded.default ?? loaded
    if (value === null || typeof value !== 'object') {
      throw new Error(`Invalid Enpii UI config: ${filePath} must default to an object`)
    }

    return defineEnpiiUiConfig(value as Partial<EnpiiUiConfig>)
  }

  return { theme: 'sky', styleLayer: 'none', darkMode: 'auto', overrides: {} }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}
