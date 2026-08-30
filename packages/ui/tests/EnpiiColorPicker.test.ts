import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EnpiiColorPicker } from '../src'

describe('EnpiiColorPicker', () => {
  it('renders sliders, hex input, preview, and swatches', () => {
    const wrapper = mount(EnpiiColorPicker, { props: { modelValue: '#4f46e5' } })

    expect(wrapper.find('.enpii-color-picker__area').exists()).toBe(true)
    expect(wrapper.find('.enpii-color-picker__slider--hue[role="slider"]').exists()).toBe(true)
    expect(wrapper.find('.enpii-color-picker__hex-input').element.value).toBe('#4f46e5')
    expect(wrapper.findAll('.enpii-color-picker__swatch').length).toBeGreaterThan(0)
    expect(wrapper.find('.enpii-color-picker__preview').exists()).toBe(true)
    expect(wrapper.find('.enpii-color-picker__slider--alpha').exists()).toBe(false)
  })

  it('shows alpha slider when showAlpha is true', () => {
    const wrapper = mount(EnpiiColorPicker, {
      props: { modelValue: '#4f46e5ff', showAlpha: true },
    })

    expect(wrapper.find('.enpii-color-picker__slider--alpha').exists()).toBe(true)
  })

  it('emits update:modelValue and change when selecting a swatch', async () => {
    const wrapper = mount(EnpiiColorPicker, {
      props: { modelValue: '#4f46e5', swatches: ['#ba1a1a'] },
    })

    await wrapper.get('.enpii-color-picker__swatch').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('#ba1a1a')
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe('#ba1a1a')
  })

  it('accepts valid hex input and emits change', async () => {
    const wrapper = mount(EnpiiColorPicker, { props: { modelValue: '#4f46e5' } })
    const input = wrapper.get('.enpii-color-picker__hex-input')
    const el = input.element as HTMLInputElement
    el.value = '#006d3d'
    await input.trigger('input')
    await input.trigger('change')

    const lastModel = wrapper.emitted('update:modelValue')?.at(-1)?.[0]
    const lastChange = wrapper.emitted('change')?.at(-1)?.[0]
    expect(lastModel).toBe('#006d3d')
    expect(lastChange).toBe('#006d3d')
  })

  it('ignores invalid hex input', async () => {
    const wrapper = mount(EnpiiColorPicker, { props: { modelValue: '#4f46e5' } })
    const input = wrapper.get('.enpii-color-picker__hex-input')
    input.element.value = '#zzz'
    await input.trigger('change')

    const hasChangeToInvalid = wrapper.emitted('change')?.some(
      (args: any[]) => args[0] === '#zzz'
    )
    expect(hasChangeToInvalid).toBeFalsy()
  })

  it('supports keyboard hue adjustment via arrow keys', async () => {
    const wrapper = mount(EnpiiColorPicker, {
      props: { modelValue: '#ff0000', showAlpha: false },
    })
    const hueSlider = wrapper.get('.enpii-color-picker__slider--hue[role="slider"]')
    const initVal = Number(hueSlider.attributes('aria-valuenow'))

    await hueSlider.trigger('keydown', { key: 'ArrowRight' })
    expect(Number(hueSlider.attributes('aria-valuenow'))).toBe(initVal + 1)

    await hueSlider.trigger('keydown', { key: 'ArrowRight', shiftKey: true })
    expect(Number(hueSlider.attributes('aria-valuenow'))).toBe(initVal + 11)

    await hueSlider.trigger('keydown', { key: 'ArrowLeft' })
    expect(Number(hueSlider.attributes('aria-valuenow'))).toBe(initVal + 10)
  })

  it('supports keyboard alpha adjustment via arrow keys', async () => {
    const wrapper = mount(EnpiiColorPicker, {
      props: { modelValue: '#4f46e5ff', showAlpha: true },
    })
    const alphaSlider = wrapper.get('.enpii-color-picker__slider--alpha[role="slider"]')

    expect(alphaSlider.attributes('aria-valuenow')).toBe('100')

    await alphaSlider.trigger('keydown', { key: 'ArrowLeft' })
    expect(alphaSlider.attributes('aria-valuenow')).toBe('99')

    await alphaSlider.trigger('keydown', { key: 'ArrowLeft', shiftKey: true })
    expect(alphaSlider.attributes('aria-valuenow')).toBe('89')
  })

  it('does not emit when disabled', async () => {
    const wrapper = mount(EnpiiColorPicker, {
      props: { modelValue: '#4f46e5', disabled: true, swatches: ['#ba1a1a'] },
    })

    expect(wrapper.find('.enpii-color-picker--disabled').exists()).toBe(true)
    expect(wrapper.get('.enpii-color-picker__swatch').attributes('disabled')).toBeDefined()
    expect(wrapper.get('.enpii-color-picker__hex-input').attributes('disabled')).toBeDefined()

    await wrapper.get('.enpii-color-picker__swatch').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('uses aria attributes correctly on sliders', () => {
    const wrapper = mount(EnpiiColorPicker, {
      props: { modelValue: '#4f46e5', showAlpha: true, disabled: true },
    })
    const hueSlider = wrapper.get('.enpii-color-picker__slider--hue[role="slider"]')
    const alphaSlider = wrapper.get('.enpii-color-picker__slider--alpha[role="slider"]')

    expect(hueSlider.attributes('role')).toBe('slider')
    expect(hueSlider.attributes('aria-valuemin')).toBe('0')
    expect(hueSlider.attributes('aria-valuemax')).toBe('360')
    expect(hueSlider.attributes('aria-disabled')).toBe('true')
    expect(alphaSlider.attributes('role')).toBe('slider')
    expect(alphaSlider.attributes('aria-valuemin')).toBe('0')
    expect(alphaSlider.attributes('aria-valuemax')).toBe('100')
    expect(alphaSlider.attributes('aria-disabled')).toBe('true')
  })
})
