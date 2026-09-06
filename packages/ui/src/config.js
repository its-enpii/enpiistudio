export const enpiiUiStyleLayers = [
  'none',
  'material',
  'glassmorphism',
  'neumorphism',
  'neobrutalism',
  'minimalism',
]

const defaultConfig = {
  theme: 'sky',
  styleLayer: 'none',
  darkMode: 'auto',
  overrides: {},
}

export function defineEnpiiUiConfig(config) {
  if (config.styleLayer !== undefined && !enpiiUiStyleLayers.includes(config.styleLayer)) {
    throw new Error(
      `Unknown Enpii UI style layer: ${JSON.stringify(config.styleLayer)}. Use one of: ${enpiiUiStyleLayers.join(', ')}.`,
    )
  }

  return { ...defaultConfig, ...config, overrides: { ...config.overrides } }
}
