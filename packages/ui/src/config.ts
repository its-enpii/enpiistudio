export type EnpiiUiDarkMode = 'auto' | 'class' | 'manual'
export const enpiiUiStyleLayers = [
  'none',
  'material',
  'glassmorphism',
  'neumorphism',
  'neobrutalism',
  'minimalism',
] as const

export type EnpiiUiStyleLayer = (typeof enpiiUiStyleLayers)[number]

export interface EnpiiUiConfig {
  theme: string
  styleLayer: EnpiiUiStyleLayer
  darkMode: EnpiiUiDarkMode
  overrides: Record<string, string>
}

const defaultConfig: EnpiiUiConfig = {
  theme: 'sky',
  styleLayer: 'none',
  darkMode: 'auto',
  overrides: {},
}

export function defineEnpiiUiConfig(config: Partial<EnpiiUiConfig>): EnpiiUiConfig {
  if (config.styleLayer !== undefined && !enpiiUiStyleLayers.includes(config.styleLayer as EnpiiUiStyleLayer)) {
    throw new Error(
      `Unknown Enpii UI style layer: ${JSON.stringify(config.styleLayer)}. Use one of: ${enpiiUiStyleLayers.join(', ')}.`,
    )
  }

  return { ...defaultConfig, ...config, overrides: { ...config.overrides } }
}
