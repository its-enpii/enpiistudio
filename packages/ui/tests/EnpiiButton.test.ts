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

  it('exposes the native disabled state', () => {
    const wrapper = mount(EnpiiButton, {
      props: { disabled: true },
      slots: { default: 'Simpan' },
    })

    expect(wrapper.get('button').attributes()).toHaveProperty('disabled')
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
