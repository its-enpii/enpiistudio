import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EnpiiCalendar } from '../src'

const events = [{ date: '2026-01-07', count: 3 }, { date: '2026-01-14', label: 'Release' }]

function mountCalendar(props = {}) {
  return mount(EnpiiCalendar, {
    props: { modelValue: null, month: new Date(2026, 0, 1), events, ...props },
  })
}

describe('EnpiiCalendar', () => {
  it('renders a six-week grid and event markers', () => {
    const wrapper = mountCalendar()

    expect(wrapper.findAll('[role="gridcell"]')).toHaveLength(42)
    expect(wrapper.get('[data-date="2026-01-07"] .enpii-calendar__marker').exists()).toBe(true)
    expect(wrapper.get('[data-date="2026-01-14"] .enpii-calendar__marker').exists()).toBe(true)
  })

  it('selects a date, emits it, and updates v-model', async () => {
    const wrapper = mountCalendar()

    await wrapper.get('[data-date="2026-01-08"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([new Date(2026, 0, 8)])
    expect(wrapper.emitted('change')?.[0]).toEqual([new Date(2026, 0, 8)])
  })

  it('blocks dates outside minDate and maxDate', async () => {
    const wrapper = mountCalendar({ minDate: new Date(2026, 0, 5), maxDate: new Date(2026, 0, 20) })

    expect(wrapper.get('[data-date="2026-01-04"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-date="2026-01-21"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('[data-date="2026-01-06"]').attributes('disabled')).toBeUndefined()
    await wrapper.get('[data-date="2026-01-04"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('navigates months, supports weekStart, and shows week numbers', async () => {
    const wrapper = mountCalendar({ weekStart: 1, showWeekNumbers: true })

    expect(wrapper.get('.enpii-calendar__week').text()).toContain('#')
    expect(wrapper.get('.enpii-calendar__week').text()).toContain('Sen')
    await wrapper.get('.enpii-calendar__nav').trigger('click')
    expect(wrapper.emitted('update:month')?.[0]).toEqual([new Date(2025, 11, 1)])
  })

  it('moves focus with keyboard and selects on Enter', async () => {
    const wrapper = mountCalendar()

    await wrapper.get('[data-date="2026-01-01"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:month')).toBeUndefined()
    await wrapper.get('[data-date="2026-01-02"]').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([new Date(2026, 0, 2)])
  })
})
