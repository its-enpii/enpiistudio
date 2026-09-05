export type EnpiiUiDarkMode = 'auto' | 'class' | 'manual'
export type EnpiiUiStyleLayer = 'none' | 'material' | 'glassmorphism' | 'neumorphism' | 'neobrutalism' | 'minimalism'

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
  return { ...defaultConfig, ...config, overrides: { ...config.overrides } }
}
