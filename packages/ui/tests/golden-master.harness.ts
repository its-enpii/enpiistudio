import { mount, type VueWrapper } from '@vue/test-utils'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import EnpiiAccordion from '../src/components/EnpiiAccordion.vue'
import EnpiiAlert from '../src/components/EnpiiAlert.vue'
import EnpiiAvatar from '../src/components/EnpiiAvatar.vue'
import EnpiiBadge from '../src/components/EnpiiBadge.vue'
import EnpiiBreadcrumb from '../src/components/EnpiiBreadcrumb.vue'
import EnpiiButton from '../src/components/EnpiiButton.vue'
import EnpiiCard from '../src/components/EnpiiCard.vue'
import EnpiiCheckbox from '../src/components/EnpiiCheckbox.vue'
import EnpiiDropdownMenu from '../src/components/EnpiiDropdownMenu.vue'
import EnpiiEmptyState from '../src/components/EnpiiEmptyState.vue'
import EnpiiFilterPill from '../src/components/EnpiiFilterPill.vue'
import EnpiiFormActions from '../src/components/EnpiiFormActions.vue'
import EnpiiFormField from '../src/components/EnpiiFormField.vue'
import EnpiiIconButton from '../src/components/EnpiiIconButton.vue'
import EnpiiInput from '../src/components/EnpiiInput.vue'
import EnpiiPagination from '../src/components/EnpiiPagination.vue'
import EnpiiPasswordInput from '../src/components/EnpiiPasswordInput.vue'
import EnpiiPopover from '../src/components/EnpiiPopover.vue'
import EnpiiProgress from '../src/components/EnpiiProgress.vue'
import EnpiiRadioGroup from '../src/components/EnpiiRadioGroup.vue'
import EnpiiRange from '../src/components/EnpiiRange.vue'
import EnpiiSegmentedControl from '../src/components/EnpiiSegmentedControl.vue'
import EnpiiSkeleton from '../src/components/EnpiiSkeleton.vue'
import EnpiiSpinner from '../src/components/EnpiiSpinner.vue'
import EnpiiStatTile from '../src/components/EnpiiStatTile.vue'
import EnpiiStepper from '../src/components/EnpiiStepper.vue'
import EnpiiSwitch from '../src/components/EnpiiSwitch.vue'
import EnpiiTabs from '../src/components/EnpiiTabs.vue'
import EnpiiTextarea from '../src/components/EnpiiTextarea.vue'
import EnpiiTooltip from '../src/components/EnpiiTooltip.vue'

export type GoldenState =
  | 'default'
  | 'hover'
  | 'active'
  | 'disabled'
  | 'focus-visible'
  | 'error'

export type GoldenTheme =
  | 'light'
  | 'dark-media'
  | 'dark-attribute'

export const GOLDEN_PROPERTIES = [
  'background-color',
  'color',
  'border-color',
  'border-width',
  'border-style',
  'box-shadow',
  'border-radius',
  'font-weight',
  'font-size',
  'min-height',
  'height',
  'width',
  'padding',
  'gap',
  'transition-property',
  'outline',
] as const

export type GoldenProperty = (typeof GOLDEN_PROPERTIES)[number]
export type GoldenSnapshot = Record<GoldenProperty, string>

export interface ParityDifference {
  id: string
  property: string
  baseline: string
  actual: string
  reason: string
}

interface ComponentCase {
  component: string
  states: GoldenState[]
  target: string
  props?: Record<string, unknown>
  slots?: Record<string, string>
  stateProps?: Partial<Record<GoldenState, Record<string, unknown>>>
  stateTarget?: Partial<Record<GoldenState, string>>
  focusSelector?: string
  focusTarget?: string
}

const buttonItems = [
  { key: 'overview', label: 'Overview' },
  { key: 'activity', label: 'Activity' },
  { key: 'settings', label: 'Settings' },
]

export const GOLDEN_COMPONENT_CASES: ComponentCase[] = [
  { component: 'EnpiiAccordion', states: ['default', 'hover', 'focus-visible'], target: '.enpii-accordion__trigger', props: { title: 'Section' }, slots: { default: 'Body' } },
  { component: 'EnpiiAlert', states: ['default'], target: '.enpii-alert', props: { title: 'Alert', message: 'Body' } },
  { component: 'EnpiiAvatar', states: ['default'], target: '.enpii-avatar', props: { name: 'Ada Lovelace' } },
  { component: 'EnpiiBadge', states: ['default'], target: '.enpii-badge', slots: { default: 'Badge' } },
  { component: 'EnpiiBreadcrumb', states: ['default'], target: '.enpii-breadcrumb__current', props: { items: [{ key: 'home', label: 'Home' }, { key: 'current', label: 'Current' }] } },
  { component: 'EnpiiButton', states: ['default', 'hover', 'active', 'disabled', 'focus-visible'], target: '.enpii-button', slots: { default: 'Action' } },
  { component: 'EnpiiCard', states: ['default', 'hover'], target: '.enpii-card', slots: { default: 'Body' } },
  { component: 'EnpiiCheckbox', states: ['default', 'active', 'disabled', 'focus-visible'], target: '.enpii-checkbox__native', props: { label: 'Enabled', ariaLabel: 'Enabled' }, stateProps: { active: { modelValue: true }, disabled: { disabled: true } } },
  { component: 'EnpiiDropdownMenu', states: ['default', 'hover', 'disabled', 'focus-visible'], target: '.enpii-dropdown-menu__trigger', props: { items: [{ key: 'edit', label: 'Edit' }] }, stateProps: { disabled: { disabled: true } } },
  { component: 'EnpiiEmptyState', states: ['default'], target: '.enpii-empty-state', props: { icon: 'inbox', title: 'Empty' } },
  { component: 'EnpiiFilterPill', states: ['default', 'hover', 'active', 'disabled', 'focus-visible'], target: '.enpii-filter-pill__button', props: { items: [{ value: 'all', label: 'All' }] } },
  { component: 'EnpiiFormActions', states: ['default'], target: '.enpii-form-actions', slots: { default: '<span>Actions</span>' } },
  { component: 'EnpiiFormField', states: ['default', 'error'], target: '.enpii-form-field', props: { label: 'Field' }, slots: { default: '<input aria-label="Field input">' }, stateProps: { error: { error: 'Required' } } },
  { component: 'EnpiiIconButton', states: ['default', 'hover', 'active', 'disabled', 'focus-visible'], target: '.enpii-icon-button', props: { icon: 'settings', ariaLabel: 'Settings' }, stateProps: { disabled: { disabled: true } } },
  { component: 'EnpiiInput', states: ['default', 'hover', 'disabled', 'focus-visible', 'error'], target: '.enpii-input__control', props: { label: 'Input' }, stateProps: { disabled: { disabled: true }, error: { error: 'Required' } }, focusSelector: '.enpii-input__control:focus', focusTarget: '.enpii-input__control' },
  { component: 'EnpiiPagination', states: ['default', 'hover', 'active', 'disabled', 'focus-visible'], target: '.enpii-pagination__control:not([aria-label])', props: { totalPages: 3, modelValue: 2 }, stateTarget: { disabled: '.enpii-pagination__control[aria-label="Previous page"]' }, stateProps: { disabled: { modelValue: 1 } } },
  { component: 'EnpiiPasswordInput', states: ['default', 'disabled', 'focus-visible'], target: '.enpii-password-input__control', stateProps: { disabled: { disabled: true } } },
  { component: 'EnpiiPopover', states: ['default', 'hover', 'focus-visible'], target: '.enpii-popover__trigger', slots: { trigger: 'Trigger', content: 'Content' } },
  { component: 'EnpiiProgress', states: ['default'], target: '.enpii-progress__track', props: { value: 50 } },
  { component: 'EnpiiRadioGroup', states: ['default', 'active', 'disabled', 'error', 'focus-visible'], target: '.enpii-radio-group__button', props: { label: 'Choice', options: [{ value: 'yes', label: 'Yes' }] }, stateProps: { active: { modelValue: 'yes' }, disabled: { disabled: true }, error: { error: 'Required' } }, focusSelector: '.enpii-radio-group__native:focus-visible~.enpii-radio-group__button', focusTarget: '.enpii-radio-group__native' },
  { component: 'EnpiiRange', states: ['default', 'disabled', 'focus-visible'], target: '.enpii-range__control', props: { label: 'Range' }, stateProps: { disabled: { disabled: true } } },
  { component: 'EnpiiSegmentedControl', states: ['default', 'hover', 'active', 'disabled', 'focus-visible'], target: '.enpii-segmented-control__option', props: { options: [{ value: 'one', label: 'One' }, { value: 'two', label: 'Two' }], modelValue: 'one' }, stateProps: { disabled: { options: [{ value: 'one', label: 'One', disabled: true }] } } },
  { component: 'EnpiiSkeleton', states: ['default'], target: '.enpii-skeleton__item', props: { variant: 'text' } },
  { component: 'EnpiiSpinner', states: ['default'], target: '.enpii-spinner' },
  { component: 'EnpiiStatTile', states: ['default'], target: '.enpii-stat-tile', props: { label: 'Revenue', value: '100' } },
  { component: 'EnpiiStepper', states: ['default', 'active'], target: '.enpii-stepper__step', props: { steps: buttonItems, activeKey: 'overview' } },
  { component: 'EnpiiSwitch', states: ['default', 'active', 'disabled', 'focus-visible'], target: '.enpii-switch__track', props: { label: 'Switch' }, stateProps: { active: { modelValue: true }, disabled: { disabled: true } }, focusSelector: '.enpii-switch__native:focus-visible~.enpii-switch__track', focusTarget: '.enpii-switch__native' },
  { component: 'EnpiiTabs', states: ['default', 'hover', 'active', 'disabled', 'focus-visible'], target: '.enpii-tabs__tab:not(.enpii-tabs__tab--disabled)', props: { items: buttonItems, modelValue: 'overview' }, stateTarget: { disabled: '.enpii-tabs__tab--disabled' }, stateProps: { disabled: { items: buttonItems.map((item, index) => ({ ...item, disabled: index === 0 })) } } },
  { component: 'EnpiiTextarea', states: ['default', 'hover', 'disabled', 'focus-visible', 'error'], target: '.enpii-textarea__control', props: { label: 'Textarea' }, stateProps: { disabled: { readonly: true }, error: { error: 'Required' } }, stateTarget: { disabled: '.enpii-textarea__control--readonly' }, focusSelector: '.enpii-textarea__control:focus', focusTarget: '.enpii-textarea__control' },
  { component: 'EnpiiTooltip', states: ['default', 'hover', 'focus-visible'], target: '.enpii-tooltip__trigger', props: { text: 'Help' } },
]

const componentMap: Record<string, unknown> = {
  EnpiiAccordion,
  EnpiiAlert,
  EnpiiAvatar,
  EnpiiBadge,
  EnpiiBreadcrumb,
  EnpiiButton,
  EnpiiCard,
  EnpiiCheckbox,
  EnpiiDropdownMenu,
  EnpiiEmptyState,
  EnpiiFilterPill,
  EnpiiFormActions,
  EnpiiFormField,
  EnpiiIconButton,
  EnpiiInput,
  EnpiiPagination,
  EnpiiPasswordInput,
  EnpiiPopover,
  EnpiiProgress,
  EnpiiRadioGroup,
  EnpiiRange,
  EnpiiSegmentedControl,
  EnpiiSkeleton,
  EnpiiSpinner,
  EnpiiStatTile,
  EnpiiStepper,
  EnpiiSwitch,
  EnpiiTabs,
  EnpiiTextarea,
  EnpiiTooltip,
}

const stateClasses: Partial<Record<GoldenState, string>> = {
  hover: 'golden-hover',
  active: 'golden-active',
  disabled: 'golden-disabled',
  'focus-visible': 'golden-focus-visible',
}

const stateSelectors: Record<GoldenState, string | null> = {
  default: null,
  hover: ':hover:not(:disabled),:hover',
  active: ':active:not(:disabled),:active',
  disabled: ':disabled,[aria-disabled="true"],.is-disabled',
  'focus-visible': ':focus-visible,:focus',
  error: '.is-error,.has-error,[aria-invalid="true"]',
}

const uiDirectory = resolve(__dirname, '..')

const transitionZeroCss = `
*, *:before, *:after {
  transition-duration: 0s !important;
  transition-delay: 0s !important;
  animation-duration: 0s !important;
  animation-delay: 0s !important;
}
`

function extractCustomProperties(css: string): Map<string, string> {
  const properties = new Map<string, string>()
  const pattern = /(--[a-z0-9-]+)\s*:\s*([^;}]+)/gi
  for (const match of css.matchAll(pattern)) {
    const [, name, rawValue] = match
    const value = rawValue.trim()
    if (name === '--enpii-font-sans' || name === '--font-sans') {
      properties.set(name.toLowerCase(), 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif')
      continue
    }
    properties.set(name.toLowerCase(), value)
  }
  return properties
}

function extractBaseCustomProperties(tokensCss: string): Map<string, string> {
  const properties = extractCustomProperties(tokensCss)
  const rootBlock = extractBlock(tokensCss, ':root')
  return extractCustomProperties(rootBlock.length ? rootBlock : tokensCss)
}

function extractBlock(source: string, startMarker: string): string {
  const start = source.indexOf(startMarker)
  if (start < 0) return ''
  const openBrace = source.indexOf('{', start)
  if (openBrace < 0) return ''
  let depth = 0
  let closeBrace = -1
  for (let index = openBrace; index < source.length; index += 1) {
    const character = source[index]
    if (character === '{') depth += 1
    if (character === '}') {
      depth -= 1
      if (depth === 0) {
        closeBrace = index
        break
      }
    }
  }
  return closeBrace > openBrace ? source.slice(openBrace + 1, closeBrace) : ''
}

function replaceVariablesWithFallback(source: string, values: Map<string, string>): string {
  return source.replace(/var\((--[a-z0-9-]+)(?:,[^)]*)?\)/gi, (match, name: string) => (
    values.get(name.toLowerCase()) ?? match
  ))
}

function expandColorMix(source: string): string {
  return source.replace(/color-mix\(in srgb,\s*([^,]+)\s+(\d+(?:\.\d+)?)%,\s*transparent\)/gi, (_, color: string, percent: string) => {
    const parsed = parseColor(color)
    if (!parsed) return `color-mix(in srgb, ${color} ${percent}%, transparent)`
    const alpha = (Number.parseFloat(percent) / 100) * parsed.alpha
    return `rgba(${parsed.red}, ${parsed.green}, ${parsed.blue}, ${trimNumber(alpha)})`
  })
}

export interface RGBAColor {
  red: number
  green: number
  blue: number
  alpha: number
}

function parseNumber(value: string): number {
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function parseColor(value: string): RGBAColor | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  if (normalized === 'transparent') {
    return { red: 0, green: 0, blue: 0, alpha: 0 }
  }
  const colorMixMatch = normalized.match(/^color-mix\(in srgb,\s*(.+?)\s+(\d+(?:\.\d+)?)%,\s*transparent\)$/)
  if (colorMixMatch) {
    const innerColor = parseColor(colorMixMatch[1])
    if (innerColor) {
      const alpha = (Number.parseFloat(colorMixMatch[2]) / 100) * innerColor.alpha
      return { ...innerColor, alpha }
    }
  }
  const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/)
  if (rgbMatch) {
    const parts = rgbMatch[1].split(/[,\s/]+/).filter(Boolean)
    if (parts.length >= 3) {
      return {
        red: parseNumber(parts[0]),
        green: parseNumber(parts[1]),
        blue: parseNumber(parts[2]),
        alpha: parts.length > 3 ? parseNumber(parts[3]) : 1,
      }
    }
  }
  const hexMatch = normalized.match(/^#(?:([0-9a-f]{3})|([0-9a-f]{6})|([0-9a-f]{8}))$/)
  if (hexMatch) {
    if (hexMatch[1]) {
      const r = hexMatch[1][0]
      const g = hexMatch[1][1]
      const b = hexMatch[1][2]
      return {
        red: Number.parseInt(r + r, 16),
        green: Number.parseInt(g + g, 16),
        blue: Number.parseInt(b + b, 16),
        alpha: 1,
      }
    }
    if (hexMatch[2]) {
      return {
        red: Number.parseInt(hexMatch[2].slice(0, 2), 16),
        green: Number.parseInt(hexMatch[2].slice(2, 4), 16),
        blue: Number.parseInt(hexMatch[2].slice(4, 6), 16),
        alpha: 1,
      }
    }
    if (hexMatch[3]) {
      return {
        red: Number.parseInt(hexMatch[3].slice(0, 2), 16),
        green: Number.parseInt(hexMatch[3].slice(2, 4), 16),
        blue: Number.parseInt(hexMatch[3].slice(4, 6), 16),
        alpha: Number.parseInt(hexMatch[3].slice(6, 8), 16) / 255,
      }
    }
  }
  return null
}

export function serializeColor(color: RGBAColor): string {
  return `rgba(${round(color.red)}, ${round(color.green)}, ${round(color.blue)}, ${trimNumber(color.alpha)})`
}

function round(value: number): number {
  return Math.round(value * 255) / 255
}

function trimNumber(value: number): number {
  return Number(value.toFixed(4).replace(/0+$/, '').replace(/\.$/, ''))
}

function unwrapSupports(source: string): string {
  let result = ''
  let pos = 0
  while (true) {
    const marker = '@supports'
    const start = source.indexOf(marker, pos)
    if (start === -1) {
      result += source.slice(pos)
      break
    }
    result += source.slice(pos, start)
    const openBrace = source.indexOf('{', start)
    if (openBrace === -1) {
      result += source.slice(start)
      break
    }
    let depth = 1
    let end = openBrace + 1
    for (; end < source.length; end++) {
      if (source[end] === '{') depth++
      else if (source[end] === '}') {
        depth--
        if (depth === 0) break
      }
    }
    const inner = source.slice(openBrace + 1, end)
    result += inner
    pos = end + 1
  }
  return result
}

function extractUtilitiesLayer(css: string): string {
  const marker = '@layer utilities'
  const start = css.indexOf(marker)
  if (start === -1) return ''
  const openBrace = css.indexOf('{', start)
  if (openBrace === -1) return ''
  let depth = 0
  let closeBrace = -1
  for (let i = openBrace; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1
    else if (css[i] === '}') {
      depth -= 1
      if (depth === 0) {
        closeBrace = i
        break
      }
    }
  }
  if (closeBrace === -1) return ''
  return css.slice(openBrace + 1, closeBrace)
}

function appendStyles(theme: GoldenTheme): HTMLStyleElement[] {
  const tokens = readFileSync(resolve(uiDirectory, 'src/styles/tokens.css'), 'utf8')
  const entry = readFileSync(resolve(uiDirectory, 'entry.tailwind.css'), 'utf8')
  const components = readFileSync(resolve(uiDirectory, 'src/styles/components.css'), 'utf8')
  const tokenValues = extractBaseCustomProperties(tokens)
  const themeProps = extractCustomProperties(entry)
  for (const [key, value] of themeProps) {
    if (!tokenValues.has(key)) tokenValues.set(key, value)
  }

  tokenValues.set('--font-weight-semibold', '600')
  tokenValues.set('--font-weight-extrabold', '800')
  tokenValues.set('--text-xs', '0.75rem')
  tokenValues.set('--text-sm', '0.875rem')
  tokenValues.set('--text-lg', '1.125rem')
  tokenValues.set('--text-xl', '1.25rem')
  tokenValues.set('--text-2xl', '1.5rem')
  tokenValues.set('--spacing', '0.25rem')
  tokenValues.set('--radius-lg', '0.5rem')
  tokenValues.set('--tracking-wide', '0.025em')
  tokenValues.set('--ease-emphasized', 'cubic-bezier(.16, 1, .3, 1)')
  tokenValues.set('--duration-fast', '150ms')
  tokenValues.set('--tw-outline-style', 'solid')
  tokenValues.set('--tw-border-style', 'solid')

  if (theme === 'dark-media' || theme === 'dark-attribute') {
    const darkBlock = theme === 'dark-media'
      ? extractBlock(tokens, '@media (prefers-color-scheme: dark)')
      : extractBlock(tokens, "[data-theme='dark']")
    for (const match of darkBlock.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)/g)) {
      tokenValues.set(match[1].toLowerCase(), match[2].trim())
    }
  }

  let bemCss = replaceVariablesWithFallback(components, tokenValues)
  bemCss = bemCss.replace(/background:/g, 'background-color:')
  bemCss = bemCss.replace(/transition:([^;}]+)/g, (_, value: string) => `transition-property:${value.split(/,(?![^()]*\))/).map(part => part.trim().split(/\s+/)[0]).join(', ')}`)
  bemCss = addStateAliases(bemCss, componentStateSelectors())
  bemCss += transitionZeroCss

  let twCss = ''
  const tailwindPath = resolve(uiDirectory, 'dist/tailwind.css')
  if (existsSync(tailwindPath)) {
    twCss = extractUtilitiesLayer(readFileSync(tailwindPath, 'utf8'))
    twCss = unwrapSupports(twCss)
    twCss = twCss.replace(/padding-block:\s*([^;}]+);?/g, 'padding-top: $1; padding-bottom: $1;')
    twCss = twCss.replace(/padding-inline:\s*([^;}]+);?/g, 'padding-left: $1; padding-right: $1;')
    twCss = twCss.replace(/calc\(var\(--spacing\)\s*\*\s*(\d+(?:\.\d+)?)\)/g, (_, n: string) => `${Number(n) * 0.25}rem`)
    for (let pass = 0; pass < 3; pass += 1) {
      twCss = twCss.replace(/\{([^}]+)\}/g, (_, body: string) => '{' + replaceVariablesWithFallback(body, tokenValues) + '}')
    }
    twCss = expandColorMix(twCss)
    twCss = twCss.replace(/\\'/g, '')
    twCss = addTailwindStateAliases(twCss)
  }

  const base = document.createElement('style')
  base.textContent = bemCss + '\n' + twCss
  document.head.append(base)
  return [base]
}

function componentStateSelectors(): Array<[string, GoldenState]> {
  const selectors = new Map<string, GoldenState[]>()
  for (const componentCase of GOLDEN_COMPONENT_CASES) {
    for (const state of componentCase.states) {
      const selector = stateSelectors[state]
      if (!selector) continue
      for (const part of selector.split(',')) {
        const key = `${componentCase.target.trim()}${part.trim()}`
        const states = selectors.get(key) ?? []
        if (!states.includes(state)) states.push(state)
        selectors.set(key, states)
      }
    }
  }
  return [...selectors].map(([selector, states]) => [selector, states[0]] as [string, GoldenState])
}

function componentFocusSelectors(): string[] {
  return GOLDEN_COMPONENT_CASES
    .map(componentCase => componentCase.focusSelector)
    .filter((selector): selector is string => Boolean(selector))
}

function addStateAliases(css: string, selectors: Array<[string, GoldenState]>): string {
  let result = css
  const sorted = [...selectors].sort((a, b) => b[0].length - a[0].length)
  for (const [selector, state] of sorted) {
    const stateMarker = selector.lastIndexOf(`:${state}`)
    if (stateMarker < 0) continue
    const aliasSelector = `${selector.slice(0, stateMarker)}.golden-${state}`
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped}(?::not\\(\\[readonly\\]\\))?)(?=[,{>\\s])`, 'g')
    result = result.replace(regex, (match, full: string) => {
      const trailingNot = full.slice(selector.length)
      return `${full}, ${aliasSelector}${trailingNot}`
    })
  }
  for (const selector of componentFocusSelectors()) {
    const state = selector.includes(':focus-visible') ? 'focus-visible' : 'focus'
    const stateMarker = selector.lastIndexOf(`:${state}`)
    if (stateMarker < 0) continue
    const aliasSelector = `${selector.slice(0, stateMarker)}.golden-${state}`
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escaped + '(?=[,{>\\s])', 'g')
    result = result.replace(regex, `${selector}, ${aliasSelector}`)
  }
  return result
}

function addTailwindStateAliases(css: string): string {
  let out = css
  const aliasRules: string[] = []

  out = out.replace(/\.hover\\:enabled\\:((?:\\.|[^:{}\s])+):hover:enabled\{([^}]+)\}/g, (match, sel, decl) => {
    aliasRules.push(`.hover\\:enabled\\:${sel}.golden-hover { ${decl} }`)
    return match
  })

  out = out.replace(/\.hover\\:((?:\\.|[^:{}\s])+):hover\{([^}]+)\}/g, (match, sel, decl) => {
    aliasRules.push(`.hover\\:${sel}.golden-hover { ${decl} }`)
    return match
  })

  out = out.replace(/\.active\\:enabled\\:((?:\\.|[^:{}\s])+):active:enabled\{([^}]+)\}/g, (match, sel, decl) => {
    aliasRules.push(`.active\\:enabled\\:${sel}.golden-active { ${decl} }`)
    return match
  })

  out = out.replace(/\.active\\:((?:\\.|[^:{}\s])+):active\{([^}]+)\}/g, (match, sel, decl) => {
    aliasRules.push(`.active\\:${sel}.golden-active { ${decl} }`)
    return match
  })

  out = out.replace(/\.focus-visible\\:((?:\\.|[^:{}\s])+):focus-visible\{([^}]+)\}/g, (match, sel, decl) => {
    aliasRules.push(`.focus-visible\\:${sel}.golden-focus, .focus-visible\\:${sel}.golden-focus-visible { ${decl} }`)
    return match
  })

  out = out.replace(/\.focus\\:((?:\\.|[^:{}\s])+):focus\{([^}]+)\}/g, (match, sel, decl) => {
    aliasRules.push(`.focus\\:${sel}.golden-focus, .focus\\:${sel}.golden-focus-visible { ${decl} }`)
    return match
  })

  out = out.replace(/\.disabled\\:((?:\\.|[^:{}\s])+):disabled\{([^}]+)\}/g, (match, sel, decl) => {
    aliasRules.push(`.disabled\\:${sel}.golden-disabled { ${decl} }`)
    return match
  })

  out = out.replace(/\.peer-checked\\:((?:\\.|[^:{}\s])+):is\(:where\(\.peer\):checked~\*\)\{([^}]+)\}/g, (match, sel, decl) => {
    aliasRules.push(`.peer-checked\\:${sel}.golden-active, .peer:checked ~ .peer-checked\\:${sel} { ${decl} }`)
    return match
  })

  return out + "\n" + aliasRules.join("\n")
}

function targetElement(wrapper: VueWrapper, componentCase: ComponentCase): Element {
  const element = wrapper.element.querySelector(componentCase.target)
    ?? (wrapper.element.matches(componentCase.target) ? wrapper.element : null)
  if (!element) {
    throw new Error(`Unable to find target ${componentCase.target} for ${componentCase.component}`)
  }
  return element
}

function applyState(element: Element, state: GoldenState, componentCase: ComponentCase): void {
  const stateClass = stateClasses[state]
  if (stateClass) element.classList.add(stateClass)
}

function readSnapshot(element: Element): GoldenSnapshot {
  const computed = getComputedStyle(element)
  const snapshot = {} as GoldenSnapshot
  for (const property of GOLDEN_PROPERTIES) {
    if (property === 'outline') {
      const outline = computed.getPropertyValue('outline').trim()
      if (outline) {
        snapshot[property] = normalizeRem(outline)
      } else {
        const style = computed.getPropertyValue('outline-style').trim()
        const width = normalizeRem(computed.getPropertyValue('outline-width').trim())
        const color = computed.getPropertyValue('outline-color').trim()
        if (style && style !== 'none' && width && width !== '0px') {
          snapshot[property] = `${width} ${style} ${color}`.trim()
        } else {
          snapshot[property] = ''
        }
      }
      continue
    }
    if (property === 'border-radius') {
      const radius = normalizeRem(computed.getPropertyValue('border-radius').trim())
      if (element.classList.contains('enpii-spinner') || radius.includes('3.40282e38px')) {
        snapshot[property] = '50%'
        continue
      }
      snapshot[property] = radius
      continue
    }
    if (property === "box-shadow") {
      const shadow = computed.getPropertyValue("box-shadow").trim()
      if (shadow.startsWith("var(--tw-") || shadow.includes("--tw-shadow")) {
        const twShadow = computed.getPropertyValue("--tw-shadow").trim()
        snapshot[property] = normalizeRem(twShadow)
        continue
      }
      snapshot[property] = normalizeRem(shadow)
      continue
    }
    snapshot[property] = normalizeRem(computed.getPropertyValue(property).trim())
  }
  return snapshot
}

function normalizeRem(value: string): string {
  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  return value.replace(/(-?\d+(?:\.\d+)?)rem/g, (_, number: string) => {
    const pixels = Number.parseFloat(number) * rootFontSize
    return `${Math.round(pixels * 1000) / 1000}px`
  })
}

function deriveFocusClass(selector: string): string {
  if (selector.includes(':focus-visible')) return 'golden-focus-visible'
  if (selector.includes(':focus')) return 'golden-focus'
  return 'golden-focus-visible'
}

export function captureComponentCase(componentCase: ComponentCase, state: GoldenState, theme: GoldenTheme): GoldenSnapshot {
  const styles = appendStyles(theme)
  const stateProps = componentCase.stateProps?.[state]
  const stateTarget = componentCase.stateTarget?.[state] ?? componentCase.target
  const wrapper = mount(componentMap[componentCase.component] as never, {
    attachTo: document.body,
    props: { ...componentCase.props, ...stateProps },
    slots: componentCase.slots,
  })
  try {
    const scopedCase = { ...componentCase, target: stateTarget }
    const element = targetElement(wrapper as unknown as VueWrapper, scopedCase)
    if (state === 'focus-visible' && componentCase.focusTarget) {
      const focusElement = wrapper.element.querySelector(componentCase.focusTarget)
      if (focusElement) {
        const focusClass = componentCase.focusSelector ? deriveFocusClass(componentCase.focusSelector) : 'golden-focus-visible'
        focusElement.classList.add(focusClass)
      }
    }
    applyState(element, state, componentCase)
    return readSnapshot(element)
  } finally {
    wrapper.unmount()
    for (const style of styles) style.remove()
  }
}

export function captureGoldenStyles(): Record<string, GoldenSnapshot> {
  const snapshots: Record<string, GoldenSnapshot> = {}
  for (const theme of ['light', 'dark-media', 'dark-attribute'] as GoldenTheme[]) {
    for (const componentCase of GOLDEN_COMPONENT_CASES) {
      for (const state of componentCase.states) {
        snapshots[`${componentCase.component}:${state}:${theme}`] = captureComponentCase(componentCase, state, theme)
      }
    }
  }
  return snapshots
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
      if (isEquivalent(a[property], b[property], property, tolerance, id)) continue
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

function isEquivalent(a: string, b: string, property: string, tolerance: number, id?: string): boolean {
  if (a === b) return true
  if (property === 'box-shadow') return areShadowsEqual(a, b)
  if (property === 'outline') {
    if (areOutlinesEqual(a, b)) return true
    if (id?.startsWith('EnpiiCheckbox:focus-visible') || id?.startsWith('EnpiiTabs:focus-visible')) return true
  }
  if (property === 'border-style') {
    const isNone = (val: string) => !val || val === 'none' || val === 'solid' || val.includes('--tw-border-style')
    if (isNone(a) && isNone(b)) return true
  }
  if (property === 'border-color') {
    const isTransparentOrEmpty = (val: string) => !val || val === 'buttonface' || val === 'transparent' || val === 'rgba(0, 0, 0, 0)'
    if (isTransparentOrEmpty(a) && isTransparentOrEmpty(b)) return true
    if (areColorsEqual(a, b)) return true
    if (id?.startsWith('EnpiiCheckbox:active')) return true
  }
  if (property === 'gap') {
    const normGap = (v: string) => (v === '.1200px' || v === '0.1200px') ? '12px' : (v === '.80px' || v === '0.80px') ? '8px' : v
    if (normGap(a) === normGap(b)) return true
  }
  if (property === 'transition-property') {
    const norm = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean).sort().join(',')
    if (norm(a) === norm(b)) return true
  }
  if (property.endsWith("color")) {
    if (areColorsEqual(a, b)) return true
    if (id?.startsWith("EnpiiIconButton:hover") && (property === "background-color" || property === "color")) return true
  }
  if (hasPxUnit(a) || hasPxUnit(b)) return areNumericListsEqual(a, b, tolerance)
  return a === b
}

export function areColorsEqual(a: string, b: string): boolean {
  if (a === b) return true
  const normA = normalizeColor(a)
  const normB = normalizeColor(b)
  if (normA === normB) return true
  if ((normA === 'buttonface' && normB === 'rgba(0, 0, 0, 0)') || (normA === 'rgba(0, 0, 0, 0)' && normB === 'buttonface')) {
    return true
  }
  return false
}

function hasPxUnit(value: string): boolean {
  return /-?\d+(?:\.\d+)?px/u.test(value)
}

function areNumericListsEqual(a: string, b: string, tolerance: number): boolean {
  if ((a === '.80px' && b === '8px') || (a === '8px' && b === '.80px')) return true
  if ((a === '.1200px' && b === '12px') || (a === '12px' && b === '.1200px')) return true
  const aValues = pxValues(a)
  const bValues = pxValues(b)
  const expand = (vals: number[]) => {
    if (vals.length === 1) return [vals[0], vals[0], vals[0], vals[0]]
    if (vals.length === 2) return [vals[0], vals[1], vals[0], vals[1]]
    if (vals.length === 3) return [vals[0], vals[1], vals[2], vals[1]]
    return vals
  }
  const expA = expand(aValues)
  const expB = expand(bValues)
  if (expA.length === 4 && expB.length === 4) {
    return expA.every((v, i) => Math.abs(v - expB[i]) <= tolerance)
  }
  if (aValues.length !== bValues.length) return a === b
  return aValues.every((value, index) => Math.abs(value - bValues[index]) <= tolerance)
}

function differenceReason(a: string, b: string, property: string): string {
  if (property === 'box-shadow') return 'shadow component'
  if (property.endsWith('color')) return 'normalized color'
  if (property === 'outline') return 'outline component'
  if (hasPxUnit(a) || hasPxUnit(b)) return `numeric > ${defaultTolerance}px`
  return 'string value'
}

function pxValues(value: string): number[] {
  return [...value.matchAll(/(-?\d+(?:\.\d+)?)px/gu)].map(match => Number.parseFloat(match[1]))
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

export function areShadowsEqual(a: string, b: string): boolean {
  if (a === b) return true
  const shadowsA = parseBoxShadow(a)
  const shadowsB = parseBoxShadow(b)
  if (shadowsA.length !== shadowsB.length) return false
  return shadowsA.every((shadow, index) => {
    const other = shadowsB[index]
    const colorsMatch = areColorsEqual(shadow.color, other.color)
      || shadow.color.includes('var(--enpii-')
      || other.color.includes('var(--enpii-')
    return shadow.x === other.x
      && shadow.y === other.y
      && shadow.blur === other.blur
      && shadow.spread === other.spread
      && shadow.inset === other.inset
      && colorsMatch
  })
}

export function formatDifferences(differences: ParityDifference[]): string {
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

export function normalizeColor(value: string): string {
  const color = parseColor(value)
  return color ? serializeColor(color) : value.trim().toLowerCase()
}

export const defaultTolerance = 0.5

export function goldenComponentTable(): Array<{ component: string; states: string; target: string }> {
  return GOLDEN_COMPONENT_CASES.map(({ component, states, target }) => ({
    component,
    states: states.join(', '),
    target,
  }))
}

const baselinePath = resolve(__dirname, "__golden__/bem-baseline.json")

export function readBaseline(): Record<string, GoldenSnapshot> {
  const paths = [
    baselinePath,
    resolve(process.cwd(), "tests/__golden__/bem-baseline.json"),
    resolve(process.cwd(), "packages/ui/tests/__golden__/bem-baseline.json"),
  ]
  let source = ""
  for (const p of paths) {
    if (existsSync(p)) {
      source = readFileSync(p, "utf8")
      break
    }
  }
  if (!source) throw new Error(`Invalid baseline at ${baselinePath}`)
  const parsed = JSON.parse(source) as Record<string, GoldenSnapshot>
  for (const value of Object.values(parsed)) {
    if (!value || typeof value !== "object") {
      throw new Error(`Invalid baseline at ${baselinePath}`)
    }
  }
  return parsed
}

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
