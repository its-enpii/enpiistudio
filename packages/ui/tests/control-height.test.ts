import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  EnpiiButton,
  EnpiiInput,
  EnpiiSegmentedControl,
  EnpiiSmartSelect,
} from '../src'

const css = readFileSync(resolve(__dirname, '../src/styles/components.css'), 'utf8')
const twCss = readFileSync(resolve(__dirname, '../entry.tailwind.css'), 'utf8')
const inputVue = readFileSync(resolve(__dirname, '../src/components/EnpiiInput.vue'), 'utf8')
const currencyVue = readFileSync(resolve(__dirname, '../src/components/EnpiiCurrencyInput.vue'), 'utf8')
const inputMaskVue = readFileSync(resolve(__dirname, '../src/components/EnpiiInputMask.vue'), 'utf8')

const vueMinH: Record<string, string> = {
  '.enpii-input__control': inputVue,
  '.enpii-currency-input__control': currencyVue,
  '.enpii-input-mask__control': inputMaskVue,
}

function readRule(selector: string) {
  if (selector === '.enpii-button') {
    const rule = twCss.match(/@utility min-h-control\s*\{[^}]*\}/)
    expect(rule, 'utility min-h-control must exist in entry.tailwind.css').toBeTruthy()
    return rule![0]
  }
  if (vueMinH[selector]) {
    // Tailwind-rewritten components declare min-height via min-h-control utility in template
    expect(vueMinH[selector], `${selector} must declare min-h-control in template`).toMatch(/min-h-control/)
    return 'min-height: var(--enpii-control-height)'
  }
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const rule = css.match(new RegExp(`${escapedSelector}\\{[^}]*\\}`))
  expect(rule, `rule for ${selector} must exist in components.css`).toBeTruthy()
  return rule![0]
}

describe('field control height contract (styles/components.css)', () => {
  const controlSelectors = [
    '.enpii-button',
    '.enpii-currency-input__control',
    '.enpii-date-picker__control',
    '.enpii-input__control',
    '.enpii-input-mask__control',
    '.enpii-segmented-control',
    '.enpii-smart-select__trigger',
    '.enpii-tag-input__control',
  ]

  it.each(controlSelectors)('%s uses the base control-height token', (selector) => {
    expect(readRule(selector)).toMatch(/(min-height|height):\s*var\(--enpii-control-height\)/)
  })

  it('bounds SegmentedControl to the rendered control-height tokens', () => {
    const baseRule = readRule('.enpii-segmented-control')
    expect(baseRule).toMatch(/box-sizing:\s*border-box/)
    expect(baseRule).toMatch(/height:\s*var\(--enpii-control-height\)/)
    expect(css).toMatch(
      /\.enpii-segmented-control__option\{[^}]*align-self:\s*stretch;height:\s*auto/,
    )
    expect(readRule('.enpii-segmented-control__indicator')).toMatch(/inset-block:\s*\.25rem/)
  })

  it('declares matching small control-height tokens', () => {
    expect(twCss).toMatch(/@utility min-h-control-sm\s*\{\s*min-height:\s*var\(--enpii-control-height-sm\)/)
    expect(readRule('.enpii-segmented-control--sm')).toMatch(
      /height:\s*var\(--enpii-control-height-sm\)/,
    )
  })

  it('mounts the default one-row controls covered by the base height contract', () => {
    const container = document.createElement('div')
    container.style.display = 'flex'
    container.style.alignItems = 'stretch'
    container.style.height = '48px'
    document.body.append(container)

    mount(EnpiiInput, { props: { hideLabel: true, label: 'Name' }, attachTo: container })
    mount(EnpiiSmartSelect, {
      props: { hideLabel: true, label: 'Role', options: [{ value: 'admin', label: 'Admin' }] },
      attachTo: container,
    })
    mount(EnpiiSegmentedControl, {
      props: { options: [{ value: 'day', label: 'Day' }], modelValue: 'day' },
      attachTo: container,
    })
    mount(EnpiiButton, { props: { size: 'default' }, slots: { default: 'Save' }, attachTo: container })

    const renderedSelectors = [
      '.enpii-input__control',
      '.enpii-smart-select__trigger',
      '.enpii-segmented-control',
      '.enpii-button',
    ].map((selector) => {
      expect(container.querySelector<HTMLElement>(selector), selector).toBeTruthy()
      return selector
    })

    expect(renderedSelectors).toHaveLength(4)
    container.remove()
  })
})
