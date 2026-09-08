import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EnpiiPasswordInput from '../src/components/EnpiiPasswordInput.vue'

describe('EnpiiPasswordInput', () => {
  it('emits v-model updates', async () => {
    const wrapper = mount(EnpiiPasswordInput)
    const input = wrapper.get('input')
    await input.setValue('Password123!')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['Password123!'])
  })

  it('toggles visibility with the appropriate pressed state and label', async () => {
    const wrapper = mount(EnpiiPasswordInput)
    const input = wrapper.get('input')
    const toggle = wrapper.get('.enpii-password-input__toggle')

    expect(input.attributes('type')).toBe('password')
    expect(toggle.attributes('aria-pressed')).toBe('false')
    await toggle.trigger('click')

    expect(input.attributes('type')).toBe('text')
    expect(toggle.attributes('aria-pressed')).toBe('true')
    await toggle.trigger('click')
    expect(input.attributes('type')).toBe('password')
  })

  it('calculates strength from rules and password variety', async () => {
    const wrapper = mount(EnpiiPasswordInput, {
      props: { modelValue: 'abc', rules: { minLength: 8, requireMixed: true, requireNumber: true, requireSymbol: true } },
    })

    const strength = () => wrapper.get('.enpii-password-input__strength').text()
    expect(strength()).toBe('Sangat lemah')

    await wrapper.setProps({ modelValue: 'Abcdef12!' })
    expect(strength()).toBe('Sangat kuat')

    await wrapper.setProps({ modelValue: 'Abcdefghij12!' })
    expect(strength()).toBe('Sangat kuat')
  })

  it('supports disabled and read-only states', () => {
    const disabled = mount(EnpiiPasswordInput, { props: { disabled: true } })
    const readonly = mount(EnpiiPasswordInput, { props: { readonly: true } })

    expect(disabled.get('input').attributes('disabled')).toBeDefined()
    expect(disabled.get('.enpii-password-input__toggle').attributes('disabled')).toBeDefined()
    expect(disabled.classes()).toContain('enpii-password-input--disabled')
    expect(readonly.get('input').attributes('readonly')).toBeDefined()
  })

  it('can hide the strength meter and toggle', () => {
    const wrapper = mount(EnpiiPasswordInput, { props: { strengthMeter: false, showToggle: false } })

    expect(wrapper.find('.enpii-password-input__meter').exists()).toBe(false)
    expect(wrapper.find('.enpii-password-input__toggle').exists()).toBe(false)
  })
})
