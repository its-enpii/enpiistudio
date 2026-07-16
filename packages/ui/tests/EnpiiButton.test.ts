import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EnpiiBadge, EnpiiButton } from '../src'

describe('EnpiiButton', () => {
  it('uses safe button semantics and preserves accessible text', () => {
    const wrapper = mount(EnpiiButton, {
      slots: { default: 'Simpan' },
    })

    expect(wrapper.get('button').attributes('type')).toBe('button')
    expect(wrapper.get('button').text()).toBe('Simpan')
  })

  it('supports native type and forwards attributes', () => {
    const wrapper = mount(EnpiiButton, {
      props: { type: 'submit' },
      attrs: { 'aria-describedby': 'save-help', name: 'save' },
    })

    const button = wrapper.get('button')
    expect(button.attributes('type')).toBe('submit')
    expect(button.attributes('aria-describedby')).toBe('save-help')
    expect(button.attributes('name')).toBe('save')
  })

  it('exposes native disabled behavior', async () => {
    const wrapper = mount(EnpiiButton, {
      props: { disabled: true },
      slots: { default: 'Simpan' },
    })

    const button = wrapper.get('button')
    expect(button.attributes()).toHaveProperty('disabled')
    await button.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })
})

describe('EnpiiBadge', () => {
  it('renders presentational text without interactive semantics', () => {
    const wrapper = mount(EnpiiBadge, {
      props: { tone: 'success', pill: true },
      slots: { default: 'Aktif' },
    })

    const badge = wrapper.get('span')
    expect(badge.text()).toBe('Aktif')
    expect(badge.classes()).toContain('enpii-badge--success')
    expect(badge.classes()).toContain('enpii-badge--pill')
    expect(badge.attributes('role')).toBeUndefined()
  })
})
