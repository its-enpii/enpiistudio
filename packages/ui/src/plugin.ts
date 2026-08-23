import type { App } from 'vue'

export interface EnpiiUiPluginOptions {
  permissions?: Array<string> | Set<string>
  appMode?: {
    isDesktop?: boolean
    isOffline?: boolean
    isReadOnly?: boolean
  }
  navigate?: (path: string, options?: Record<string, unknown>) => void
  logout?: () => void
  flash?: Record<string, string | null>
}

export const enpiiPermissionsKey: unique symbol = Symbol('enpii:permissions')
export const enpiiAppModeKey: unique symbol = Symbol('enpii:app-mode')
export const enpiiNavigationKey: unique symbol = Symbol('enpii:navigation')
export const enpiiFlashKey: unique symbol = Symbol('enpii:flash')

export default {
  install(app: App, options: EnpiiUiPluginOptions = {}) {
    app.provide(enpiiPermissionsKey, options.permissions ?? [])
    app.provide(enpiiAppModeKey, options.appMode ?? {})
    app.provide(enpiiNavigationKey, {
      navigate: options.navigate ?? (() => {}),
      logout: options.logout ?? (() => {}),
    })
    app.provide(enpiiFlashKey, options.flash ?? {})
  },
}
