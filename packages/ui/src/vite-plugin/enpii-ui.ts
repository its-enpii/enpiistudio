import path from 'node:path'
import { normalizePath, type Plugin } from 'vite'
import { defineEnpiiUiConfig, type EnpiiUiConfig } from '../config'
import { loadEnpiiUiConfig } from '../config-node'

export interface EnpiiUiPluginOptions {
  config?: Partial<EnpiiUiConfig>
  cwd?: string
}

const darkVariants: Record<EnpiiUiConfig['darkMode'], string> = {
  auto: '@media (prefers-color-scheme: dark);',
  class: "@custom-variant dark (&:where(.dark, .dark *));",
  manual: "@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));",
}

export function buildEnpiiUiCss(config: EnpiiUiConfig): string {
  const themeEntry = normalizePath(
    path.join('/', 'node_modules', '@its-enpii', 'ui', 'src', 'theme', config.theme, 'tokens.css'),
  )
  const source = normalizePath(path.join('/', 'node_modules', '@its-enpii', 'ui', 'src'))
  const overrides = Object.entries(config.overrides)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')

  return [
    `@import "${themeEntry}";`,
    `@source "${source}";`,
    darkVariants[config.darkMode],
    config.styleLayer === 'none' ? '' : `@import "@its-enpii/ui/styles/${config.styleLayer}";`,
    overrides ? `:root {\n${overrides}\n}` : '',
  ].filter(Boolean).join('\n')
}

export function enpiiUi(options: EnpiiUiPluginOptions = {}): Plugin {
  let css = ''
  let virtualId = '\0enpii-ui.css'

  return {
    name: 'enpii-ui',
    async configResolved(resolvedConfig) {
      const config = options.config
        ? defineEnpiiUiConfig(options.config)
        : await loadEnpiiUiConfig(options.cwd ?? resolvedConfig.root)
      css = buildEnpiiUiCss(config)
    },
    resolveId(id) {
      if (id === 'virtual:enpii-ui.css') return virtualId
    },
    load(id) {
      if (id === virtualId) return css
    },
  }
}
