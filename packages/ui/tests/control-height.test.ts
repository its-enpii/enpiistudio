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

function readRule(selector: string) {
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
    '.enpii-smart-select__trigger',
    '.enpii-tag-input__control',
  ]

  it.each(controlSelectors)('%s uses the base control-height token', (selector) => {
    expect(readRule(selector)).toMatch(/min-height:\s*var\(--enpii-control-height\)/)
  })

  it('declares matching small control-height tokens', () => {
    expect(readRule('.enpii-button--sm')).toMatch(/min-height:\s*var\(--enpii-control-height-sm\)/)
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
