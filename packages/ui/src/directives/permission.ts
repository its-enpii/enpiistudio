import type { Directive, DirectiveBinding } from 'vue'

export type PermissionValue = string | string[]

interface EnpiiGlobalProperties {
  $enpiiPermissions?: string[] | Set<string>
}

function resolvePermissions(binding: DirectiveBinding): string[] | null {
  const instance = binding.instance as (Record<string, unknown> & EnpiiGlobalProperties) | null
  if (!instance) return null
  const raw = instance.$enpiiPermissions
  if (raw == null) return null
  if (raw instanceof Set) return Array.from(raw)
  if (Array.isArray(raw)) return raw
  return null
}

function hasPermission(permissions: string[], required: string[], mode: 'any' | 'all'): boolean {
  if (mode === 'all') {
    return required.every((p) => permissions.includes(p) || permissions.includes('*'))
  }
  return required.some((p) => permissions.includes(p) || permissions.includes('*'))
}

function checkPermission(binding: DirectiveBinding): boolean {
  const value = binding.value as PermissionValue | undefined
  if (!value) return true

  const required = Array.isArray(value) ? value : [value]
  const mode = binding.modifiers.all ? 'all' : 'any'
  const permissions = resolvePermissions(binding)

  if (permissions === null) {
    if (import.meta.env?.DEV) {
      console.warn('[enpii-ui] v-permission: permissions not provided. Install enpiiUi plugin with permissions option.')
    }
    return false
  }

  return hasPermission(permissions, required, mode)
}

export const vPermission: Directive<HTMLElement, PermissionValue> = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const allowed = checkPermission(binding)
    if (binding.modifiers.hide) {
      el.style.visibility = allowed ? '' : 'hidden'
    } else if (!allowed) {
      el.remove()
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    if (binding.modifiers.hide) {
      const allowed = checkPermission(binding)
      el.style.visibility = allowed ? '' : 'hidden'
    }
  },
}
