import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EnpiiOtpInput from '../src/components/EnpiiOtpInput.vue'

describe('EnpiiOtpInput', () => {
  it('renders the correct number of input fields', () => {
    const wrapper = mount(EnpiiOtpInput, {
      props: { length: 4 },
    })

    const fields = wrapper.findAll('.enpii-otp-input__field')
    expect(fields).toHaveLength(4)
  })

  it('renders default 6 fields', () => {
    const wrapper = mount(EnpiiOtpInput)

    const fields = wrapper.findAll('.enpii-otp-input__field')
    expect(fields).toHaveLength(6)
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(EnpiiOtpInput, {
      props: { modelValue: '', length: 4 },
      attachTo: document.body,
    })

    const fields = wrapper.findAll('.enpii-otp-input__field')
    const input = fields[0].element as HTMLInputElement
    input.value = '1'
    await fields[0].trigger('input')

    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted.length).toBeGreaterThanOrEqual(1)
    const lastValue = emitted[emitted.length - 1][0] as string
    expect(lastValue).toContain('1')
    wrapper.unmount()
  })

  it('emits complete when all digits filled', async () => {
    const wrapper = mount(EnpiiOtpInput, {
      props: { modelValue: '1234', length: 4 },
    })

    const emitted = wrapper.emitted('complete')!
    expect(emitted).toBeTruthy()
    expect(emitted[0]).toEqual(['1234'])
  })

  it('handles paste of full code', async () => {
    const wrapper = mount(EnpiiOtpInput, {
      props: { modelValue: '', length: 4 },
      attachTo: document.body,
    })

    const fields = wrapper.findAll('.enpii-otp-input__field')
    const pasteEvent = new Event('paste', { bubbles: true }) as any
    pasteEvent.clipboardData = {
      getData: () => '5678',
    }
    pasteEvent.preventDefault = () => {}
    fields[0].element.dispatchEvent(pasteEvent)
    await wrapper.vm.$nextTick()

    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted.length).toBeGreaterThanOrEqual(1)
    const lastValue = emitted[emitted.length - 1][0] as string
    expect(lastValue).toBe('5678')
    wrapper.unmount()
  })

  it('handles backspace to clear and move back', async () => {
    const wrapper = mount(EnpiiOtpInput, {
      props: { modelValue: '12', length: 4 },
      attachTo: document.body,
    })

    const fields = wrapper.findAll('.enpii-otp-input__field')
    await fields[1].trigger('keydown', { key: 'Backspace' })

    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted.length).toBeGreaterThanOrEqual(1)
    const lastValue = emitted[emitted.length - 1][0] as string
    expect(lastValue).toBe('1')
    wrapper.unmount()
  })

  it('renders separator between fields', () => {
    const wrapper = mount(EnpiiOtpInput, {
      props: { length: 4, separator: '-' },
    })

    const separators = wrapper.findAll('.enpii-otp-input__separator')
    expect(separators).toHaveLength(3)
    expect(separators[0].text()).toBe('-')
  })

  it('shows disabled state', () => {
    const wrapper = mount(EnpiiOtpInput, {
      props: { disabled: true },
    })

    expect(wrapper.find('.enpii-otp-input--disabled').exists()).toBe(true)
    const fields = wrapper.findAll('.enpii-otp-input__field')
    fields.forEach((field) => {
      expect(field.attributes('disabled')).toBeDefined()
    })
  })
})
