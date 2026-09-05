import { mount, type VueWrapper } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
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

const stateSelectors: Partial<Record<GoldenState, string>> = {
  hover: ':hover',
  active: ':active',
  disabled: ':disabled',
  'focus-visible': ':focus-visible',
}

const uiDirectory = resolve(process.cwd())
const transitionZeroCss = `
*, *::before, *::after {
  transition-duration: 0s !important;
  transition-delay: 0s !important;
  animation-duration: 0s !important;
  animation-delay: 0s !important;
}
.golden-hover:hover,
.golden-active:active,
.golden-disabled:disabled,
.golden-focus-visible:focus-visible {
  --golden-state: active;
}
`

function extractCustomProperties(css: string): Map<string, string> {
  const properties = new Map<string, string>()
  const pattern = /(--enpii-[a-z0-9-]+)\s*:\s*([^;}]+)/gi
  for (const match of css.matchAll(pattern)) {
    const [, name, rawValue] = match
    const value = rawValue.trim()
    if (name === '--enpii-font-sans') {
      properties.set(name, 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif')
      continue
    }
    properties.set(name, value)
  }
  return properties
}

function extractBaseCustomProperties(css: string): Map<string, string> {
  const rootStart = css.indexOf(':root')
  const rootEnd = css.indexOf('}', rootStart)
  if (rootStart < 0 || rootEnd <= rootStart) {
    throw new Error('Unable to locate base :root token block')
  }
  return extractCustomProperties(css.slice(rootStart, rootEnd))
}

function extractBlock(source: string, startMarker: string): string {
  const start = source.indexOf(startMarker)
  if (start < 0) throw new Error(`Unable to locate CSS block ${startMarker}`)
  let depth = 0
  for (let index = start; index < source.length; index += 1) {
    if (source[index] === '{') {
      depth += 1
      continue
    }
    if (source[index] === '}') {
      depth -= 1
      if (depth === 0) return source.slice(start, index + 1)
    }
  }
  throw new Error(`Unable to close CSS block ${startMarker}`)
}

function replaceVariablesWithFallback(source: string, values: Map<string, string>): string {
  return source.replace(/var\((--enpii-[a-z0-9-]+)(?:,[^)]*)?\)/gi, (match, name: string) => (
    values.get(name.toLowerCase()) ?? match
  ))
}

function expandColorMix(source: string): string {
  const colorMixPattern = /color-mix\(in\s+srgb,\s*(?:([^,]+?)\s+([.\d]+%)|([^,]+?)\s*\/\s*([.\d]+%)),\s*([^,]+)\)/g
  return source.replace(colorMixPattern, (match, first?: string, firstPercent?: string, slashFirst?: string, slashPercent?: string, second?: string) => {
    const color = first ?? slashFirst
    const opacityPercent = firstPercent ?? slashPercent
    if (!color || !opacityPercent || !second) return match
    const opacity = Number.parseFloat(opacityPercent) / 100
    const firstAlpha = parseColor(color)
    const secondAlpha = parseColor(second)
    if (!firstAlpha || !secondAlpha) return match
    return serializeColor(blendColors(firstAlpha, secondAlpha, opacity))
  })
}

function blendColors(first: RGBAColor, second: RGBAColor, firstWeight: number): RGBAColor {
  const secondWeight = 1 - firstWeight
  const alpha = first.alpha * firstWeight + second.alpha * secondWeight
  if (alpha === 0) return { red: 0, green: 0, blue: 0, alpha: 0 }
  return {
    red: (first.red * first.alpha * firstWeight + second.red * second.alpha * secondWeight) / alpha,
    green: (first.green * first.alpha * firstWeight + second.green * second.alpha * secondWeight) / alpha,
    blue: (first.blue * first.alpha * firstWeight + second.blue * second.alpha * secondWeight) / alpha,
    alpha,
  }
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
  const normalized = value.trim().toLowerCase()
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
  const hexMatch = normalized.match(/^#(?:([0-9a-f])([0-9a-f])([0-9a-f])|([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})|([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}))$/)
  if (hexMatch) {
    if (hexMatch[1]) {
      return {
        red: Number.parseInt(`${hexMatch[1]}${hexMatch[1]}`, 16),
        green: Number.parseInt(`${hexMatch[2]}${hexMatch[2]}`, 16),
        blue: Number.parseInt(`${hexMatch[3]}${hexMatch[3]}`, 16),
        alpha: 1,
      }
    }
    const red = hexMatch[4] ?? hexMatch[7]
    const green = hexMatch[5] ?? hexMatch[8]
    const blue = hexMatch[6] ?? hexMatch[9]
    return {
      red: Number.parseInt(red, 16),
      green: Number.parseInt(green, 16),
      blue: Number.parseInt(blue, 16),
      alpha: hexMatch[10] ? Number.parseInt(hexMatch[10], 16) / 255 : 1,
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

function appendStyles(theme: GoldenTheme): HTMLStyleElement[] {
  const tokens = readFileSync(resolve(uiDirectory, 'src/styles/tokens.css'), 'utf8')
  const components = readFileSync(resolve(uiDirectory, 'src/styles/components.css'), 'utf8')
  const tokenValues = extractBaseCustomProperties(tokens)

  if (theme === 'dark-media' || theme === 'dark-attribute') {
    const darkBlock = theme === 'dark-media'
      ? extractBlock(tokens, '@media (prefers-color-scheme: dark)')
      : extractBlock(tokens, "[data-theme='dark']")
    for (const match of darkBlock.matchAll(/(--enpii-[a-z0-9-]+)\s*:\s*([^;}]+)/g)) {
      tokenValues.set(match[1], match[2].trim())
    }
  }

  let css = replaceVariablesWithFallback(components, tokenValues)
  css = expandColorMix(css)
  css = css.replace(/background:/g, 'background-color:')
  css = css.replace(/transition:([^;}]+)/g, (_, value: string) => `transition-property:${value.split(/,(?![^()]*\))/).map(part => part.trim().split(/\s+/)[0]).join(', ')}`)
  css = addStateAliases(css, componentStateSelectors())
  css += transitionZeroCss

  const base = document.createElement('style')
  base.textContent = css
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
  let result = selectors.reduce((current, [selector, state]) => {
    const stateMarker = selector.lastIndexOf(`:${state}`)
    if (stateMarker < 0) return current
    const aliasSelector = `${selector.slice(0, stateMarker)}.golden-${state}`
    return current.replaceAll(selector, `${selector}, ${aliasSelector}`)
  }, css)
  for (const selector of componentFocusSelectors()) {
    const state = selector.includes(':focus-visible') ? 'focus-visible' : 'focus'
    const stateMarker = selector.lastIndexOf(`:${state}`)
    if (stateMarker < 0) continue
    const aliasSelector = `${selector.slice(0, stateMarker)}.golden-${state}`
    result = result.replaceAll(selector, `${selector}, ${aliasSelector}`)
  }
  return result
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

export function goldenComponentTable(): Array<{ component: string; states: string; target: string }> {
  return GOLDEN_COMPONENT_CASES.map(({ component, states, target }) => ({
    component,
    states: states.join(', '),
    target,
  }))
}
