import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EnpiiLabel from '../src/components/EnpiiLabel.vue'

describe('EnpiiLabel', () => {
  it('renders the label contract with defaults', () => {
    const wrapper = mount(EnpiiLabel, {
      props: { for: 'field-id' },
      slots: { default: 'Full name' },
    })

    expect(wrapper.attributes('for')).toBe('field-id')
    expect(wrapper.text()).toBe('Full name')
    expect(wrapper.classes()).toEqual(expect.arrayContaining([
      'enpii-label',
      'enpii-label--md',
      'enpii-label--default',
    ]))
    expect(wrapper.classes()).not.toContain('enpii-sr-only')
  })

  it('renders size, muted tone, required marker, and screen-reader mode', () => {
    const wrapper = mount(EnpiiLabel, {
      props: { for: 'email-id', size: 'sm', tone: 'muted', required: true, hidden: true },
      slots: { default: 'Email' },
    })

    expect(wrapper.classes()).toEqual(expect.arrayContaining([
      'enpii-label--sm',
      'enpii-label--muted',
      'enpii-sr-only',
    ]))
    expect(wrapper.get('.enpii-label__required').text()).toBe('*')
    expect(wrapper.get('.enpii-label__required').attributes('aria-hidden')).toBe('true')
  })

  it('passes through classes and attributes without losing for/id behavior', () => {
    const wrapper = mount(EnpiiLabel, {
      props: { for: 'input-id' },
      attrs: { class: 'enpii-input__label block', id: 'label-id', 'aria-describedby': 'hint-id' },
      slots: { default: 'Name' },
    })

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['enpii-input__label', 'block']))
    expect(wrapper.attributes('id')).toBe('label-id')
    expect(wrapper.attributes('aria-describedby')).toBe('hint-id')
    expect(wrapper.attributes('for')).toBe('input-id')
  })
})
