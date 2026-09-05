import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EnpiiRating, EnpiiSegmentedControl } from '../src'

const segmentedOptions = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month', disabled: true },
]

describe('EnpiiRating', () => {
  it('sets integer values from star clicks and supports clearing', async () => {
    const wrapper = mount(EnpiiRating, { props: { modelValue: 3, allowClear: true } })
    const stars = wrapper.findAll('.enpii-rating__star')

    expect(stars).toHaveLength(5)
    expect(stars[2].classes()).toContain('enpii-rating__star--active')

    await stars[4].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([5])

    await wrapper.setProps({ modelValue: 5 })
    await stars[4].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
  })

  it('changes values with arrow keys', async () => {
    const wrapper = mount(EnpiiRating, { props: { modelValue: 2 } })
    const control = wrapper.get('.enpii-rating__control')

    await control.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([3])

    await wrapper.setProps({ modelValue: 3 })
    await control.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
  })

  it('ignores interaction when readonly', async () => {
    const wrapper = mount(EnpiiRating, { props: { modelValue: 2, readonly: true } })
    const stars = wrapper.findAll('.enpii-rating__star')

    await stars[3].trigger('click')
    await wrapper.get('.enpii-rating__control').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.get('.enpii-rating__control').attributes('aria-valuenow')).toBe('2')
  })
})

describe('EnpiiSegmentedControl', () => {
  it('selects an option and updates the active state', async () => {
    const wrapper = mount(EnpiiSegmentedControl, {
      props: { options: segmentedOptions, modelValue: 'day' },
    })

    await wrapper.findAll('.enpii-segmented-control__option')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['week'])

    await wrapper.setProps({ modelValue: 'week' })
    expect(wrapper.get('[role="radio"][aria-checked="true"]').text()).toBe('Week')
  })

  it('moves through enabled options with arrow keys and skips disabled options', async () => {
    const wrapper = mount(EnpiiSegmentedControl, {
      props: { options: segmentedOptions, modelValue: 'day' },
    })
    const radios = wrapper.findAll('[role="radio"]')

    expect(radios.map((radio) => radio.attributes('tabindex'))).toEqual(['0', '-1', '-1'])

    await wrapper.get('[role="radiogroup"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['week'])
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)

    await wrapper.setProps({ modelValue: 'week' })
    await wrapper.get('[role="radiogroup"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['day'])
    expect(radios[2].attributes('tabindex')).toBe('-1')
  })

  it('supports inline modifier prop and backward-compatible block prop', () => {
    const defaultWrapper = mount(EnpiiSegmentedControl, {
      props: { options: segmentedOptions, modelValue: 'day' },
    })
    expect(defaultWrapper.classes()).toContain('enpii-segmented-control')
    expect(defaultWrapper.classes()).not.toContain('enpii-segmented-control--inline')

    const inlineWrapper = mount(EnpiiSegmentedControl, {
      props: { options: segmentedOptions, modelValue: 'day', inline: true },
    })
    expect(inlineWrapper.classes()).toContain('enpii-segmented-control--inline')

    const blockWrapper = mount(EnpiiSegmentedControl, {
      props: { options: segmentedOptions, modelValue: 'day', block: true },
    })
    expect(blockWrapper.classes()).toContain('enpii-segmented-control--block')
  })
})
